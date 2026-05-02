import { create } from 'zustand';

export type AppLanguage = 'zh' | 'en' | 'id';

const STORAGE_KEY = 'lensa_language';

export const languageMeta: Record<AppLanguage, { label: string; locale: string }> = {
  zh: { label: '简体中文', locale: 'zh-CN' },
  en: { label: 'English', locale: 'en-US' },
  id: { label: 'Bahasa Indonesia', locale: 'id-ID' },
};

export const translations = {
  zh: {
    common: {
      openMenu: '打开菜单',
      notifications: '通知',
      currentTime: '当前时间',
      language: '界面语言',
      viewAll: '查看全部',
      all: '全部',
    },
    welcome: {
      eyebrow: 'Visual Indonesian Learning',
      title: '用镜头捕捉生活，顺手学会印尼语。',
      subtitle: '拍一张照片，Lensa 会识别物体、生成词汇卡片，并把今天的学习节奏整理好。',
      overview: '今日学习概览',
      immersion: '今日沉浸',
      words: '累计词汇',
      accuracy: '练习正确率',
    },
    upload: {
      eyebrow: 'Start with a photo',
      title: '把眼前的物品变成今天的学习卡片',
      subtitle: '支持拍照、上传和拖拽图片。建议选择清晰、主体突出的生活场景。',
      camera: '拍照',
      upload: '上传图片',
      drag: '拖拽上传',
      previewAlt: '待生成的图片预览',
      placeholderTitle: '点击选择，或把图片拖到这里',
      placeholderHint: '支持 JPG / JPEG / PNG，建议小于 10MB',
      chooseAgain: '重新选择图片',
      openCamera: '打开摄像头',
      chooseImage: '选择图片',
      clear: '清除',
      generating: '正在生成学习内容...',
      generate: '生成学习内容',
    },
    recent: {
      eyebrow: 'Recently captured',
      title: '最近学习',
      completed: '已完成',
      learnedOneHour: '学习了 1 小时前',
      learnedThreeHours: '学习了 3 小时前',
      learnedYesterday: '学习于昨天',
      coffee: '咖啡',
      bag: '包',
      bicycle: '自行车',
    },
    quickActions: {
      eyebrow: 'Next steps',
      title: '接下来可以这样学',
      practiceTitle: '填空练习',
      practiceDesc: '用刚生成的词汇卡片做即时练习，把"看"过"变成"记住"。',
      practiceButton: '开始练习',
      ankiTitle: 'Anki 导出',
      ankiDesc: '一键整理成可复习的卡片包，适合间隔重复学习。',
      ankiButton: '导出卡片',
      reportTitle: '学习报告',
      reportDesc: '查看词汇增长、练习正确率和连续学习状态。',
      reportButton: '查看报告',
      galleryTitle: '学习画廊',
      galleryDesc: '浏览所有生成的学习卡片，回顾你的视觉词汇旅程。',
      galleryButton: '浏览画廊',
    },
    stats: {
      eyebrow: 'Progress',
      title: '学习统计',
      today: '今日学习',
      words: '已学词汇',
      streak: '连续学习',
      accuracy: '正确率',
      minutes: '分钟',
      count: '个',
      days: '天',
      noteTitle: '今日建议',
      note: '再完成 1 次拍照学习，就能补齐今天的词汇卡片节奏。',
    },
    gallery: {
      eyebrow: 'Gallery',
      title: '学习画廊',
      all: '全部',
      completed: '已完成',
      inProgress: '未完成',
      newest: '最新优先',
      oldest: '最早优先',
      emptyTitle: '还没有学习卡片',
      emptyHint: '拍照生成学习内容后，卡片会自动出现在这里',
      goCapture: '去拍照',
      detail: '卡片详情',
      annotations: '词汇标注',
      task: '练习题',
      startPractice: '开始练习',
      saveImage: '保存图片',
      deleteCard: '删除',
      confirmDelete: '确定删除这张卡片？',
      words: '个词汇',
    },
    loading: '加载中...',
  },
  en: {
    common: {
      openMenu: 'Open menu',
      notifications: 'Notifications',
      currentTime: 'Current time',
      language: 'Interface language',
      viewAll: 'View all',
      all: 'All',
    },
    welcome: {
      eyebrow: 'Visual Indonesian Learning',
      title: 'Capture daily life and learn Indonesian as you go.',
      subtitle: 'Take a photo, and Lensa identifies objects, creates vocabulary cards, and keeps today\'s learning rhythm tidy.',
      overview: 'Today learning overview',
      immersion: 'Today focus',
      words: 'Total words',
      accuracy: 'Practice accuracy',
    },
    upload: {
      eyebrow: 'Start with a photo',
      title: 'Turn what you see into today\'s learning card',
      subtitle: 'Use camera, upload, or drag and drop. Clear daily scenes with a strong subject work best.',
      camera: 'Camera',
      upload: 'Upload',
      drag: 'Drop',
      previewAlt: 'Image preview for generation',
      placeholderTitle: 'Choose an image or drop it here',
      placeholderHint: 'JPG / JPEG / PNG supported, ideally under 10MB',
      chooseAgain: 'Choose another image',
      openCamera: 'Open camera',
      chooseImage: 'Choose image',
      clear: 'Clear',
      generating: 'Generating learning content...',
      generate: 'Generate content',
    },
    recent: {
      eyebrow: 'Recently captured',
      title: 'Recent learning',
      completed: 'Completed',
      learnedOneHour: 'Learned 1 hour ago',
      learnedThreeHours: 'Learned 3 hours ago',
      learnedYesterday: 'Learned yesterday',
      coffee: 'coffee',
      bag: 'bag',
      bicycle: 'bicycle',
    },
    quickActions: {
      eyebrow: 'Next steps',
      title: 'What to learn next',
      practiceTitle: 'Cloze practice',
      practiceDesc: 'Practice with the vocabulary cards you just made and turn recognition into memory.',
      practiceButton: 'Start practice',
      ankiTitle: 'Anki export',
      ankiDesc: 'Package your cards for spaced repetition review.',
      ankiButton: 'Export cards',
      reportTitle: 'Learning report',
      reportDesc: 'Review vocabulary growth, accuracy, and streak progress.',
      reportButton: 'View report',
      galleryTitle: 'Learning Gallery',
      galleryDesc: 'Browse all your generated learning cards and review your visual vocabulary journey.',
      galleryButton: 'Browse gallery',
    },
    stats: {
      eyebrow: 'Progress',
      title: 'Learning stats',
      today: 'Today',
      words: 'Words learned',
      streak: 'Streak',
      accuracy: 'Accuracy',
      minutes: 'min',
      count: 'words',
      days: 'days',
      noteTitle: 'Today\'s tip',
      note: 'Complete one more photo lesson to keep today\'s vocabulary rhythm on track.',
    },
    gallery: {
      eyebrow: 'Gallery',
      title: 'Learning Gallery',
      all: 'All',
      completed: 'Completed',
      inProgress: 'In Progress',
      newest: 'Newest first',
      oldest: 'Oldest first',
      emptyTitle: 'No learning cards yet',
      emptyHint: 'Cards will appear here automatically after you generate learning content from photos',
      goCapture: 'Take a photo',
      detail: 'Card detail',
      annotations: 'Vocabulary',
      task: 'Practice',
      startPractice: 'Start practice',
      saveImage: 'Save image',
      deleteCard: 'Delete',
      confirmDelete: 'Delete this card?',
      words: 'words',
    },
    loading: 'Loading...',
  },
  id: {
    common: {
      openMenu: 'Buka menu',
      notifications: 'Notifikasi',
      currentTime: 'Waktu sekarang',
      language: 'Bahasa antarmuka',
      viewAll: 'Lihat semua',
      all: 'Semua',
    },
    welcome: {
      eyebrow: 'Belajar Bahasa Indonesia Visual',
      title: 'Tangkap kehidupan sehari-hari dan belajar bahasa Indonesia.',
      subtitle: 'Ambil foto, Lensa mengenali objek, membuat kartu kosakata, dan merapikan ritme belajar hari ini.',
      overview: 'Ringkasan belajar hari ini',
      immersion: 'Fokus hari ini',
      words: 'Total kosakata',
      accuracy: 'Akurasi latihan',
    },
    upload: {
      eyebrow: 'Mulai dari foto',
      title: 'Ubah benda di sekitar menjadi kartu belajar hari ini',
      subtitle: 'Gunakan kamera, unggah, atau seret gambar. Pilih foto yang jelas dengan objek utama.',
      camera: 'Kamera',
      upload: 'Unggah',
      drag: 'Seret',
      previewAlt: 'Pratinjau gambar untuk dibuat',
      placeholderTitle: 'Pilih gambar atau seret ke sini',
      placeholderHint: 'Mendukung JPG / JPEG / PNG, sebaiknya di bawah 10MB',
      chooseAgain: 'Pilih gambar lain',
      openCamera: 'Buka kamera',
      chooseImage: 'Pilih gambar',
      clear: 'Hapus',
      generating: 'Membuat materi belajar...',
      generate: 'Buat materi',
    },
    recent: {
      eyebrow: 'Baru ditangkap',
      title: 'Belajar terbaru',
      completed: 'Selesai',
      learnedOneHour: 'Dipelajari 1 jam lalu',
      learnedThreeHours: 'Dipelajari 3 jam lalu',
      learnedYesterday: 'Dipelajari kemarin',
      coffee: 'kopi',
      bag: 'tas',
      bicycle: 'sepeda',
    },
    quickActions: {
      eyebrow: 'Langkah berikutnya',
      title: 'Belajar berikutnya',
      practiceTitle: 'Latihan isian',
      practiceDesc: 'Latih kartu kosakata yang baru dibuat agar lebih mudah diingat.',
      practiceButton: 'Mulai latihan',
      ankiTitle: 'Ekspor Anki',
      ankiDesc: 'Susun kartu untuk pengulangan berjeda.',
      ankiButton: 'Ekspor kartu',
      reportTitle: 'Laporan belajar',
      reportDesc: 'Lihat pertumbuhan kosakata, akurasi latihan, dan rentetan belajar.',
      reportButton: 'Lihat laporan',
      galleryTitle: 'Galeri Belajar',
      galleryDesc: 'Jelajahi semua kartu belajar yang dibuat dan tinjau perjalanan kosakata visual Anda.',
      galleryButton: 'Jelajahi galeri',
    },
    stats: {
      eyebrow: 'Progres',
      title: 'Statistik belajar',
      today: 'Hari ini',
      words: 'Kosakata',
      streak: 'Berturut-turut',
      accuracy: 'Akurasi',
      minutes: 'menit',
      count: 'kata',
      days: 'hari',
      noteTitle: 'Saran hari ini',
      note: 'Selesaikan 1 pelajaran foto lagi agar ritme kosakata hari ini tetap rapi.',
    },
    gallery: {
      eyebrow: 'Galeri',
      title: 'Galeri Belajar',
      all: 'Semua',
      completed: 'Selesai',
      inProgress: 'Belum selesai',
      newest: 'Terbaru',
      oldest: 'Terlama',
      emptyTitle: 'Belum ada kartu belajar',
      emptyHint: 'Kartu akan muncul di sini setelah Anda membuat konten belajar dari foto',
      goCapture: 'Ambil foto',
      detail: 'Detail kartu',
      annotations: 'Kosakata',
      task: 'Latihan',
      startPractice: 'Mulai latihan',
      saveImage: 'Simpan gambar',
      deleteCard: 'Hapus',
      confirmDelete: 'Hapus kartu ini?',
      words: 'kata',
    },
    loading: 'Memuat...',
  },
} as const;

