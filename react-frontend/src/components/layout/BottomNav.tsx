interface BottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const tabs = [
  { id: 'home', icon: '⌂', label: '首页' },
  { id: 'practice', icon: '✓', label: '练习' },
  { id: 'gallery', icon: '▦', label: '画廊' },
  { id: 'vocabulary', icon: 'Aa', label: '词汇' },
  { id: 'profile', icon: '◎', label: '我的' },
];

export default function BottomNav({ activeTab = 'home', onTabChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`bottom-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange?.(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
