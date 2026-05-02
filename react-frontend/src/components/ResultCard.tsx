interface ResultCardProps {
  imageUrl: string | null;
  isRendering: boolean;
}

export default function ResultCard({ imageUrl, isRendering }: ResultCardProps) {
  return (
    <div className="result-card">
      <div className={`result-frame ${isRendering ? 'loading' : ''}`}>
        <div className="result-image-container">
          {isRendering ? (
            <div className="result-loading">
              <div className="result-spinner" />
              <p>正在生成学习卡片...</p>
            </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt="学习卡片" className="result-image" />
          ) : (
            <div className="result-placeholder">
              <span className="result-placeholder-icon">🎴</span>
              <p>学习卡片将在这里展示</p>
            </div>
          )}
        </div>
        {imageUrl && !isRendering && (
          <div className="result-actions">
            <a
              href={imageUrl}
              download="lensa_card.png"
              className="result-action-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              💾 保存图片
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
