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
  practiceSize?: number;
  items: TrainingItem[];
};

type WordEntry = readonly [label: string, pinyin: string];

const item = (
  id: string,
  label: string,
  pinyin: string,
  displayPinyin?: string,
  note?: string,
): TrainingItem => ({ id, label, pinyin, displayPinyin, note });

const toItemId = (value: string) =>
  value
    .toLowerCase()
    .replaceAll("ü", "v")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const pinyinItems = (prefix: string, syllables: string[]) =>
  syllables.map((syllable) =>
    item(`${prefix}-${toItemId(syllable)}`, syllable, syllable),
  );

const wordItems = (prefix: string, entries: WordEntry[]) =>
  entries.map(([label, pinyin]) =>
    item(`${prefix}-${toItemId(pinyin)}`, label, pinyin),
  );

const pinyinLesson = (
  id: string,
  title: string,
  focus: string,
  level: string,
  practiceSize: number,
  syllables: string[],
): Lesson => ({
  id,
  title,
  focus,
  level,
  mode: "pinyin",
  practiceSize,
  items: pinyinItems(id, syllables),
});

const wordLesson = (
  id: string,
  title: string,
  focus: string,
  practiceSize: number,
  entries: WordEntry[],
): Lesson => ({
  id,
  title,
  focus,
  level: "汉字",
  mode: "hanzi",
  practiceSize,
  items: wordItems(id, entries),
});

