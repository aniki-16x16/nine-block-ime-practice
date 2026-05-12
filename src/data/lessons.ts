export type TrainingItem = {
  id: string;
  label: string;
  pinyin: string;
  displayPinyin?: string;
  note?: string;
};

export type Lesson = {
  id: string;
  title: string;
  focus: string;
  level: string;
  items: TrainingItem[];
};

const item = (
  id: string,
  label: string,
  pinyin: string,
  displayPinyin?: string,
  note?: string,
): TrainingItem => ({ id, label, pinyin, displayPinyin, note });

export const LESSONS: Lesson[] = [
  {
    id: "vowels-basic",
    title: "单韵母",
    focus: "a o e i u ü",
    level: "入门",
    items: [
      item("v-a", "a", "a"),
      item("v-o", "o", "o"),
      item("v-e", "e", "e"),
      item("v-i", "i", "i"),
      item("v-u", "u", "u"),
      item("v-v", "ü", "v", "ü"),
      item("v-ai", "爱", "ai"),
      item("v-ei", "诶", "ei"),
    ],
  },
  {
    id: "compound-vowels",
    title: "复韵母",
    focus: "ai ei ui ao ou iu",
    level: "基础",
    items: [
      item("cv-ai", "爱", "ai"),
      item("cv-ei", "诶", "ei"),
      item("cv-ui", "微", "ui"),
      item("cv-ao", "奥", "ao"),
      item("cv-ou", "欧", "ou"),
      item("cv-iu", "优", "iu"),
      item("cv-ie", "也", "ie"),
      item("cv-ue", "月", "ue"),
      item("cv-er", "儿", "er"),
    ],
  },
  {
    id: "nasal-vowels",
    title: "鼻韵母",
    focus: "an en in un ang eng ing ong",
    level: "基础",
    items: [
      item("nv-an", "安", "an"),
      item("nv-en", "恩", "en"),
      item("nv-in", "音", "in"),
      item("nv-un", "温", "un"),
      item("nv-vn", "云", "vn", "ün"),
      item("nv-ang", "昂", "ang"),
      item("nv-eng", "鞥", "eng"),
      item("nv-ing", "英", "ing"),
      item("nv-ong", "翁", "ong"),
    ],
  },
  {
    id: "bpmf",
    title: "b p m f",
    focus: "唇音组合",
    level: "基础",
    items: [
      item("bpmf-ba", "八", "ba"),
      item("bpmf-bo", "波", "bo"),
      item("bpmf-bi", "比", "bi"),
      item("bpmf-bu", "不", "bu"),
      item("bpmf-pa", "怕", "pa"),
      item("bpmf-po", "破", "po"),
      item("bpmf-pi", "皮", "pi"),
      item("bpmf-ma", "妈", "ma"),
      item("bpmf-me", "么", "me"),
      item("bpmf-mi", "米", "mi"),
      item("bpmf-fa", "发", "fa"),
      item("bpmf-fu", "福", "fu"),
    ],
  },
  {
    id: "dtnl",
    title: "d t n l",
    focus: "舌尖音组合",
    level: "基础",
    items: [
      item("dtnl-da", "大", "da"),
      item("dtnl-de", "的", "de"),
      item("dtnl-di", "第", "di"),
      item("dtnl-du", "读", "du"),
      item("dtnl-ta", "他", "ta"),
      item("dtnl-te", "特", "te"),
      item("dtnl-ti", "题", "ti"),
      item("dtnl-na", "那", "na"),
      item("dtnl-ni", "你", "ni"),
      item("dtnl-la", "拉", "la"),
      item("dtnl-li", "里", "li"),
      item("dtnl-lv", "绿", "lv", "lü"),
    ],
  },
  {
    id: "gkh",
    title: "g k h",
    focus: "舌根音组合",
    level: "进阶",
    items: [
      item("gkh-ga", "嘎", "ga"),
      item("gkh-ge", "个", "ge"),
      item("gkh-gu", "古", "gu"),
      item("gkh-gai", "该", "gai"),
      item("gkh-guo", "国", "guo"),
      item("gkh-ka", "卡", "ka"),
      item("gkh-kai", "开", "kai"),
      item("gkh-kou", "口", "kou"),
      item("gkh-hao", "好", "hao"),
      item("gkh-he", "和", "he"),
      item("gkh-hui", "会", "hui"),
      item("gkh-huang", "黄", "huang"),
    ],
  },
  {
    id: "jqx",
    title: "j q x",
    focus: "i ü 系列",
    level: "进阶",
    items: [
      item("jqx-ji", "机", "ji"),
      item("jqx-jia", "家", "jia"),
      item("jqx-jie", "接", "jie"),
      item("jqx-jiu", "九", "jiu"),
      item("jqx-ju", "句", "ju"),
      item("jqx-qing", "青", "qing"),
      item("jqx-qiu", "球", "qiu"),
      item("jqx-qu", "去", "qu"),
      item("jqx-xi", "西", "xi"),
      item("jqx-xian", "先", "xian"),
      item("jqx-xue", "学", "xue"),
      item("jqx-xiong", "熊", "xiong"),
    ],
  },
  {
    id: "zhchshr",
    title: "zh ch sh r",
    focus: "翘舌音组合",
    level: "进阶",
    items: [
      item("retro-zha", "扎", "zha"),
      item("retro-zhe", "这", "zhe"),
      item("retro-zhi", "知", "zhi"),
      item("retro-zhong", "中", "zhong"),
      item("retro-cha", "茶", "cha"),
      item("retro-che", "车", "che"),
      item("retro-chi", "吃", "chi"),
      item("retro-shao", "少", "shao"),
      item("retro-shi", "是", "shi"),
      item("retro-shang", "上", "shang"),
      item("retro-re", "热", "re"),
      item("retro-ri", "日", "ri"),
    ],
  },
  {
    id: "common-words",
    title: "高频词语",
    focus: "双字词连打",
    level: "实战",
    items: [
      item("word-nihao", "你好", "ni hao"),
      item("word-women", "我们", "wo men"),
      item("word-zhongguo", "中国", "zhong guo"),
      item("word-xuexi", "学习", "xue xi"),
      item("word-shenghuo", "生活", "sheng huo"),
      item("word-jintian", "今天", "jin tian"),
      item("word-mingtian", "明天", "ming tian"),
      item("word-pengyou", "朋友", "peng you"),
      item("word-gongzuo", "工作", "gong zuo"),
      item("word-shijian", "时间", "shi jian"),
      item("word-keyi", "可以", "ke yi"),
      item("word-meiyou", "没有", "mei you"),
    ],
  },
  {
    id: "mixed-core",
    title: "混合挑战",
    focus: "常用音节与词语",
    level: "挑战",
    items: [
      item("mix-ni", "你", "ni"),
      item("mix-hao", "好", "hao"),
      item("mix-wo", "我", "wo"),
      item("mix-men", "们", "men"),
      item("mix-de", "的", "de"),
      item("mix-shi", "是", "shi"),
      item("mix-zai", "在", "zai"),
      item("mix-you", "有", "you"),
      item("mix-bu", "不", "bu"),
      item("mix-le", "了", "le"),
      item("mix-ren", "人", "ren"),
      item("mix-yiqi", "一起", "yi qi"),
      item("mix-buxing", "不行", "bu xing"),
      item("mix-haode", "好的", "hao de"),
    ],
  },
];

export const ALL_TRAINING_ITEMS = LESSONS.flatMap((lesson) => lesson.items);

export const ITEM_BY_ID = new Map(
  ALL_TRAINING_ITEMS.map((trainingItem) => [trainingItem.id, trainingItem]),
);
