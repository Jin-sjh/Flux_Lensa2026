import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getLevelInfo } from '../../utils/levelUtils';

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (item: string) => void;
}

const menuItems = [
  { id: 'home', icon: '⌂', label: '首页' },
  { id: 'learning', icon: '◐', label: '我的学习' },
  { id: 'practice', icon: '✓', label: '练习记录' },
  { id: 'vocabulary', icon: 'Aa', label: '词汇本' },
  { id: 'gallery', icon: '▦', label: '画廊' },
  { id: 'anki', icon: '▣', label: 'Anki 导出' },
  { id: 'settings', icon: '⚙', label: '设置' },
];

export default function Sidebar({ activeItem = 'home', onNavigate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const levelInfo = getLevelInfo(user?.cefrLevel ?? null);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">L</div>
          {!isCollapsed && (
            <div className="logo-text">
              <h1>Lensa</h1>
              <p>用你的世界学印尼语</p>
            </div>
          )}
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label="切换侧边栏"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            type="button"
            key={item.id}
            className={`sidebar-nav-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => onNavigate?.(item.id)}
            title={isCollapsed ? item.label : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      {!isCollapsed && (
        <div className="sidebar-user-level">
          <div className="level-label">我的水平</div>
          <div
            className="level-badge"
            style={{ backgroundColor: `${levelInfo.color}20`, color: levelInfo.color, borderColor: levelInfo.color }}
          >
            {levelInfo.level}
          </div>
          <div className="level-subtitle">{levelInfo.subtitle}</div>
          <button type="button" className="level-detail-btn" onClick={() => onNavigate?.('settings')}>
            查看详情 →
          </button>

          <div className="sidebar-decoration">
            <svg viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 80 Q50 60 100 70 T200 65 V100 H0 Z" fill="url(#mountain-gradient)" opacity="0.1"/>
              <path d="M20 85 Q70 75 120 82 T180 78 V100 H20 Z" fill="url(#mountain-gradient)" opacity="0.15"/>
              <defs>
                <linearGradient id="mountain-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2D5016" />
                  <stop offset="100%" stopColor="#D4AF37" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      )}
    </aside>
  );
}