export const LESSONS: Lesson[] = [
  pinyinLesson("zero-a", "零声母 a", "a 开头", "入门", 20, [
    "a", "ai", "an", "ang", "ao",
  ]),
  pinyinLesson("zero-e", "零声母 e", "e 开头", "入门", 20, [
    "e", "ei", "en", "eng", "er",
  ]),
  pinyinLesson("zero-o", "零声母 o", "o 开头", "入门", 20, [
    "o", "ou",
  ]),
  pinyinLesson("zero-y", "零声母 y", "y 开头", "入门", 28, [
    "yi", "ya", "yan", "yang", "yao", "ye", "you", "yin", "ying", "yong",
    "yu", "yue", "yuan", "yun",
  ]),
  pinyinLesson("zero-w", "零声母 w", "w 开头", "入门", 24, [
    "wu", "wa", "wai", "wan", "wang", "wei", "wen", "weng", "wo",
  ]),
  pinyinLesson("initial-b", "b 组合", "b + 常用韵母", "基础", 24, [
    "ba", "bai", "ban", "bang", "bao", "bei", "ben", "beng", "bi",
    "bian", "biao", "bie", "bin", "bing", "bo", "bu",
  ]),
  pinyinLesson("initial-p", "p 组合", "p + 常用韵母", "基础", 24, [
    "pa", "pai", "pan", "pang", "pao", "pei", "pen", "peng", "pi",
    "pian", "piao", "pie", "pin", "ping", "po", "pou", "pu",
  ]),
  pinyinLesson("initial-m", "m 组合", "m + 常用韵母", "基础", 28, [
    "ma", "mai", "man", "mang", "mao", "me", "mei", "men", "meng",
    "mi", "mian", "miao", "mie", "min", "ming", "miu", "mo", "mou",
    "mu",
  ]),
  pinyinLesson("initial-f", "f 组合", "f + 常用韵母", "基础", 20, [
    "fa", "fan", "fang", "fei", "fen", "feng", "fo", "fou", "fu",
  ]),
  pinyinLesson("initial-d", "d 组合", "d + 常用韵母", "基础", 30, [
    "da", "dai", "dan", "dang", "dao", "de", "dei", "den", "deng",
    "di", "dia", "dian", "diao", "die", "ding", "diu", "dong", "dou",
    "du", "duan", "dui", "dun", "duo",
  ]),
  pinyinLesson("initial-t", "t 组合", "t + 常用韵母", "基础", 28, [
    "ta", "tai", "tan", "tang", "tao", "te", "teng", "ti", "tian",
    "tiao", "tie", "ting", "tong", "tou", "tu", "tuan", "tui", "tun",
    "tuo",
  ]),
  pinyinLesson("initial-n", "n 组合", "n + 常用韵母", "基础", 32, [
    "na", "nai", "nan", "nang", "nao", "ne", "nei", "nen", "neng",
    "ni", "nian", "niang", "niao", "nie", "nin", "ning", "niu", "nong",
    "nou", "nu", "nv", "nve", "nuan", "nuo",
  ]),
  pinyinLesson("initial-l", "l 组合", "l + 常用韵母", "基础", 36, [
    "la", "lai", "lan", "lang", "lao", "le", "lei", "leng", "li", "lia",
    "lian", "liang", "liao", "lie", "lin", "ling", "liu", "long", "lou",
    "lu", "lv", "lve", "luan", "lue", "lun", "luo",
  ]),
  pinyinLesson("initial-g", "g 组合", "g + 常用韵母", "进阶", 30, [
    "ga", "gai", "gan", "gang", "gao", "ge", "gei", "gen", "geng",
    "gong", "gou", "gu", "gua", "guai", "guan", "guang", "gui", "gun",
    "guo",
  ]),
  pinyinLesson("initial-k", "k 组合", "k + 常用韵母", "进阶", 28, [
    "ka", "kai", "kan", "kang", "kao", "ke", "ken", "keng", "kong",
    "kou", "ku", "kua", "kuai", "kuan", "kuang", "kui", "kun", "kuo",
  ]),
  pinyinLesson("initial-h", "h 组合", "h + 常用韵母", "进阶", 32, [
    "ha", "hai", "han", "hang", "hao", "he", "hei", "hen", "heng",
    "hong", "hou", "hu", "hua", "huai", "huan", "huang", "hui", "hun",
    "huo",
  ]),
  pinyinLesson("initial-j", "j 组合", "j + i/u 系", "进阶", 24, [
    "ji", "jia", "jian", "jiang", "jiao", "jie", "jin", "jing", "jiong",
    "jiu", "ju", "juan", "jue", "jun",
  ]),
  pinyinLesson("initial-q", "q 组合", "q + i/u 系", "进阶", 24, [
    "qi", "qia", "qian", "qiang", "qiao", "qie", "qin", "qing", "qiong",
    "qiu", "qu", "quan", "que", "qun",
  ]),
  pinyinLesson("initial-x", "x 组合", "x + i/u 系", "进阶", 24, [
    "xi", "xia", "xian", "xiang", "xiao", "xie", "xin", "xing", "xiong",
    "xiu", "xu", "xuan", "xue", "xun",
  ]),
  pinyinLesson("initial-z", "z 组合", "z + 常用韵母", "进阶", 26, [
    "za", "zai", "zan", "zang", "zao", "ze", "zei", "zen", "zeng", "zi",
    "zong", "zou", "zu", "zuan", "zui", "zun", "zuo",
  ]),
  pinyinLesson("initial-c", "c 组合", "c + 常用韵母", "进阶", 26, [
    "ca", "cai", "can", "cang", "cao", "ce", "cen", "ceng", "ci", "cong",
    "cou", "cu", "cuan", "cui", "cun", "cuo",
  ]),
  pinyinLesson("initial-s", "s 组合", "s + 常用韵母", "进阶", 26, [
    "sa", "sai", "san", "sang", "sao", "se", "sen", "seng", "si", "song",
    "sou", "su", "suan", "sui", "sun", "suo",
  ]),
  pinyinLesson("initial-zh", "zh 组合", "zh + 常用韵母", "翘舌", 32, [
    "zha", "zhai", "zhan", "zhang", "zhao", "zhe", "zhen", "zheng", "zhi",
    "zhong", "zhou", "zhu", "zhua", "zhuai", "zhuan", "zhuang", "zhui",
    "zhun", "zhuo",
  ]),
  pinyinLesson("initial-ch", "ch 组合", "ch + 常用韵母", "翘舌", 32, [
    "cha", "chai", "chan", "chang", "chao", "che", "chen", "cheng", "chi",
    "chong", "chou", "chu", "chua", "chuai", "chuan", "chuang", "chui",
    "chun", "chuo",
  ]),
  pinyinLesson("initial-sh", "sh 组合", "sh + 常用韵母", "翘舌", 32, [
    "sha", "shai", "shan", "shang", "shao", "she", "shei", "shen", "sheng",
    "shi", "shou", "shu", "shua", "shuai", "shuan", "shuang", "shui", "shun",
    "shuo",
  ]),
  pinyinLesson("initial-r", "r 组合", "r + 常用韵母", "翘舌", 24, [
    "ran", "rang", "rao", "re", "ren", "reng", "ri", "rong", "rou", "ru",
    "ruan", "rui", "run", "ruo",
  ]),
  wordLesson("daily-greeting", "问候交流", "打招呼与回应", 24, [
    ["你好", "ni hao"], ["您好", "nin hao"], ["早上", "zao shang"],
    ["晚安", "wan an"], ["再见", "zai jian"], ["谢谢", "xie xie"],
    ["不谢", "bu xie"], ["请问", "qing wen"], ["没事", "mei shi"],
    ["对不起", "dui bu qi"], ["没关系", "mei guan xi"],
    ["辛苦了", "xin ku le"], ["打扰了", "da rao le"],
    ["请稍等", "qing shao deng"], ["欢迎", "huan ying"],
    ["方便", "fang bian"], ["麻烦", "ma fan"], ["可以", "ke yi"],
    ["不行", "bu xing"], ["好的", "hao de"],
  ]),
  wordLesson("daily-people", "家人与人物", "亲友和常见称呼", 24, [
    ["爸爸", "ba ba"], ["妈妈", "ma ma"], ["爷爷", "ye ye"],
    ["奶奶", "nai nai"], ["外公", "wai gong"], ["外婆", "wai po"],
    ["哥哥", "ge ge"], ["姐姐", "jie jie"], ["弟弟", "di di"],
    ["妹妹", "mei mei"], ["孩子", "hai zi"], ["老人", "lao ren"],
    ["家人", "jia ren"], ["朋友", "peng you"], ["同事", "tong shi"],
    ["老师", "lao shi"], ["学生", "xue sheng"], ["医生", "yi sheng"],
    ["邻居", "lin ju"], ["客人", "ke ren"],
  ]),
  wordLesson("daily-time", "时间日期", "日常时间表达", 24, [
    ["今天", "jin tian"], ["明天", "ming tian"], ["昨天", "zuo tian"],
    ["现在", "xian zai"], ["马上", "ma shang"], ["一会", "yi hui"],
    ["早晨", "zao chen"], ["中午", "zhong wu"], ["下午", "xia wu"],
    ["晚上", "wan shang"], ["周末", "zhou mo"], ["今年", "jin nian"],
    ["上月", "shang yue"], ["下周", "xia zhou"], ["每天", "mei tian"],
    ["刚才", "gang cai"], ["以后", "yi hou"], ["以前", "yi qian"],
    ["时间", "shi jian"], ["生日", "sheng ri"],
  ]),
  wordLesson("daily-food", "吃饭饮食", "食物和饮品", 24, [
    ["米饭", "mi fan"], ["面条", "mian tiao"], ["包子", "bao zi"],
    ["馒头", "man tou"], ["鸡蛋", "ji dan"], ["牛奶", "niu nai"],
    ["豆浆", "dou jiang"], ["水果", "shui guo"], ["苹果", "ping guo"],
    ["香蕉", "xiang jiao"], ["蔬菜", "shu cai"], ["青菜", "qing cai"],
    ["土豆", "tu dou"], ["鸡肉", "ji rou"], ["鱼肉", "yu rou"],
    ["热水", "re shui"], ["咖啡", "ka fei"], ["茶水", "cha shui"],
    ["饭店", "fan dian"], ["外卖", "wai mai"],
  ]),
  wordLesson("daily-home", "居家生活", "家务和用品", 24, [
    ["回家", "hui jia"], ["起床", "qi chuang"], ["睡觉", "shui jiao"],
    ["洗脸", "xi lian"], ["刷牙", "shua ya"], ["洗澡", "xi zao"],
    ["做饭", "zuo fan"], ["打扫", "da sao"], ["房间", "fang jian"],
    ["客厅", "ke ting"], ["厨房", "chu fang"], ["卫生", "wei sheng"],
    ["桌子", "zhuo zi"], ["椅子", "yi zi"], ["沙发", "sha fa"],
    ["衣服", "yi fu"], ["鞋子", "xie zi"], ["钥匙", "yao shi"],
    ["手机", "shou ji"], ["电脑", "dian nao"],
  ]),
  wordLesson("daily-work-study", "工作学习", "办公和课堂", 24, [
    ["上班", "shang ban"], ["下班", "xia ban"], ["开会", "kai hui"],
    ["工作", "gong zuo"], ["任务", "ren wu"], ["项目", "xiang mu"],
    ["文件", "wen jian"], ["邮件", "you jian"], ["电话", "dian hua"],
    ["消息", "xiao xi"], ["学习", "xue xi"], ["作业", "zuo ye"],
    ["考试", "kao shi"], ["课堂", "ke tang"], ["书本", "shu ben"],
    ["笔记", "bi ji"], ["问题", "wen ti"], ["答案", "da an"],
    ["练习", "lian xi"], ["复习", "fu xi"],
  ]),
  wordLesson("daily-travel", "出行交通", "路线和交通", 24, [
    ["出门", "chu men"], ["回来", "hui lai"], ["出发", "chu fa"],
    ["到达", "dao da"], ["公交", "gong jiao"], ["地铁", "di tie"],
    ["火车", "huo che"], ["飞机", "fei ji"], ["出租车", "chu zu che"],
    ["车站", "che zhan"], ["路口", "lu kou"], ["红灯", "hong deng"],
    ["绿灯", "lv deng"], ["直走", "zhi zou"], ["左转", "zuo zhuan"],
    ["右转", "you zhuan"], ["地图", "di tu"], ["地址", "di zhi"],
    ["旅行", "lv xing"], ["酒店", "jiu dian"],
  ]),
  wordLesson("daily-shopping", "购物付款", "买东西和支付", 24, [
    ["买菜", "mai cai"], ["超市", "chao shi"], ["商店", "shang dian"],
    ["价格", "jia ge"], ["便宜", "pian yi"], ["贵了", "gui le"],
    ["付款", "fu kuan"], ["现金", "xian jin"], ["微信", "wei xin"],
    ["支付", "zhi fu"], ["发票", "fa piao"], ["订单", "ding dan"],
    ["快递", "kuai di"], ["包裹", "bao guo"], ["退货", "tui huo"],
    ["会员", "hui yuan"], ["优惠", "you hui"], ["排队", "pai dui"],
    ["收银", "shou yin"], ["零钱", "ling qian"],
  ]),
  wordLesson("daily-health", "健康身体", "不舒服和运动", 24, [
    ["头疼", "tou teng"], ["发烧", "fa shao"], ["咳嗽", "ke sou"],
    ["感冒", "gan mao"], ["肚子", "du zi"], ["牙疼", "ya teng"],
    ["医院", "yi yuan"], ["药店", "yao dian"], ["挂号", "gua hao"],
    ["体温", "ti wen"], ["休息", "xiu xi"], ["喝水", "he shui"],
    ["运动", "yun dong"], ["跑步", "pao bu"], ["散步", "san bu"],
    ["睡眠", "shui mian"], ["心情", "xin qing"], ["累了", "lei le"],
    ["放松", "fang song"], ["健康", "jian kang"],
  ]),
  wordLesson("daily-actions", "常用动作", "高频动词短语", 24, [
    ["看看", "kan kan"], ["听听", "ting ting"], ["说话", "shuo hua"],
    ["走路", "zou lu"], ["打开", "da kai"], ["关闭", "guan bi"],
    ["拿来", "na lai"], ["放下", "fang xia"], ["等等", "deng deng"],
    ["帮忙", "bang mang"], ["记得", "ji de"], ["忘了", "wang le"],
    ["想要", "xiang yao"], ["喜欢", "xi huan"], ["知道", "zhi dao"],
    ["明白", "ming bai"], ["需要", "xu yao"], ["准备", "zhun bei"],
    ["开始", "kai shi"], ["完成", "wan cheng"],
  ]),
];

export const ALL_TRAINING_ITEMS = LESSONS.flatMap((lesson) => lesson.items);

export const ITEM_BY_ID = new Map(
  ALL_TRAINING_ITEMS.map((trainingItem) => [trainingItem.id, trainingItem]),
);