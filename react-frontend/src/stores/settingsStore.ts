import { create } from 'zustand';

export type AppLanguage = 'zh' | 'en' | 'id';

const STORAGE_KEY = 'lensa_language';

export const languageMeta: Record<AppLanguage, { label: string; locale: string }> = {
  zh: { label: '绠€浣撲腑鏂?', locale: 'zh-CN' },
  en: { label: 'English', locale: 'en-US' },
  id: { label: 'Bahasa Indonesia', locale: 'id-ID' },
};

export const translations = {
  zh: {
    common: {
      openMenu: '鎵撳紑鑿滃崟',
      notifications: '閫氱煡',
      currentTime: '褰撳墠鏃堕棿',
      language: '鐣岄潰璇█',
      viewAll: '鏌ョ湅鍏ㄩ儴',
      all: '鍏ㄩ儴',
    },
    welcome: {
      eyebrow: 'Visual Indonesian Learning',
      title: '鐢ㄩ暅澶存崟鎹夌敓娲伙紝椤烘墜瀛︿細鍗板凹璇€?',
      subtitle: '鎷嶄竴寮犵収鐗囷紝Lensa 浼氳瘑鍒墿浣撱€佺敓鎴愯瘝姹囧崱鐗囷紝骞舵妸浠婂ぉ鐨勫涔犺妭濂忔暣鐞嗗ソ銆?',
      overview: '浠婃棩瀛︿範姒傝',
      immersion: '浠婃棩娌夋蹈',
      words: '绱璇嶆眹',
      accuracy: '缁冧範姝ｇ‘鐜?',
    },
    upload: {
      eyebrow: 'Start with a photo',
      title: '鎶婄溂鍓嶇殑鐗╁搧鍙樻垚浠婂ぉ鐨勫涔犲崱鐗?',
      subtitle: '鏀寔鎷嶇収銆佷笂浼犲拰鎷栨嫿鍥剧墖銆傚缓璁€夋嫨娓呮櫚銆佷富浣撶獊鍑虹殑鐢熸椿鍦烘櫙銆?',
      camera: '鎷嶇収',
      upload: '涓婁紶鍥剧墖',
      drag: '鎷栨嫿涓婁紶',
      previewAlt: '寰呯敓鎴愮殑鍥剧墖棰勮',
      placeholderTitle: '鐐瑰嚮閫夋嫨锛屾垨鎶婂浘鐗囨嫋鍒拌繖閲?',
      placeholderHint: '鏀寔 JPG / JPEG / PNG锛屽缓璁皬浜?10MB',
      chooseAgain: '閲嶆柊閫夋嫨鍥剧墖',
      openCamera: '鎵撳紑鎽勫儚澶?',
      chooseImage: '閫夋嫨鍥剧墖',
      clear: '娓呴櫎',
      generating: '姝ｅ湪鐢熸垚瀛︿範鍐呭...',
      generate: '鐢熸垚瀛︿範鍐呭',
      chooseFirst: '鍏堥€夋嫨涓€寮犲浘鐗?',
    },
    recent: {
      eyebrow: 'Recently captured',
      title: '鏈€杩戝涔?',
      completed: '宸插畬鎴?',
      learnedOneHour: '瀛︿範浜?1 灏忔椂鍓?',
      learnedThreeHours: '瀛︿範浜?3 灏忔椂鍓?',
      learnedYesterday: '瀛︿範浜庢槰澶?',
      coffee: '鍜栧暋',
      bag: '鍖?',
      bicycle: '鑷杞?',
    },
    quickActions: {
      eyebrow: 'Next steps',
      title: '鎺ヤ笅鏉ュ彲浠ヨ繖鏍峰',
      practiceTitle: '濉┖缁冧範',
      practiceDesc: '鐢ㄥ垰鐢熸垚鐨勮瘝姹囧崱鍋氬嵆鏃剁粌涔狅紝鎶?鐪嬭繃"鍙樻垚"璁颁綇"銆?',
      practiceButton: '寮€濮嬬粌涔?',
      ankiTitle: 'Anki 瀵煎嚭',
      ankiDesc: '涓€閿暣鐞嗘垚鍙涔犵殑鍗＄墖鍖咃紝閫傚悎闂撮殧閲嶅瀛︿範銆?',
      ankiButton: '瀵煎嚭鍗＄墖',
      reportTitle: '瀛︿範鎶ュ憡',
      reportDesc: '鏌ョ湅璇嶆眹澧為暱銆佺粌涔犳纭巼鍜岃繛缁涔犵姸鎬併€?',
      reportButton: '鏌ョ湅鎶ュ憡',
      galleryTitle: '瀛︿範鐢诲唽',
      galleryDesc: '娴忚鎵€鏈夌敓鎴愮殑瀛︿範鍗＄墖锛屽洖椤句綘鐨勮瑙夎瘝姹囨梾绋嬨€?',
      galleryButton: '娴忚鐢诲唽',
    },
    stats: {
      eyebrow: 'Progress',
      title: '瀛︿範缁熻',
      today: '浠婃棩瀛︿範',
      words: '宸插璇嶆眹',
      streak: '杩炵画瀛︿範',
      accuracy: '姝ｇ‘鐜?',
      minutes: '鍒嗛挓',
      count: '涓?',
      days: '澶?',
      noteTitle: '浠婃棩寤鸿',
      note: '鍐嶅畬鎴?1 娆℃媿鐓у涔狅紝灏辫兘琛ラ綈浠婂ぉ鐨勮瘝姹囧崱鐗囪妭濂忋€?',
    },
    gallery: {
      eyebrow: 'Gallery',
      title: '瀛︿範鐢诲唽',
      all: '鍏ㄩ儴',
      completed: '宸插畬鎴?',
      inProgress: '鏈畬鎴?',
      newest: '鏈€鏂颁紭鍏?',
      oldest: '鏈€鏃╀紭鍏?',
      emptyTitle: '杩樻病鏈夊涔犲崱鐗?',
      emptyHint: '鎷嶇収鐢熸垚瀛︿範鍐呭鍚庯紝鍗＄墖浼氳嚜鍔ㄥ嚭鐜板湪杩欓噷',
      goCapture: '鍘绘媿鐓?',
      detail: '鍗＄墖璇︽儏',
      annotations: '璇嶆眹鏍囨敞',
      task: '缁冧範棰?',
      startPractice: '寮€濮嬬粌涔?',
      saveImage: '淇濆瓨鍥剧墖',
      deleteCard: '鍒犻櫎',
      confirmDelete: '纭畾鍒犻櫎杩欏紶鍗＄墖锛?',
      words: '涓瘝姹?',
    },
    loading: '鍔犺浇涓?..',
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
      chooseFirst: 'Choose an image first',
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
      chooseFirst: 'Pilih gambar dulu',
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
