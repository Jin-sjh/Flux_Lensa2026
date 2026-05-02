import AnkiExport from '../AnkiExport';

interface AnkiExportPageProps {
  ankiUrl?: string;
  userId?: string;
}

export default function AnkiExportPage({ ankiUrl, userId }: AnkiExportPageProps) {

  return (
    <div className="anki-export-page">
      <div className="page-header">
        <h1 className="page-title">Anki 导出</h1>
        <p className="page-subtitle">将学习内容导出到 Anki 进行复习</p>
      </div>

      <AnkiExport ankiUrl={ankiUrl ?? ''} userId={userId ?? ''} />
    </div>
  );
}
