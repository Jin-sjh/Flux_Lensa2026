import { useAuth } from '../../contexts/AuthContext';
import { getLevelInfo } from '../../utils/levelUtils';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
  onNavigate?: (item: string) => void;
}

const menuItems = [
  { id: 'home', icon: '🏠', label: '首页' },
  { id: 'learning', icon: '📚', label: '开始学习' },
  { id: 'practice', icon: '✅', label: '练习记录' },
  { id: 'vocabulary', icon: '📖', label: '词汇本' },
  { id: 'anki', icon: '📤', label: 'Anki 导出' },
  { id: 'settings', icon: '⚙️', label: '设置' },
];

export default function MobileDrawer({
  isOpen,
  onClose,
  activeItem = 'home',
  onNavigate,
}: MobileDrawerProps) {
  const { user } = useAuth();
  const levelInfo = getLevelInfo(user?.cefrLevel ?? null);

  const handleNavigate = (id: string) => {
    onNavigate?.(id);
    onClose();
  };

  return (
    <>
      <div
        className={`drawer-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />
      <aside className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-logo">
            <div className="drawer-logo-icon">🔮</div>
            <div className="drawer-logo-text">
              <h2>Lensa</h2>
              <p>用你的世界学印尼语</p>
            </div>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="关闭菜单">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="drawer-nav">
          {menuItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`drawer-nav-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => handleNavigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="drawer-user-level">
          <div className="level-label">我的水平</div>
          <div
            className="level-badge"
            style={{ backgroundColor: `${levelInfo.color}20`, color: levelInfo.color, borderColor: levelInfo.color }}
          >
            {levelInfo.level}
          </div>
          <div className="level-subtitle">{levelInfo.subtitle}</div>
        </div>
      </aside>
    </>
  );
}
