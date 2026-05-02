import RecentLearning from '../dashboard/RecentLearning';

interface LearningItem {
  id: string;
  word: string;
  translationKey: 'coffee' | 'bag' | 'bicycle';
  image?: string;
  learnedAtKey: 'learnedOneHour' | 'learnedThreeHours' | 'learnedYesterday';
  isCompleted: boolean;
}

interface PracticeHistoryPageProps {
  recentItems?: LearningItem[];
}

export default function PracticeHistoryPage({ recentItems }: PracticeHistoryPageProps) {

  return (
    <div className="practice-history-page">
      <div className="page-header">
        <h1 className="page-title">练习记录</h1>
        <p className="page-subtitle">查看你的学习历程和成果</p>
      </div>

      <RecentLearning items={recentItems} />
    </div>
  );
}
