// tools/add-special-words.mjs — V0.8 目标2：给语法八课注入 specialWords（⚡特殊单词表）
// 用法：node tools/add-special-words.mjs [L1|L2|...|all]
// 幂等：重复运行覆盖同名课的 specialWords；输出保持 1 空格缩进无尾换行（与原文件一致）。
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'data/exam/ket/grammar-lessons.json';
const data = JSON.parse(readFileSync(FILE, 'utf8'));
const verbs = JSON.parse(readFileSync('data/exam/ket/irregular-verbs.json', 'utf8'));

// 40 个不规则动词过去式音标（L3 六组用）
const PAST_IPA = {
  put: '/pʊt/', cut: '/kʌt/', read: '/red/', let: '/let/', hurt: '/hɜːt/',
  sang: '/sæŋ/', swam: '/swæm/', began: '/bɪˈɡæn/', drank: '/dræŋk/', ran: '/ræn/', sat: '/sæt/', gave: '/ɡeɪv/',
  bought: '/bɔːt/', brought: '/brɔːt/', thought: '/θɔːt/', taught: '/tɔːt/', caught: '/kɔːt/',
  slept: '/slept/', kept: '/kept/', felt: '/felt/', left: '/left/', met: '/met/', lost: '/lɒst/', sent: '/sent/', built: '/bɪlt/',
  knew: '/njuː/', grew: '/ɡruː/', threw: '/θruː/', flew: '/fluː/', drew: '/druː/',
  went: '/went/', 'was / were': '/wɒz/ /wɜː/', had: '/hæd/', did: '/dɪd/', saw: '/sɔː/', took: '/tʊk/',
  made: '/meɪd/', ate: '/eɪt/', came: '/keɪm/', got: '/ɡɒt/', said: '/sed/', told: '/təʊld/', wrote: '/rəʊt/',
  stood: '/stʊd/', spoke: '/spəʊk/', won: '/wʌn/', fell: '/fel/', heard: '/hɜːd/', wore: '/wɔː/', found: '/faʊnd/'
};
// KET 高频不规则动词
const PAST_HIGH = new Set(['read', 'went', 'was / were', 'had', 'did', 'saw', 'took', 'made', 'ate', 'came', 'got', 'said', 'bought', 'thought', 'ran', 'sat', 'gave', 'met', 'knew']);

const irregularGroups = verbs.groups.map(g => ({
  groupName: `不规则过去式 · ${g.name}`,
  rule: g.shape,
  words: g.verbs.map(v => ({
    base: v.base,
    form: v.past,
    phonetic: PAST_IPA[v.past] || '',
    zh: v.zh.replace(/（.*?）/g, ''),
    high: PAST_HIGH.has(v.past)
  }))
}));

