import { create } from 'zustand';
import type { AuthState, LoginCredentials, RegisterCredentials, User } from '../types/auth';

const STORAGE_KEY = 'lensa_auth';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  clearError: () => void;
  hydrate: () => void;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function getStoredAuth(): Pick<AuthState, 'user' | 'token'> | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const { user, token } = JSON.parse(stored) as Pick<AuthState, 'user' | 'token'>;
    return user && token ? { user, token } : null;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveAuth(user: User, token: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
}

function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  hydrate: () => {
    const stored = getStoredAuth();
    if (!stored) {
      set({ ...initialState, isLoading: false });
      return;
    }

    set({
      user: stored.user,
      token: stored.token,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { login: loginApi } = await import('../services/authApi');
      const response = await loginApi(credentials);
      saveAuth(response.user, response.token);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  register: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { register: registerApi } = await import('../services/authApi');
      const response = await registerApi(credentials);
      saveAuth(response.user, response.token);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '注册失败';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  logout: () => {
    clearStoredAuth();
    set({ ...initialState, isLoading: false });
  },

  updateUser: (user) => {
    set((state) => {
      if (state.token) {
        saveAuth(user, state.token);
      }
      return { user };
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));

export const useAuth = useAuthStore;
