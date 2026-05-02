import { useAuth } from '../../stores/authStore';
import { getLevelInfo } from '../../utils/levelUtils';

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (item: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const menuItems = [
  { id: 'home', icon: '⌂', label: '首页', tagline: '发现之旅' },
  { id: 'learning', icon: '◐', label: '开始学习', tagline: '沉浸体验' },
  { id: 'practice', icon: '✓', label: '练习记录', tagline: '成长轨迹' },
  { id: 'vocabulary', icon: 'Aa', label: '词汇本', tagline: '知识宝库' },
  { id: 'gallery', icon: '▦', label: '画廊', tagline: '视觉记忆' },
  { id: 'anki', icon: '▣', label: 'Anki 导出', tagline: '智能复习' },
  { id: 'settings', icon: '⚙', label: '设置', tagline: '个性化' },
];

export default function Sidebar({ activeItem = 'home', onNavigate, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { user } = useAuth();
  const levelInfo = getLevelInfo(user?.cefrLevel ?? null);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-artistic-bg">
        <div className="artistic-circle circle-1"></div>
        <div className="artistic-circle circle-2"></div>
        <div className="artistic-circle circle-3"></div>
        <div className="artistic-pattern"></div>
      </div>

      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <span className="logo-letter">L</span>
            <div className="logo-shine"></div>
          </div>
          {!isCollapsed && (
            <div className="logo-text">
              <h1>Lensa</h1>
              <p>用你的世界学印尼语</p>
              <div className="logo-underline"></div>
            </div>
          )}
        </div>
      </div>

      <button
        className="sidebar-toggle"
        onClick={onToggleCollapse}
        aria-label="切换侧边栏"
      >
        <span className="toggle-icon">{isCollapsed ? '→' : '←'}</span>
      </button>

      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className={`sidebar-nav-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => onNavigate?.(item.id)}
            title={isCollapsed ? item.label : undefined}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <span className="nav-icon-wrapper">
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-icon-bg"></span>
            </span>
            {!isCollapsed && (
              <div className="nav-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-tagline">{item.tagline}</span>
              </div>
            )}
            {activeItem === item.id && <div className="active-indicator"></div>}
          </button>
        ))}
      </nav>

      {!isCollapsed && (
        <div className="sidebar-user-level">
          <div className="level-header">
            <div className="level-label">我的水平</div>
            <div className="level-badge-wrapper">
              <div
                className="level-badge"
                style={{ 
                  background: `linear-gradient(135deg, ${levelInfo.color}, ${levelInfo.color}dd)`,
                  boxShadow: `0 8px 24px ${levelInfo.color}40`
                }}
              >
                {levelInfo.level}
              </div>
              <div className="level-glow"></div>
            </div>
          </div>
          
          <div className="level-subtitle">{levelInfo.subtitle}</div>
          
          <div className="level-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '65%' }}></div>
            </div>
            <div className="progress-label">
              <span>学习进度</span>
              <span>65%</span>
            </div>
          </div>

          <button type="button" className="level-detail-btn" onClick={() => onNavigate?.('settings')}>
            <span>查看详情</span>
            <span className="btn-arrow">→</span>
          </button>

          <div className="sidebar-decoration">
            <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="decoration-svg">
              <defs>
                <linearGradient id="mountain-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2D5016" />
                  <stop offset="50%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#2D5016" />
                </linearGradient>
                <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#2D5016" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              
              <path d="M0 100 Q25 85 50 90 T100 85 T150 90 T200 80 V120 H0 Z" fill="url(#mountain-gradient)" opacity="0.08"/>
              <path d="M0 105 Q30 95 60 100 T120 95 T180 100 T200 90 V120 H0 Z" fill="url(#mountain-gradient)" opacity="0.12"/>
              
              <circle cx="170" cy="30" r="15" fill="url(#wave-gradient)" opacity="0.3"/>
              <circle cx="180" cy="40" r="8" fill="url(#wave-gradient)" opacity="0.2"/>
              
              <path d="M10 50 Q20 45 30 50 T50 48" stroke="url(#mountain-gradient)" strokeWidth="1.5" fill="none" opacity="0.15"/>
              <path d="M15 60 Q25 55 35 60 T55 58" stroke="url(#mountain-gradient)" strokeWidth="1" fill="none" opacity="0.1"/>
            </svg>
          </div>
        </div>
      )}
    </aside>
  );
}