type Translation = (typeof translations)[AppLanguage];

interface SettingsStore {
  language: AppLanguage;
  languages: typeof languageMeta;
  locale: string;
  now: Date;
  t: Translation;
  setLanguage: (language: AppLanguage) => void;
  setNow: (now: Date) => void;
  formatTime: (date?: Date) => string;
}

function getInitialLanguage(): AppLanguage {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'zh' || saved === 'en' || saved === 'id') return saved;

  const browserLanguage = navigator.language.toLowerCase();
  if (browserLanguage.startsWith('id')) return 'id';
  if (browserLanguage.startsWith('en')) return 'en';
  return 'zh';
}

function getLanguageValues(language: AppLanguage) {
  return {
    language,
    locale: languageMeta[language].locale,
    t: translations[language],
  };
}

export const useSettingsStore = create<SettingsStore>((set, get) => {
  const initialLanguage = getInitialLanguage();

  return {
    ...getLanguageValues(initialLanguage),
    languages: languageMeta,
    now: new Date(),

    setLanguage: (nextLanguage) => {
      localStorage.setItem(STORAGE_KEY, nextLanguage);
      document.documentElement.lang = languageMeta[nextLanguage].locale;
      set(getLanguageValues(nextLanguage));
    },

    setNow: (now) => {
      set({ now });
    },

    formatTime: (date) => {
      const { language, locale, now } = get();
      return (date ?? now).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: language === 'en',
      });
    },
  };
});

document.documentElement.lang = languageMeta[useSettingsStore.getState().language].locale;

let clockStarted = false;

export function startSettingsClock() {
  if (clockStarted) return;
  clockStarted = true;
  window.setInterval(() => {
    useSettingsStore.getState().setNow(new Date());
  }, 1000);
}

export const useSettings = useSettingsStore;
