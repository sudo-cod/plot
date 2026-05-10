// i18n.jsx — Internationalization system for Plot
const { useState, useEffect, createContext, useContext } = React;

const TRANSLATIONS = {
  en: {
    // Navigation & Header
    plot: "plot",
    garden: "Garden",
    list: "List",
    harvest: "Harvest",
    today: "Today",
    thisWeek: "this week",
    blooms: "blooms",
    plant: "Plant",

    // Color Schemes
    scheme: {
      meadow: "Meadow",
      twilight: "Twilight",
      dawn: "Dawn",
      moss: "Moss",
    },

    // Density
    compact: "compact",
    regular: "regular",
    comfy: "comfy",

    // Tweaks Panel
    atmosphere: "Atmosphere",
    colorScheme: "Color scheme",
    density: "Density",
    time: "Time",
    fastForward: "Fast-forward",
    fastForwardHelp: "Skip ahead in time to see how the garden evolves. Recurring tasks reset each week.",
    language: "Language",
    english: "English",
    chinese: "中文",

    // Footnote
    itIs: "It's",
    plantsMessage: "Plants don't care which day you tend them. Just tend them.",

    // Days of week
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    daysShort: ["s", "m", "t", "w", "t", "f", "s"],

    // Garden
    yourPlot: "your plot",
    plants: "plants",
    tendDontRush: "tend, don't rush.",

    // Today Rail
    pending: "pending",
    allTended: "all tended.",
    nothingMore: "nothing more for today.",

    // Task Types & Species
    daisy: "daisy",
    lavender: "lavender",
    tulip: "tulip",
    sapling: "sapling",
    sprout: "sprout",

    // Task Status
    oneOff: "One-off",
    inProgress: "In progress",
    completed: "completed",
    toDo: "to do",
    perDay: "per day",
    perWeek: "per week",
    perMonth: "per month",

    // TaskDetail Panel
    statusHeader: "Status",
    completedUndo: "Completed — undo",
    markComplete: "Mark complete",
    thisDay: "This day",
    thisWeekDetail: "This week",
    thisMonth: "This month",
    bloomedFor: "Bloomed for this",
    logAnother: "— log another?",
    logSession: "Log a session",
    progressHeader: "Progress",
    recentHeader: "Recent",
    total: "Total",
    allTimeHeader: "All time",
    streak: "Streak",
    uprootPlant: "uproot this plant",

    // AddTask
    plantSeed: "plant a seed",
    whatGrowing: "What are you growing?",
    nameYourPlant: "Name your plant",
    examplePlant: "e.g. go to the gym",
    species: "Species",
    howOften: "How often?",
    timesPerDay: "times per day",
    timesPerWeek: "times per week",
    timesPerMonth: "times per month",
    totalComplete: "Total to complete",
    bloomColor: "Bloom color",
    notes: "Notes (optional)",
    notePlaceholder: "anything to remember…",
    preview: "preview",
    cancel: "cancel",
    plantIt: "Plant it",

    // Species in AddTask
    daisySubtitle: "weekly",
    lavenderSubtitle: "daily",
    tulipSubtitle: "monthly",
    saplingSubtitle: "progress",
    sproutSubtitle: "one-off",

    // ListView
    daisies: "Daisies — weekly",
    lavenders: "Lavender — daily",
    tulips: "Tulips — monthly",
    saplings: "Saplings — long progress",
    sprouts: "Sprouts — one-off",
    clearDone: "clear",
    done: "done",

    // HarvestView
    thisWeeksHarvest: "this week's harvest",
    bloomsGathered: "blooms gathered from",
    plants: "plants",
    harvestMessage: "Each bloom is a moment you tended your plot. Some weeks are abundant. Some weeks are quiet. The garden keeps growing either way.",
    everyBloom: "Every bloom this week",
    stillSeeded: "still seeded.",
    bloomsAppear: "your blooms will appear here as you tend.",
    sixWeeksBack: "Six weeks back",

    // Units
    modules: "modules",
    pages: "pages",
    unit: "unit",
  },

  zh: {
    // Navigation & Header
    plot: "计划",
    garden: "花园",
    list: "列表",
    harvest: "收获",
    today: "今天",
    thisWeek: "本周",
    blooms: "花朵",
    plant: "种植",

    // Color Schemes
    scheme: {
      meadow: "草地",
      twilight: "暮光",
      dawn: "晨光",
      moss: "苔藓",
    },

    // Density
    compact: "紧凑",
    regular: "常规",
    comfy: "舒适",

    // Tweaks Panel
    atmosphere: "氛围",
    colorScheme: "配色方案",
    density: "密度",
    time: "时间",
    fastForward: "快进",
    fastForwardHelp: "跳过时间查看花园如何演变。每周重置循环任务。",
    language: "语言",
    english: "English",
    chinese: "中文",

    // Footnote
    itIs: "今天是",
    plantsMessage: "植物不在乎你在哪一天照顾它们。只需照顾它们。",

    // Days of week
    days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
    daysShort: ["日", "一", "二", "三", "四", "五", "六"],

    // Garden
    yourPlot: "你的花园",
    plants: "株植物",
    tendDontRush: "照顾，别着急。",

    // Today Rail
    pending: "待处理",
    allTended: "全部照顾好了。",
    nothingMore: "今天没有更多事务了。",

    // Task Types & Species
    daisy: "雏菊",
    lavender: "薰衣草",
    tulip: "郁金香",
    sapling: "树苗",
    sprout: "嫩芽",

    // Task Status
    oneOff: "一次性任务",
    inProgress: "进行中",
    completed: "已完成",
    toDo: "待做",
    perDay: "每天",
    perWeek: "每周",
    perMonth: "每月",

    // TaskDetail Panel
    statusHeader: "状态",
    completedUndo: "已完成 — 撤销",
    markComplete: "标记完成",
    thisDay: "今天",
    thisWeekDetail: "本周",
    thisMonth: "本月",
    bloomedFor: "本",
    logAnother: "— 再记录一次？",
    logSession: "记录一次",
    progressHeader: "进度",
    recentHeader: "最近",
    total: "总计",
    allTimeHeader: "全部时间",
    streak: "连续",
    uprootPlant: "移除这个植物",

    // AddTask
    plantSeed: "种一颗种子",
    whatGrowing: "你想要种什么？",
    nameYourPlant: "为你的植物命名",
    examplePlant: "例如：去健身房",
    species: "物种",
    howOften: "多久一次？",
    timesPerDay: "次/天",
    timesPerWeek: "次/周",
    timesPerMonth: "次/月",
    totalComplete: "完成总数",
    bloomColor: "花朵颜色",
    notes: "备注（可选）",
    notePlaceholder: "任何要记住的事…",
    preview: "预览",
    cancel: "取消",
    plantIt: "种植",

    // Species in AddTask
    daisySubtitle: "每周",
    lavenderSubtitle: "每天",
    tulipSubtitle: "每月",
    saplingSubtitle: "进度",
    sproutSubtitle: "一次性",

    // ListView
    daisies: "雏菊 — 每周",
    lavenders: "薰衣草 — 每天",
    tulips: "郁金香 — 每月",
    saplings: "树苗 — 长期进度",
    sprouts: "嫩芽 — 一次性",
    clearDone: "清除",
    done: "已完成",

    // HarvestView
    thisWeeksHarvest: "本周的收获",
    bloomsGathered: "花朵采集自",
    plants: "株植物",
    harvestMessage: "每一朵花都是你照顾花园的一个时刻。有些周很丰富。有些周很安静。花园一直在生长。",
    everyBloom: "本周的每一朵花",
    stillSeeded: "仍未生长。",
    bloomsAppear: "当你照顾时，你的花朵会出现在这里。",
    sixWeeksBack: "六周前",

    // Units
    modules: "模块",
    pages: "页",
    unit: "单位",
  },
};

// Language Context
const LanguageContext = createContext();

// Helper to get nested translation
function getTranslation(lang, key) {
  const keys = key.split(".");
  let value = TRANSLATIONS[lang];
  for (const k of keys) {
    value = value?.[k];
  }
  return value !== undefined ? value : key;
}

// Hook for using language
function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

// Provider component
function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("plot-lang") || "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    localStorage.setItem("plot-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => getTranslation(lang, key);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
