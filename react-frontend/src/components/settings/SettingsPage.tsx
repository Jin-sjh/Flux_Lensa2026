import { useMemo } from 'react';
import { useAuth } from '../../stores/authStore';
import { useSettings } from '../../stores/settingsStore';
import type { AppLanguage } from '../../stores/settingsStore';
import type { GalleryCard } from '../../types/gallery';
import { getLevelInfo } from '../../utils/levelUtils';

interface SettingsPageProps {
  cards: GalleryCard[];
  userId: string;
  ankiUrl: string;
  onNavigate?: (item: string) => void;
}

export default function SettingsPage({ cards, userId, ankiUrl, onNavigate }: SettingsPageProps) {
  const { user, logout } = useAuth();
  const { language, setLanguage, languages, formatTime } = useSettings();
  const levelInfo = getLevelInfo(user?.cefrLevel ?? null);

  const learningSummary = useMemo(() => {
    const completedCards = cards.filter((card) => card.isCompleted).length;
    const totalWords = new Set(
      cards.flatMap((card) =>
        card.annotations.flatMap((annotation) =>
          annotation.new_words.map((word) => word.word.trim()).filter(Boolean),
        ),
      ),
    ).size;
    const latestCard = cards[0];

    return {
      completedCards,
      totalWords,
      latestLearningTime: latestCard ? new Date(latestCard.createdAt).toLocaleString() : '暂无记录',
      completionRate: cards.length ? Math.round((completedCards / cards.length) * 100) : 0,
    };
  }, [cards]);

  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '暂无记录';

  return (
    <div className="settings-page page-panel">
      <div className="page-header settings-hero">
        <div>
          <span className="eyebrow">Settings</span>
          <h1 className="page-title">学习设置</h1>
          <p className="page-subtitle">
            这里汇总账号、测评等级、语言偏好、学习卡片与 Anki 导出状态，方便你按当前学习流程继续调整。
          </p>
        </div>
        <div className="settings-clock" aria-label="当前时间">
          <span>当前时间</span>
          <strong>{formatTime()}</strong>
        </div>
      </div>

      <section className="settings-overview">
        <div className="settings-profile">
          <div className="settings-avatar">{user?.name?.slice(0, 1).toUpperCase() || 'L'}</div>
          <div>
            <h2>{user?.name || 'Lensa Learner'}</h2>
            <p>{user?.email || '未绑定邮箱'}</p>
            <span>加入时间：{memberSince}</span>
          </div>
        </div>

        <div className="settings-level-card">
          <span>当前测评等级</span>
          <strong style={{ color: levelInfo.color }}>{levelInfo.level}</strong>
          <p>{levelInfo.subtitle}阶段，系统会围绕图像识别词汇、填空练习和复习导出保持学习节奏。</p>
        </div>
      </section>

      <section className="settings-grid enriched">
        <article className="settings-card">
          <div className="settings-card-heading">
            <span className="settings-icon">文</span>
            <div>
              <h3>界面语言</h3>
              <p>语言设置会同步影响顶部时间格式、首页文案、上传区提示和图库筛选文本。</p>
            </div>
          </div>
          <label className="settings-field">
            <span>当前语言</span>
            <select
              className="settings-select"
              value={language}
              onChange={(event) => setLanguage(event.target.value as AppLanguage)}
            >
              {Object.entries(languages).map(([value, meta]) => {
                const item = meta as { label: string };
                return (
                <option key={value} value={value}>
                  {item.label}
                </option>
                );
              })}
            </select>
          </label>
          <div className="settings-note">选择后会写入本地偏好，下次打开应用会自动沿用。</div>
        </article>

        <article className="settings-card">
          <div className="settings-card-heading">
            <span className="settings-icon">卡</span>
            <div>
              <h3>学习卡片状态</h3>
              <p>统计来自当前图库数据，包含拍照生成、识别词汇、完成标记和最近一次学习时间。</p>
            </div>
          </div>
          <div className="settings-stats">
            <div>
              <strong>{cards.length}</strong>
              <span>已生成卡片</span>
            </div>
            <div>
              <strong>{learningSummary.totalWords}</strong>
              <span>累计词汇</span>
            </div>
            <div>
              <strong>{learningSummary.completionRate}%</strong>
              <span>完成比例</span>
            </div>
          </div>
          <p className="settings-small">最近学习：{learningSummary.latestLearningTime}</p>
          <button type="button" className="action-button compact" onClick={() => onNavigate?.('gallery')}>
            查看学习画廊
          </button>
        </article>

        <article className="settings-card">
          <div className="settings-card-heading">
            <span className="settings-icon">练</span>
            <div>
              <h3>练习与复习流程</h3>
              <p>当前逻辑是先拍照生成识别结果，再进入填空练习，最后可将用户卡片打包到 Anki 复习。</p>
            </div>
          </div>
          <ol className="settings-steps">
            <li>上传或拍摄生活场景图片</li>
            <li>生成标注、词汇和练习题</li>
            <li>在图库标记完成并持续复习</li>
          </ol>
          <div className="settings-actions">
            <button type="button" className="action-button compact" onClick={() => onNavigate?.('learning')}>
              开始学习
            </button>
            <button type="button" className="action-button compact" onClick={() => onNavigate?.('practice')}>
              查看练习
            </button>
          </div>
        </article>

        <article className="settings-card">
          <div className="settings-card-heading">
            <span className="settings-icon">An</span>
            <div>
              <h3>Anki 导出</h3>
              <p>导出地址会使用当前学习用户 ID，用于把生成内容整理成可复习的卡片包。</p>
            </div>
          </div>
          <div className="settings-code">
            <span>用户标识</span>
            <strong>{userId}</strong>
          </div>
          <div className="settings-actions">
            <button type="button" className="action-button compact" onClick={() => onNavigate?.('anki')}>
              打开导出页
            </button>
            <a className="settings-link-button" href={ankiUrl}>
              下载卡片包
            </a>
          </div>
        </article>

        <article className="settings-card settings-card-wide">
          <div className="settings-card-heading">
            <span className="settings-icon">账</span>
            <div>
              <h3>账号与本地数据</h3>
              <p>
                登录信息和语言偏好保存在浏览器本地；退出登录会清除当前账号会话，重新进入时需要再次登录。
              </p>
            </div>
          </div>
          <div className="settings-account-row">
            <div>
              <strong>测评状态：{user?.hasCompletedTest ? '已完成入门测评' : '未完成测评'}</strong>
              <span>系统会依据测评等级展示侧边栏等级徽章，并辅助安排后续学习。</span>
            </div>
            <button type="button" className="settings-danger-button" onClick={logout}>
              退出登录
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
