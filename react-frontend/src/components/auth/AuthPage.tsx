import { useState } from 'react';
import { useAuth } from '../../stores/authStore';
import '../../styles/auth.css';

type AuthMode = 'login' | 'register';

const DEMO_EMAIL = 'demo@lensa.example.com';
const DEMO_PASSWORD = '123456';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const { login, register, isLoading, error, clearError } = useAuth();

  const isLogin = mode === 'login';
  const getErrorMessage = (err: unknown) => (
    err instanceof Error ? err.message : '请求处理失败，请稍后重试'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (isLogin) {
      if (!email || !password) {
        setLocalError('请填写邮箱和密码');
        return;
      }

      try {
        await login({ email, password });
      } catch (err) {
        setLocalError(getErrorMessage(err));
      }
      return;
    }

    if (!email || !password || !name) {
      setLocalError('请填写所有必填项');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setLocalError('密码长度至少为 6 位');
      return;
    }

    try {
      await register({ email, password, name });
    } catch (err) {
      setLocalError(getErrorMessage(err));
    }
  };

  const switchMode = (nextMode?: AuthMode) => {
    const targetMode = nextMode ?? (isLogin ? 'register' : 'login');

    if (targetMode === mode) {
      return;
    }

    setMode(targetMode);
    setLocalError('');
    clearError();
    setPassword('');
    setConfirmPassword('');
  };

  const fillDemoAccount = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setLocalError('');
    clearError();
  };

  const displayError = localError || error;

  return (
    <main className="auth-container">
      <section className="auth-card" aria-label={isLogin ? '登录 Lensa' : '注册 Lensa'}>
        <div className="auth-brand">
          <div className="auth-logo" aria-hidden="true">L</div>
          <div>
            <p className="auth-kicker">Lensa</p>
            <h1 className="auth-title">{isLogin ? '欢迎回来' : '创建账号'}</h1>
          </div>
        </div>

        <p className="auth-subtitle">
          用真实场景学习印尼语，记录你的词汇、练习与成长进度。
        </p>

        <div className="auth-tabs" role="tablist" aria-label="认证方式">
          <button
            type="button"
            role="tab"
            aria-selected={isLogin}
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            登录
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={!isLogin}
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => switchMode('register')}
          >
            注册
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">姓名</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入姓名"
                autoComplete="name"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              disabled={isLoading}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">确认密码</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                autoComplete="new-password"
                disabled={isLoading}
              />
            </div>
          )}

          {displayError && (
            <div className="auth-error" role="alert">
              {displayError}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? '处理中...' : isLogin ? '登录' : '注册'}
          </button>
        </form>

        <p className="auth-footer">
          {isLogin ? '还没有账号？' : '已有账号？'}
          <button type="button" className="auth-switch-btn" onClick={() => switchMode()}>
            {isLogin ? '立即注册' : '立即登录'}
          </button>
        </p>

        {isLogin && (
          <button type="button" className="auth-demo-account" onClick={fillDemoAccount}>
            默认账号：{DEMO_EMAIL} / {DEMO_PASSWORD}
          </button>
        )}
      </section>
    </main>
  );
}
