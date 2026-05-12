export type TrainingItem = {
  id: string;
  label: string;
  pinyin: string;
  displayPinyin?: string;
  note?: string;
};

export type LessonMode = "pinyin" | "hanzi";

export type Lesson = {
  id: string;
  title: string;
  focus: string;
  level: string;
  mode: LessonMode;
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
    focus: "a o e i u v",
    level: "入门",
    mode: "pinyin",
    items: [
      item("v-a", "a", "a"),
      item("v-o", "o", "o"),
      item("v-e", "e", "e"),
      item("v-i", "i", "i"),
      item("v-u", "u", "u"),
      item("v-v", "v", "v", "ü"),
      item("v-ai", "ai", "ai"),
      item("v-ei", "ei", "ei"),
    ],
  },
  {
    id: "compound-vowels",
    title: "复韵母",
    focus: "ai ei ui ao ou iu",
    level: "基础",
    mode: "pinyin",
    items: [
      item("cv-ai", "ai", "ai"),
      item("cv-ei", "ei", "ei"),
      item("cv-ui", "ui", "ui"),
      item("cv-ao", "ao", "ao"),
      item("cv-ou", "ou", "ou"),
      item("cv-iu", "iu", "iu"),
      item("cv-ie", "ie", "ie"),
      item("cv-ue", "ue", "ue"),
      item("cv-er", "er", "er"),
    ],
  },
  {
    id: "nasal-vowels",
    title: "鼻韵母",
    focus: "an en in un vn ang eng ing ong",
    level: "基础",
    mode: "pinyin",
    items: [
      item("nv-an", "an", "an"),
      item("nv-en", "en", "en"),
      item("nv-in", "in", "in"),
      item("nv-un", "un", "un"),
      item("nv-vn", "vn", "vn", "ün"),
      item("nv-ang", "ang", "ang"),
      item("nv-eng", "eng", "eng"),
      item("nv-ing", "ing", "ing"),
      item("nv-ong", "ong", "ong"),
    ],
  },
  {
    id: "bpmf",
    title: "b p m f",
    focus: "唇音组合",
    level: "基础",
    mode: "pinyin",
    items: [
      item("bpmf-ba", "ba", "ba"),
      item("bpmf-bo", "bo", "bo"),
      item("bpmf-bi", "bi", "bi"),
      item("bpmf-bu", "bu", "bu"),
      item("bpmf-pa", "pa", "pa"),
      item("bpmf-po", "po", "po"),
      item("bpmf-pi", "pi", "pi"),
      item("bpmf-ma", "ma", "ma"),
      item("bpmf-me", "me", "me"),
      item("bpmf-mi", "mi", "mi"),
      item("bpmf-fa", "fa", "fa"),
      item("bpmf-fu", "fu", "fu"),
    ],
  },
  {
    id: "dtnl",
    title: "d t n l",
    focus: "舌尖音组合",
    level: "基础",
    mode: "pinyin",
    items: [
      item("dtnl-da", "da", "da"),
      item("dtnl-de", "de", "de"),
      item("dtnl-di", "di", "di"),
      item("dtnl-du", "du", "du"),
      item("dtnl-ta", "ta", "ta"),
      item("dtnl-te", "te", "te"),
      item("dtnl-ti", "ti", "ti"),
      item("dtnl-na", "na", "na"),
      item("dtnl-ni", "ni", "ni"),
      item("dtnl-la", "la", "la"),
      item("dtnl-li", "li", "li"),
      item("dtnl-lv", "lv", "lv", "lü"),
    ],
  },
  {
    id: "gkh",
    title: "g k h",
    focus: "舌根音组合",
    level: "进阶",
    mode: "pinyin",
    items: [
      item("gkh-ga", "ga", "ga"),
      item("gkh-ge", "ge", "ge"),
      item("gkh-gu", "gu", "gu"),
      item("gkh-gai", "gai", "gai"),
      item("gkh-guo", "guo", "guo"),
      item("gkh-ka", "ka", "ka"),
      item("gkh-kai", "kai", "kai"),
      item("gkh-kou", "kou", "kou"),
      item("gkh-hao", "hao", "hao"),
      item("gkh-he", "he", "he"),
      item("gkh-hui", "hui", "hui"),
      item("gkh-huang", "huang", "huang"),
    ],
  },
  {
    id: "jqx",
    title: "j q x",
    focus: "i ü 系列",
    level: "进阶",
    mode: "pinyin",
    items: [
      item("jqx-ji", "ji", "ji"),
      item("jqx-jia", "jia", "jia"),
      item("jqx-jie", "jie", "jie"),
      item("jqx-jiu", "jiu", "jiu"),
      item("jqx-ju", "ju", "ju"),
      item("jqx-qing", "qing", "qing"),
      item("jqx-qiu", "qiu", "qiu"),
      item("jqx-qu", "qu", "qu"),
      item("jqx-xi", "xi", "xi"),
      item("jqx-xian", "xian", "xian"),
      item("jqx-xue", "xue", "xue"),
      item("jqx-xiong", "xiong", "xiong"),
    ],
  },
  {
    id: "zhchshr",
    title: "zh ch sh r",
    focus: "翘舌音组合",
    level: "进阶",
    mode: "pinyin",
    items: [
      item("retro-zha", "zha", "zha"),
      item("retro-zhe", "zhe", "zhe"),
      item("retro-zhi", "zhi", "zhi"),
      item("retro-zhong", "zhong", "zhong"),
      item("retro-cha", "cha", "cha"),
      item("retro-che", "che", "che"),
      item("retro-chi", "chi", "chi"),
      item("retro-shao", "shao", "shao"),
      item("retro-shi", "shi", "shi"),
      item("retro-shang", "shang", "shang"),
      item("retro-re", "re", "re"),
      item("retro-ri", "ri", "ri"),
    ],
  },
  {
    id: "common-words",
    title: "汉字词语",
    focus: "双字词连打",
    level: "实战",
    mode: "hanzi",
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
    title: "汉字混合挑战",
    focus: "常用汉字与词语",
    level: "挑战",
    mode: "hanzi",
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