const SPECIAL = {
  L1: [
    {
      groupName: '现在式三张脸：am / is / are',
      rule: 'be 是乐队里最不安分的主唱——跟着主语换脸。我用 am，单个他/她/它用 is，「人多」（you/we/they）用 are。',
      words: [
        { base: 'I', form: 'am', phonetic: '/æm/', zh: '我 → am', high: true },
        { base: 'he / she / it', form: 'is', phonetic: '/ɪz/', zh: '单个他/她/它 → is', high: true },
        { base: 'you / we / they', form: 'are', phonetic: '/ɑː/', zh: '你/我们/他们 → are', high: true }
      ]
    },
    {
      groupName: '过去式两张脸：was / were',
      rule: '回到过去只剩两张脸：am 和 is 都变 was，are 变 were。',
      words: [
        { base: 'I / he / she / it', form: 'was', phonetic: '/wɒz/', zh: '单数过去 → was', high: true },
        { base: 'you / we / they', form: 'were', phonetic: '/wɜː/', zh: '复数过去 → were', high: true }
      ]
    },
    {
      groupName: '其他形式：be / been / being',
      rule: '情态动词后面用原形 be（will be / can be）；been 和 being 是它的「变装」，KET 里偶尔露面，认识就行。',
      words: [
        { base: 'be', form: 'be', phonetic: '/biː/', zh: '原形：will be 明天见', high: true },
        { base: 'be', form: 'been', phonetic: '/biːn/', zh: '过去分词：have been to 去过' },
        { base: 'be', form: 'being', phonetic: '/ˈbiːɪŋ/', zh: '-ing 形式（少见）' }
      ]
    },
    {
      groupName: '肯定缩写：口语里的连音',
      rule: '主语和 be 常「挤」成一个词，听力里几乎只说缩写，一定要听得出来。',
      words: [
        { base: 'I am', form: "I'm", phonetic: '/aɪm/', zh: '我是', high: true },
        { base: 'he is', form: "he's", phonetic: '/hiːz/', zh: '他是', high: true },
        { base: 'she is', form: "she's", phonetic: '/ʃiːz/', zh: '她是', high: true },
        { base: 'it is', form: "it's", phonetic: '/ɪts/', zh: '它是', high: true },
        { base: 'you are', form: "you're", phonetic: '/jʊə/', zh: '你是', high: true },
        { base: 'we are', form: "we're", phonetic: '/wɪə/', zh: '我们是' },
        { base: 'they are', form: "they're", phonetic: '/ðeə/', zh: '他们是', high: true }
      ]
    },
    {
      groupName: '否定缩写：not 也来挤一挤',
      rule: 'be + not 的缩写。注意：am not 没有缩写形式，只能说 I\'m not（没有 amn\'t 这个词！）。',
      words: [
        { base: 'is not', form: "isn't", phonetic: '/ˈɪznt/', zh: '不是（单数）', high: true },
        { base: 'are not', form: "aren't", phonetic: '/ɑːnt/', zh: '不是（复数）', high: true },
        { base: 'was not', form: "wasn't", phonetic: '/ˈwɒznt/', zh: '过去不是（单数）', high: true },
        { base: 'were not', form: "weren't", phonetic: '/wɜːnt/', zh: '过去不是（复数）' },
        { base: 'am not', form: "I'm not", phonetic: '', zh: '★没有 amn\'t，只能这样说', high: true }
      ]
    }
  ],
  L2: [
    {
      groupName: 'do 家族：起拍手势的三种打法',
      rule: '一般动词的问句/否定要请 do 家族来起拍：现在时用 do，第三人称单数用 does，过去时一律 did（did 一出场，后面动词变回原形！）。',
      words: [
        { base: 'I / you / we / they', form: 'do', phonetic: '/duː/', zh: '现在时起拍', high: true },
        { base: 'he / she / it', form: 'does', phonetic: '/dʌz/', zh: '三单起拍 ★注意读音', high: true },
        { base: '所有人称（过去）', form: 'did', phonetic: '/dɪd/', zh: '过去时起拍，动词还原', high: true }
      ]
    },
    {
      groupName: '否定缩写：don\'t / doesn\'t / didn\'t',
      rule: '否定句 = do 家族 + not 的缩写 + 动词原形。后面动词永远是原形，「时间戳」已经打在 do 家族身上了。',
      words: [
        { base: 'do not', form: "don't", phonetic: '/dəʊnt/', zh: '不（现在）', high: true },
        { base: 'does not', form: "doesn't", phonetic: '/ˈdʌznt/', zh: '不（三单）', high: true },
        { base: 'did not', form: "didn't", phonetic: '/ˈdɪdnt/', zh: '不（过去）', high: true }
      ]
    },
    {
      groupName: '情态动词和它们的否定缩写',
      rule: '情态动词自己就能起拍（Can you...? / Will she...?），不用请 do。注意 won\'t 的拼写完全变样，mustn\'t 里第一个 t 不发音。',
      words: [
        { base: 'can', form: "can't", phonetic: '/kɑːnt/', zh: '能 → 不能', high: true },
        { base: 'could', form: "couldn't", phonetic: '/ˈkʊdnt/', zh: '能(过去/客气) → 不能', high: true },
        { base: 'will', form: "won't", phonetic: '/wəʊnt/', zh: '将会 → 不会 ★拼写大变身', high: true },
        { base: 'would', form: "wouldn't", phonetic: '/ˈwʊdnt/', zh: '愿意(客气) → 不愿意', high: true },
        { base: 'should', form: "shouldn't", phonetic: '/ˈʃʊdnt/', zh: '应该 → 不应该' },
        { base: 'must', form: "mustn't", phonetic: '/ˈmʌsnt/', zh: '必须 → 禁止 ★第一个t不发音' }
      ]
    }
  ],
  L3: [
    {
      groupName: '三单加 -s：大多数动词直接加',
      rule: '他/她/它做的事，动词尾巴要挂个小 s——这是乐队给「单人独奏」的记号。大多数动词直接 +s。',
      words: [
        { base: 'play', form: 'plays', phonetic: '/pleɪz/', zh: '玩', high: true },
        { base: 'like', form: 'likes', phonetic: '/laɪks/', zh: '喜欢', high: true },
        { base: 'eat', form: 'eats', phonetic: '/iːts/', zh: '吃', high: true },
        { base: 'run', form: 'runs', phonetic: '/rʌnz/', zh: '跑' },
        { base: 'live', form: 'lives', phonetic: '/lɪvz/', zh: '住', high: true },
        { base: 'work', form: 'works', phonetic: '/wɜːks/', zh: '工作' }
      ]
    },
    {
      groupName: '以 s / x / ch / sh / o 结尾 → 加 -es',
      rule: '这些词尾发音太「挤」，直接加 s 读不出来，所以加 es 垫一下（多出一个 /ɪz/ 音节）。o 结尾的 goes / does 也归这组。',
      words: [
        { base: 'go', form: 'goes', phonetic: '/ɡəʊz/', zh: '去', high: true },
        { base: 'do', form: 'does', phonetic: '/dʌz/', zh: '做 ★读音变了', high: true },
        { base: 'watch', form: 'watches', phonetic: '/ˈwɒtʃɪz/', zh: '看', high: true },
        { base: 'wash', form: 'washes', phonetic: '/ˈwɒʃɪz/', zh: '洗', high: true },
        { base: 'teach', form: 'teaches', phonetic: '/ˈtiːtʃɪz/', zh: '教', high: true },
        { base: 'catch', form: 'catches', phonetic: '/ˈkætʃɪz/', zh: '接住' },
        { base: 'finish', form: 'finishes', phonetic: '/ˈfɪnɪʃɪz/', zh: '完成', high: true },
        { base: 'fix', form: 'fixes', phonetic: '/ˈfɪksɪz/', zh: '修理' },
        { base: 'pass', form: 'passes', phonetic: '/ˈpɑːsɪz/', zh: '经过；传' },
        { base: 'miss', form: 'misses', phonetic: '/ˈmɪsɪz/', zh: '错过；想念' }
      ]
    },
    {
      groupName: '辅音 + y → 变 ies',
      rule: '辅音字母 + y 结尾：y 害羞地变成 i 再加 es。注意对比：play → plays（a 是元音，y 不用变）；say → says ★读音特殊 /sez/。',
      words: [
        { base: 'study', form: 'studies', phonetic: '/ˈstʌdiz/', zh: '学习', high: true },
        { base: 'fly', form: 'flies', phonetic: '/flaɪz/', zh: '飞', high: true },
        { base: 'carry', form: 'carries', phonetic: '/ˈkæriz/', zh: '搬运', high: true },
        { base: 'cry', form: 'cries', phonetic: '/kraɪz/', zh: '哭' },
        { base: 'try', form: 'tries', phonetic: '/traɪz/', zh: '尝试', high: true },
        { base: 'worry', form: 'worries', phonetic: '/ˈwʌriz/', zh: '担心' }
      ]
    },
    {
      groupName: '独一份的特殊：have → has',
      rule: 'have 是乐队老资格，特殊到自成一组——不加 s，直接换成 has。（暗线又来了：越常用的词，越不规则！）',
      words: [
        { base: 'have', form: 'has', phonetic: '/hæz/', zh: '有', high: true },
        { base: 'say', form: 'says', phonetic: '/sez/', zh: '说 ★拼写规则但读音特殊', high: true }
      ]
    }
  ],
  L4: [
    {
      groupName: '直接 + ing：大多数动词',
      rule: '进行时 = be + 动词-ing，「正在进行」的现场直播。大多数动词直接挂 ing。',
      words: [
        { base: 'play', form: 'playing', phonetic: '/ˈpleɪɪŋ/', zh: '玩', high: true },
        { base: 'read', form: 'reading', phonetic: '/ˈriːdɪŋ/', zh: '读', high: true },
        { base: 'eat', form: 'eating', phonetic: '/ˈiːtɪŋ/', zh: '吃', high: true },
        { base: 'do', form: 'doing', phonetic: '/ˈduːɪŋ/', zh: '做', high: true },
        { base: 'watch', form: 'watching', phonetic: '/ˈwɒtʃɪŋ/', zh: '看', high: true },
        { base: 'sleep', form: 'sleeping', phonetic: '/ˈsliːpɪŋ/', zh: '睡觉' }
      ]
    },
    {
      groupName: '哑巴 e 先下台：去 e + ing',
      rule: '结尾的 e 本来就不发音（哑巴 e），ing 上台前它先退场，不然两个元音撞在一起。',
      words: [
        { base: 'make', form: 'making', phonetic: '/ˈmeɪkɪŋ/', zh: '制作', high: true },
        { base: 'write', form: 'writing', phonetic: '/ˈraɪtɪŋ/', zh: '写 ★别双写t', high: true },
        { base: 'take', form: 'taking', phonetic: '/ˈteɪkɪŋ/', zh: '拿；带', high: true },
        { base: 'have', form: 'having', phonetic: '/ˈhævɪŋ/', zh: '吃；进行', high: true },
        { base: 'come', form: 'coming', phonetic: '/ˈkʌmɪŋ/', zh: '来', high: true },
        { base: 'give', form: 'giving', phonetic: '/ˈɡɪvɪŋ/', zh: '给' },
        { base: 'ride', form: 'riding', phonetic: '/ˈraɪdɪŋ/', zh: '骑', high: true },
        { base: 'dance', form: 'dancing', phonetic: '/ˈdɑːnsɪŋ/', zh: '跳舞' }
      ]
    },
    {
      groupName: '短元音要护住：双写末尾辅音 + ing',
      rule: '「短元音+单辅音」结尾的短词，要把末尾辅音双写再加 ing，护住短元音的读音（不双写的话 siting 会读成 site-ing）。',
      words: [
        { base: 'run', form: 'running', phonetic: '/ˈrʌnɪŋ/', zh: '跑', high: true },
        { base: 'swim', form: 'swimming', phonetic: '/ˈswɪmɪŋ/', zh: '游泳', high: true },
        { base: 'sit', form: 'sitting', phonetic: '/ˈsɪtɪŋ/', zh: '坐', high: true },
        { base: 'get', form: 'getting', phonetic: '/ˈɡetɪŋ/', zh: '得到；变得', high: true },
        { base: 'put', form: 'putting', phonetic: '/ˈpʊtɪŋ/', zh: '放' },
        { base: 'stop', form: 'stopping', phonetic: '/ˈstɒpɪŋ/', zh: '停', high: true },
        { base: 'shop', form: 'shopping', phonetic: '/ˈʃɒpɪŋ/', zh: '购物', high: true },
        { base: 'begin', form: 'beginning', phonetic: '/bɪˈɡɪnɪŋ/', zh: '开始 ★双写n' }
      ]
    },
    {
      groupName: '小众但好玩：ie → y + ing',
      rule: 'ie 结尾的词把 ie 变成 y 再加 ing——lie 和 die 是这组的代表，长得怪但一眼能认出来。',
      words: [
        { base: 'lie', form: 'lying', phonetic: '/ˈlaɪɪŋ/', zh: '躺；说谎', high: true },
        { base: 'die', form: 'dying', phonetic: '/ˈdaɪɪŋ/', zh: '死' },
        { base: 'tie', form: 'tying', phonetic: '/ˈtaɪɪŋ/', zh: '系；绑' }
      ]
    }
  ],
  L5: [
    {
      groupName: 'at = 点：钟点和小地点',
      rule: 'at 是「一个点」——时间上的一刻、地图上的一个小点。说几点钟、说门口/家里这种小位置，用 at。',
      words: [
        { base: 'at', form: "at 7 o'clock", phonetic: '', zh: '在 7 点（钟点）', high: true },
        { base: 'at', form: 'at noon', phonetic: '', zh: '在中午' },
        { base: 'at', form: 'at night', phonetic: '', zh: '在夜里 ★不是 in night', high: true },
        { base: 'at', form: 'at the weekend', phonetic: '', zh: '在周末（英式）', high: true },
        { base: 'at', form: 'at home', phonetic: '', zh: '在家', high: true },
        { base: 'at', form: 'at school', phonetic: '', zh: '在学校', high: true }
      ]
    },
    {
      groupName: 'on = 面：具体某一天和表面',
      rule: 'on 是「贴在面上」——日历上具体的一天（星期几、几月几号）是一个「格子面」，用 on。',
      words: [
        { base: 'on', form: 'on Monday', phonetic: '', zh: '在星期一', high: true },
        { base: 'on', form: 'on 1st May', phonetic: '', zh: '在 5 月 1 日（具体日期）', high: true },
        { base: 'on', form: 'on my birthday', phonetic: '', zh: '在我生日那天' },
        { base: 'on', form: 'on foot', phonetic: '', zh: '步行 ★固定搭配', high: true },
        { base: 'on', form: 'on TV', phonetic: '', zh: '在电视上', high: true },
        { base: 'on', form: 'on holiday', phonetic: '', zh: '在度假' }
      ]
    },
    {
      groupName: 'in = 盒子：时间段和大空间',
      rule: 'in 是「装进盒子里」——月份、季节、年份是大段时间，早上/下午/晚上也是时间段；城市、国家是大空间。',
      words: [
        { base: 'in', form: 'in July', phonetic: '', zh: '在 7 月', high: true },
        { base: 'in', form: 'in summer', phonetic: '', zh: '在夏天', high: true },
        { base: 'in', form: 'in 2026', phonetic: '', zh: '在 2026 年' },
        { base: 'in', form: 'in the morning', phonetic: '', zh: '在早上 ★但 at night', high: true },
        { base: 'in', form: 'in bed', phonetic: '', zh: '在床上（睡觉状态）' },
        { base: 'in', form: 'in the city', phonetic: '', zh: '在城市里' }
      ]
    },
    {
      groupName: '交通方式：by + 光杆交通工具',
      rule: 'by + 交通工具时，工具是「光杆」的——不加 a/the/my。唯一例外：走路说 on foot。',
      words: [
        { base: 'by', form: 'by bus', phonetic: '', zh: '坐公交 ★不说 by a bus', high: true },
        { base: 'by', form: 'by bike', phonetic: '', zh: '骑自行车', high: true },
        { base: 'by', form: 'by train', phonetic: '', zh: '坐火车', high: true },
        { base: 'by', form: 'by car', phonetic: '', zh: '坐汽车', high: true },
        { base: 'by', form: 'by plane', phonetic: '', zh: '坐飞机' },
        { base: 'on', form: 'on foot', phonetic: '', zh: '步行 ★唯一用 on 的', high: true }
      ]
    }
  ],
  L6: [
    {
      groupName: '宾格：动词/介词后面换这套',
      rule: '代词站在动词或介词后面（被动作「打到」的位置）要换宾格衣服。you 和 it 偷懒不换装。',
      words: [
        { base: 'I', form: 'me', phonetic: '/miː/', zh: '我（宾格）', high: true },
        { base: 'you', form: 'you', phonetic: '/juː/', zh: '你（不变）' },
        { base: 'he', form: 'him', phonetic: '/hɪm/', zh: '他（宾格）', high: true },
        { base: 'she', form: 'her', phonetic: '/hɜː/', zh: '她（宾格）', high: true },
        { base: 'it', form: 'it', phonetic: '/ɪt/', zh: '它（不变）' },
        { base: 'we', form: 'us', phonetic: '/ʌs/', zh: '我们（宾格）', high: true },
        { base: 'they', form: 'them', phonetic: '/ðem/', zh: '他们（宾格）', high: true }
      ]
    },
    {
      groupName: '形容词性物主代词：后面必须跟名词',
      rule: '「谁的+东西」——这套词是形容词，后面必须挂一个名词：my book, their school。',
      words: [
        { base: 'I', form: 'my', phonetic: '/maɪ/', zh: '我的', high: true },
        { base: 'you', form: 'your', phonetic: '/jɔː/', zh: '你的', high: true },
        { base: 'he', form: 'his', phonetic: '/hɪz/', zh: '他的', high: true },
        { base: 'she', form: 'her', phonetic: '/hɜː/', zh: '她的 ★和宾格同形', high: true },
        { base: 'it', form: 'its', phonetic: '/ɪts/', zh: '它的 ★没有撇号', high: true },
        { base: 'we', form: 'our', phonetic: '/ˈaʊə/', zh: '我们的', high: true },
        { base: 'they', form: 'their', phonetic: '/ðeə/', zh: '他们的 ★别写成 there', high: true }
      ]
    },
    {
      groupName: '名词性物主代词：单独站着不带名词',
      rule: '「这是我的」——这套词自己就能站住，后面不跟名词：This book is mine.（his 两套同形）',
      words: [
        { base: 'my', form: 'mine', phonetic: '/maɪn/', zh: '我的（独立用）', high: true },
        { base: 'your', form: 'yours', phonetic: '/jɔːz/', zh: '你的（独立用）', high: true },
        { base: 'his', form: 'his', phonetic: '/hɪz/', zh: '他的 ★两套同形' },
        { base: 'her', form: 'hers', phonetic: '/hɜːz/', zh: '她的（独立用）' },
        { base: 'our', form: 'ours', phonetic: '/ˈaʊəz/', zh: '我们的（独立用）' },
        { base: 'their', form: 'theirs', phonetic: '/ðeəz/', zh: '他们的（独立用）' }
      ]
    },
    {
      groupName: '反身代词：自己对自己',
      rule: '「自己」= self（单数）/ selves（复数）。★注意：是 himself / themselves，不存在 hisself / theirselves！',
      words: [
        { base: 'I', form: 'myself', phonetic: '/maɪˈself/', zh: '我自己', high: true },
        { base: 'you', form: 'yourself', phonetic: '/jɔːˈself/', zh: '你自己' },
        { base: 'he', form: 'himself', phonetic: '/hɪmˈself/', zh: '他自己 ★不是hisself', high: true },
        { base: 'she', form: 'herself', phonetic: '/hɜːˈself/', zh: '她自己' },
        { base: 'it', form: 'itself', phonetic: '/ɪtˈself/', zh: '它自己' },
        { base: 'we', form: 'ourselves', phonetic: '/ˌaʊəˈselvz/', zh: '我们自己' },
        { base: 'they', form: 'themselves', phonetic: '/ðəmˈselvz/', zh: '他们自己 ★不是theirselves' }
      ]
    },
    {
      groupName: 'a / an：看音不看字母！',
      rule: '用 a 还是 an，听第一个「音」而不是看第一个字母：hour 的 h 不发音，开头是元音音 → an hour；university 读 /juː/，开头是辅音音 /j/ → a university。',
      words: [
        { base: 'hour', form: 'an hour', phonetic: '/ən ˈaʊə/', zh: '一小时 ★h不发音', high: true },
        { base: 'honest', form: 'an honest boy', phonetic: '', zh: '一个诚实的男孩 ★h不发音' },
        { base: 'university', form: 'a university', phonetic: '/ə ˌjuːnɪˈvɜːsəti/', zh: '一所大学 ★读/j/音', high: true },
        { base: 'uniform', form: 'a uniform', phonetic: '/ə ˈjuːnɪfɔːm/', zh: '一套校服 ★读/j/音', high: true },
        { base: 'European', form: 'a European country', phonetic: '', zh: '一个欧洲国家 ★读/j/音' },
        { base: 'umbrella', form: 'an umbrella', phonetic: '/ən ʌmˈbrelə/', zh: '一把伞（正常元音）', high: true },
        { base: 'egg', form: 'an egg', phonetic: '/ən eɡ/', zh: '一个鸡蛋（正常元音）', high: true }
      ]
    }
  ],
  L7: [
    {
      groupName: '并列三兄弟：and / but / or',
      rule: '把两段「旋律」连成一句的连奏线。and 顺着接，but 拐个弯，or 给选择。KET 考纲连接词一共就 7 个，这是前 3 个。',
      words: [
        { base: 'and', form: 'and', phonetic: '/ənd/', zh: '和；然后', high: true, ex: 'I like cats and dogs. 我喜欢猫和狗。' },
        { base: 'but', form: 'but', phonetic: '/bʌt/', zh: '但是', high: true, ex: "It's small but clean. 它小但是干净。" },
        { base: 'or', form: 'or', phonetic: '/ɔː/', zh: '或者；否则', high: true, ex: 'Tea or juice? 茶还是果汁？' }
      ]
    },
    {
      groupName: '从句四姐妹：when / where / because / if',
      rule: '这 4 个把一个「小句子」挂到主句上：when 挂时间，where 挂地点，because 挂原因，if 挂条件。剩下的 4 个考纲连接词都在这。',
      words: [
        { base: 'when', form: 'when', phonetic: '/wen/', zh: '当…的时候', high: true, ex: 'Call me when you arrive. 你到了就给我打电话。' },
        { base: 'where', form: 'where', phonetic: '/weə/', zh: '…的地方', high: true, ex: 'This is the park where we play. 这是我们玩的公园。' },
        { base: 'because', form: 'because', phonetic: '/bɪˈkɒz/', zh: '因为', high: true, ex: "I'm happy because it's Friday. 我开心因为今天是周五。" },
        { base: 'if', form: 'if', phonetic: '/ɪf/', zh: '如果', high: true, ex: "If it rains, we'll stay home. 如果下雨我们就待在家。" }
      ]
    }
  ],
  L8: [
    {
      groupName: '直接 + er / est：短词标配',
      rule: '比较级 = 尾巴挂 er（更…），最高级 = 挂 est + 前面加 the（最…）。大多数短词直接挂。',
      words: [
        { base: 'tall', form: 'taller / tallest', phonetic: '/ˈtɔːlə/', zh: '高', high: true },
        { base: 'old', form: 'older / oldest', phonetic: '/ˈəʊldə/', zh: '老；旧', high: true },
        { base: 'fast', form: 'faster / fastest', phonetic: '/ˈfɑːstə/', zh: '快', high: true },
        { base: 'small', form: 'smaller / smallest', phonetic: '/ˈsmɔːlə/', zh: '小' },
        { base: 'cheap', form: 'cheaper / cheapest', phonetic: '/ˈtʃiːpə/', zh: '便宜', high: true }
      ]
    },
    {
      groupName: '哑巴 e 结尾：只加 r / st',
      rule: '已经有个 e 在门口了，就别再排队——直接 +r / +st。',
      words: [
        { base: 'nice', form: 'nicer / nicest', phonetic: '/ˈnaɪsə/', zh: '好的', high: true },
        { base: 'large', form: 'larger / largest', phonetic: '/ˈlɑːdʒə/', zh: '大的', high: true },
        { base: 'late', form: 'later / latest', phonetic: '/ˈleɪtə/', zh: '晚的', high: true },
        { base: 'safe', form: 'safer / safest', phonetic: '/ˈseɪfə/', zh: '安全的' }
      ]
    },
    {
      groupName: '辅音 + y → ier / iest',
      rule: '和三单变 ies 一个脾气：y 变 i 再加 er / est。',
      words: [
        { base: 'happy', form: 'happier / happiest', phonetic: '/ˈhæpiə/', zh: '开心的', high: true },
        { base: 'easy', form: 'easier / easiest', phonetic: '/ˈiːziə/', zh: '容易的', high: true },
        { base: 'early', form: 'earlier / earliest', phonetic: '/ˈɜːliə/', zh: '早的', high: true },
        { base: 'heavy', form: 'heavier / heaviest', phonetic: '/ˈheviə/', zh: '重的' },
        { base: 'busy', form: 'busier / busiest', phonetic: '/ˈbɪziə/', zh: '忙的' },
        { base: 'funny', form: 'funnier / funniest', phonetic: '/ˈfʌniə/', zh: '好笑的' }
      ]
    },
    {
      groupName: '短元音护体：双写辅音 + er / est',
      rule: '和 -ing 双写一个道理：短元音 + 单辅音的短词，先双写末尾辅音护住读音。',
      words: [
        { base: 'big', form: 'bigger / biggest', phonetic: '/ˈbɪɡə/', zh: '大的', high: true },
        { base: 'hot', form: 'hotter / hottest', phonetic: '/ˈhɒtə/', zh: '热的', high: true },
        { base: 'thin', form: 'thinner / thinnest', phonetic: '/ˈθɪnə/', zh: '瘦的' },
        { base: 'sad', form: 'sadder / saddest', phonetic: '/ˈsædə/', zh: '难过的' },
        { base: 'wet', form: 'wetter / wettest', phonetic: '/ˈwetə/', zh: '湿的' }
      ]
    },
    {
      groupName: '不规则变化：乐队的老炮儿',
      rule: '越常用的词越不规则（暗线第三次出现！）——这几个必须整组背下来，KET 年年考。',
      words: [
        { base: 'good / well', form: 'better → best', phonetic: '/ˈbetə/ /best/', zh: '好 → 更好 → 最好', high: true },
        { base: 'bad', form: 'worse → worst', phonetic: '/wɜːs/ /wɜːst/', zh: '坏 → 更坏 → 最坏', high: true },
        { base: 'many / much', form: 'more → most', phonetic: '/mɔː/ /məʊst/', zh: '多 → 更多 → 最多', high: true },
        { base: 'little', form: 'less → least', phonetic: '/les/ /liːst/', zh: '少 → 更少 → 最少', high: true },
        { base: 'far', form: 'farther / further → farthest / furthest', phonetic: '/ˈfɑːðə/', zh: '远 → 更远 → 最远' }
      ]
    },
    {
      groupName: '常见不可数名词：不能加 a，也没有复数',
      rule: '中文觉得万物可数，英文里这些偏偏不可数——前面不能加 a/an，尾巴不能加 s，「多少」用 much / some / a lot of。',
      words: [
        { base: 'water', form: 'water', phonetic: '/ˈwɔːtə/', zh: '水', high: true },
        { base: 'milk', form: 'milk', phonetic: '/mɪlk/', zh: '牛奶', high: true },
        { base: 'bread', form: 'bread', phonetic: '/bred/', zh: '面包', high: true },
        { base: 'rice', form: 'rice', phonetic: '/raɪs/', zh: '米饭', high: true },
        { base: 'money', form: 'money', phonetic: '/ˈmʌni/', zh: '钱', high: true },
        { base: 'time', form: 'time', phonetic: '/taɪm/', zh: '时间', high: true },
        { base: 'homework', form: 'homework', phonetic: '/ˈhəʊmwɜːk/', zh: '作业 ★不说 homeworks', high: true },
        { base: 'information', form: 'information', phonetic: '/ˌɪnfəˈmeɪʃn/', zh: '信息' },
        { base: 'news', form: 'news', phonetic: '/njuːz/', zh: '新闻 ★长得像复数其实不可数', high: true },
        { base: 'advice', form: 'advice', phonetic: '/ədˈvaɪs/', zh: '建议' }
      ]
    },
    {
      groupName: '量词搭配：给不可数名词发「碗」',
      rule: '不可数名词要论「份」，就借一个容器/单位：a ___ of + 名词。想说复数就变容器：two cups of tea。',
      words: [
        { base: 'a piece of', form: 'a piece of bread', phonetic: '', zh: '一片/一块面包', high: true },
        { base: 'a cup of', form: 'a cup of tea', phonetic: '', zh: '一杯茶（热饮）', high: true },
        { base: 'a glass of', form: 'a glass of milk', phonetic: '', zh: '一杯牛奶（冷饮玻璃杯）', high: true },
        { base: 'a bottle of', form: 'a bottle of water', phonetic: '', zh: '一瓶水', high: true },
        { base: 'a bowl of', form: 'a bowl of rice', phonetic: '', zh: '一碗米饭' },
        { base: 'a slice of', form: 'a slice of cake', phonetic: '', zh: '一薄片蛋糕' },
        { base: 'a pair of', form: 'a pair of shoes', phonetic: '', zh: '一双鞋 ★成双的东西', high: true }
      ]
    },
    {
      groupName: '名词复数不规则：不走 -s 的老户口',
      rule: '这些老词的复数是「换脸」不是「加 s」——woman → women 连读音都大变（/ˈwɪmɪn/）。sheep 和 fish 更懒，单复数同形。',
      words: [
        { base: 'man', form: 'men', phonetic: '/men/', zh: '男人', high: true },
        { base: 'woman', form: 'women', phonetic: '/ˈwɪmɪn/', zh: '女人 ★读音大变', high: true },
        { base: 'child', form: 'children', phonetic: '/ˈtʃɪldrən/', zh: '孩子', high: true },
        { base: 'person', form: 'people', phonetic: '/ˈpiːpl/', zh: '人', high: true },
        { base: 'tooth', form: 'teeth', phonetic: '/tiːθ/', zh: '牙齿', high: true },
        { base: 'foot', form: 'feet', phonetic: '/fiːt/', zh: '脚', high: true },
        { base: 'mouse', form: 'mice', phonetic: '/maɪs/', zh: '老鼠' },
        { base: 'sheep', form: 'sheep', phonetic: '/ʃiːp/', zh: '绵羊 ★单复同形' },
        { base: 'fish', form: 'fish', phonetic: '/fɪʃ/', zh: '鱼 ★单复同形', high: true }
      ]
    }
  ]
};

// L3 追加不规则过去式六组（接现有 40 词）
SPECIAL.L3 = SPECIAL.L3.concat(irregularGroups);

const only = process.argv[2] && process.argv[2] !== 'all' ? process.argv[2].toUpperCase() : null;
let done = [];
data.lessons.forEach(l => {
  if (SPECIAL[l.id] && (!only || l.id === only)) {
    l.specialWords = SPECIAL[l.id];
    done.push(`${l.id}(${SPECIAL[l.id].length}组/${SPECIAL[l.id].reduce((a, g) => a + g.words.length, 0)}词)`);
  }
});
writeFileSync(FILE, JSON.stringify(data, null, 1), 'utf8');
console.log('已写入 specialWords:', done.join(' '));
