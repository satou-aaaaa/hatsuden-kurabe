// 発電のしくみくらべの問題を作る（ブラウザと node の両方で使う）。
// 中身は、資源エネルギー庁の資料（下の SRC。2026-11-17 に読んだ）で確かめた、発電方法ごとの特徴だけ。
// 発電の割合・費用などの数字は年で変わるので、答えにしない。意見の分かれる論点（原子力をどうするかなど）は扱わない。
// 1問は、手がかり3枚から発電方法を当て（1段目）、つぎに「決め手はどれ？」を3枚から選ぶ（2段目）。
// 手がかりは、答えには必ず当てはまる。決め手の1枚は、ほかの選び肢には当てはまらない。残りの2枚は、ほかの選び肢のどれかにも当てはまる。
// 乱数 R は呼ぶ回数が毎回同じになるように使う（sort の比較の中では引かない）。同じ tag なら、どの端末でも同じ問題になる。
// METHODS・CLUES・言い回しの並びは最後に足すだけにする（並べ替え・削除をすると過去の日の問題が変わる）。
(function (root) {
  "use strict";
  const LV = ["やさしい", "ふつう", "むずかしい"];
  const MANGA = "https://www.enecho.meti.go.jp/category/electricity_and_gas/nuclear/001/pamph/manga_denki/html/";
  const ENE = "https://www.enecho.meti.go.jp/about/special/johoteikyo/";

  // 出典（画面の「なぜ」と「このゲームについて」に出す）。どれも経済産業省 資源エネルギー庁のページ
  const SRC = {
    m1: ["資源エネルギー庁「マンガでわかる 電気はあってあたりまえ？」火力発電・水力発電", MANGA + "004/"],
    m2: ["資源エネルギー庁「マンガでわかる 電気はあってあたりまえ？」太陽光・風力・地熱発電", MANGA + "005/"],
    m3: ["資源エネルギー庁「マンガでわかる 電気はあってあたりまえ？」原子力発電", MANGA + "006/"],
    m4: ["資源エネルギー庁「マンガでわかる 電気はあってあたりまえ？」どうしていろいろな発電方法を使うの？", MANGA + "007/"],
    re: ["資源エネルギー庁「なっとく！再生可能エネルギー」再エネとは", "https://www.enecho.meti.go.jp/category/saving_and_new/saiene/renewable/outline/index.html"],
    lng: ["資源エネルギー庁 エネこれ「LNGを安定的に供給するための取り組み」", ENE + "lng.html"],
    coal: ["資源エネルギー庁 エネこれ「なぜ、日本は石炭火力発電の活用をつづけているのか？」", ENE + "qa_sekitankaryoku.html"],
    bio: ["資源エネルギー庁 エネこれ「地域のさまざまなモノが資源になる『バイオマス・エネルギー』」", ENE + "biomass.html"],
    geo: ["資源エネルギー庁 エネこれ「地方創生にも役立つ再エネ『地熱発電』」", ENE + "chinetsuhatsuden.html"],
    hydro: ["資源エネルギー庁 エネこれ「水力発電は安定供給性にすぐれた再生可能エネルギー」", ENE + "suiryokuhatuden.html"],
    pump: ["資源エネルギー庁 エネこれ「大活躍する『揚水発電』の役割とは？」", ENE + "yousuihatuden.html"],
    wp: ["資源エネルギー庁「エネルギー白書2024」第2部第1章第3節 一次エネルギーの動向", "https://www.enecho.meti.go.jp/about/whitepaper/2024/html/2-1-3.html"],
    pam: ["資源エネルギー庁「日本のエネルギー 2025年度版」8.再エネ", "https://www.enecho.meti.go.jp/about/pamphlet/energy2025/08.html"],
  };

  // 発電方法。fam：kar＝化石燃料を燃やす火力・gen＝原子力・re＝再生可能エネルギー（「なっとく！再生可能エネルギー」の定義）
  const METHODS = [
    { id: "lng", name: "LNG火力", icon: "🔥", fam: "kar", src: ["m1", "lng"], why: "LNGは、天然ガスを約−162℃で液体にした燃料です。燃やした熱で蒸気をつくり、タービンを回します。" },
    { id: "sekitan", name: "石炭火力", icon: "🔥", fam: "kar", src: ["m1", "coal"], why: "石炭を燃やした熱で蒸気をつくります。燃料は安めで、産地が分散していますが、CO2は多めです。" },
    { id: "sekiyu", name: "石油火力", icon: "🔥", fam: "kar", src: ["m1", "wp"], why: "石油を燃やした熱で蒸気をつくります。燃料の石油（原油）は、ほとんどを中東から輸入しています。" },
    { id: "genshi", name: "原子力", icon: "⚛️", fam: "gen", src: ["m3"], why: "ウランの核分裂で出た熱で蒸気をつくります。少しの燃料で多くの電気ができ、発電のときCO2を出しません。" },
    { id: "sui", name: "水力", icon: "💧", fam: "re", src: ["m1", "hydro"], why: "高い所から落ちる水の力で水車を回します。国内でまかなえ、発電の量も調整できます。" },
    { id: "taiyo", name: "太陽光", icon: "☀️", fam: "re", src: ["m2"], why: "パネルに当たった光を電気に変えます。雨の日や夜は発電の量が少なくなります。" },
    { id: "furyoku", name: "風力", icon: "🌀", fam: "re", src: ["m2"], why: "風で大きな羽根を回し、ナセルの中の発電機を動かします。風が弱いと発電の量が少なくなります。" },
    { id: "chinetsu", name: "地熱", icon: "♨️", fam: "re", src: ["m2", "geo"], why: "地下の熱水や蒸気でタービンを回します。天気に左右されず、昼も夜も発電できます。" },
    { id: "bio", name: "バイオマス", icon: "🌱", fam: "re", src: ["bio"], why: "間伐材や家畜のふんなど、生物から生まれた資源を燃料にします。燃やすとCO2は出ますが、カーボンニュートラルとされます。" },
  ];
  const MID = METHODS.map((m) => m.id), MBY = Object.fromEntries(METHODS.map((m) => [m.id, m]));
  const FAM = { kar: "化石燃料を燃やす火力", gen: "原子力", re: "再生可能エネルギー" };
  const KAR = ["lng", "sekitan", "sekiyu"], RE = ["sui", "taiyo", "furyoku", "chinetsu", "bio"], ALL = MID;
  const not = (...ids) => ALL.filter((x) => !ids.includes(x));

  // 手がかり。y：当てはまる方法、n：当てはまらないと言える方法（どちらにも無い方法は、資料で決められないので選び肢にそろえない）
  // d：0＝やさしい手がかり（しくみ）・1＝むずかしい手がかり（くわしい特徴）。s：出典
  const CLUES = [
    // ---- いくつかの方法に当てはまる手がかり（決め手にもなる）----
    { id: "burn", t: "燃料を燃やした熱で蒸気をつくる", y: KAR, n: ["genshi", "sui", "taiyo", "furyoku", "chinetsu"], d: 0, s: "m1" },
    { id: "fossil", t: "石油・石炭・天然ガスのどれかが燃料", y: KAR, n: not(...KAR), d: 0, s: "m1" },
    { id: "import", t: "燃料のほとんどを外国から輸入している", y: KAR, n: ["sui", "taiyo", "furyoku", "chinetsu"], d: 0, s: "m4" },
    { id: "co2", t: "燃料を燃やすので、CO2が出る", y: [...KAR, "bio"], n: ["genshi", "sui", "taiyo", "furyoku"], d: 0, s: "m1" },
    { id: "noco2", t: "発電のときにCO2を出さない", y: ["genshi", "sui", "taiyo", "furyoku"], n: [...KAR, "bio"], d: 0, s: "m4" },
    { id: "adjust", t: "発電する量を調節しやすい", y: [...KAR, "sui"], n: ["taiyo", "furyoku"], d: 1, s: "m1" },
    { id: "limited", t: "燃料は限りある資源で、いつか使えなくなる", y: KAR, n: RE, d: 1, s: "m1" },
    { id: "steam", t: "蒸気の力でタービンを回す", y: [...KAR, "genshi", "chinetsu"], n: ["sui", "taiyo", "furyoku"], d: 0, s: "m1" },
    { id: "aus", t: "燃料のおもな輸入先にオーストラリアがある", y: ["lng", "sekitan"], n: ["sui", "taiyo", "furyoku", "chinetsu"], d: 1, s: "wp" },
    { id: "renew", t: "くり返し使える「再生可能エネルギー」", y: RE, n: [...KAR, "genshi"], d: 0, s: "re" },
    { id: "domestic", t: "国産のエネルギーで、輸入にたよらない", y: RE, n: KAR, d: 0, s: "re" },
    { id: "nofuel", t: "燃料がいらず、燃料費がかからない", y: ["sui", "chinetsu"], n: [...KAR, "genshi", "bio"], d: 1, s: "geo" },
    { id: "stable", t: "安定して電気をつくれる", y: ["genshi", "sui", "chinetsu"], n: ["taiyo", "furyoku"], d: 1, s: "m4" },
    { id: "weather", t: "季節や天気で、発電の量が変わる", y: ["taiyo", "furyoku"], n: ["chinetsu"], d: 0, s: "re" },
    { id: "wide", t: "たくさん発電するには、広い土地がいる", y: ["taiyo", "furyoku"], n: [], d: 1, s: "m2" },
    { id: "battery", t: "電気をためる蓄電池も用意したい", y: ["taiyo", "furyoku"], n: [], d: 1, s: "m2" },
    // ---- 1つの方法だけの手がかり（決め手）----
    { id: "lngliq", t: "天然ガスを冷やして液体にした燃料を使う", y: ["lng"], n: not("lng"), d: 0, s: "lng" },
    { id: "lng162", t: "燃料は約−162℃で液体になる", y: ["lng"], n: not("lng"), d: 1, s: "lng" },
    { id: "lng600", t: "燃料は液体にすると体積が約600分の1", y: ["lng"], n: not("lng"), d: 1, s: "lng" },
    { id: "lngpipe", t: "産地とパイプラインでつながらず、液体にして運ぶ", y: ["lng"], n: not("lng"), d: 1, s: "lng" },
    { id: "coal", t: "掘り出した石炭を燃料にする", y: ["sekitan"], n: not("sekitan"), d: 0, s: "m1" },
    { id: "coalco2", t: "化石燃料の中で、CO2の出る量が多い", y: ["sekitan"], n: ["lng", "sekiyu", "genshi", "sui", "taiyo", "furyoku"], d: 1, s: "coal" },
    { id: "coalcheap", t: "熱量あたりの燃料の値段が、化石燃料でいちばん安い", y: ["sekitan"], n: not("sekitan"), d: 1, s: "coal" },
    { id: "coalspread", t: "燃料の産地が分散していて、掘れる年数も長い", y: ["sekitan"], n: ["lng", "sekiyu", "sui", "taiyo", "furyoku", "chinetsu"], d: 1, s: "coal" },
    { id: "oil", t: "石油（原油）を燃料にする", y: ["sekiyu"], n: not("sekiyu"), d: 0, s: "m1" },
    { id: "mideast", t: "燃料のほとんどを中東から輸入している", y: ["sekiyu"], n: ["lng", "sekitan", "sui", "taiyo", "furyoku", "chinetsu"], d: 0, s: "wp" },
    { id: "saudi", t: "燃料のおもな輸入先はサウジアラビアやUAE", y: ["sekiyu"], n: ["lng", "sekitan", "sui", "taiyo", "furyoku", "chinetsu"], d: 1, s: "wp" },
    { id: "uran", t: "ウランを燃料にする", y: ["genshi"], n: not("genshi"), d: 0, s: "m3" },
    { id: "fission", t: "核分裂で出た熱で、水を蒸気にする", y: ["genshi"], n: not("genshi"), d: 0, s: "m3" },
    { id: "pellet", t: "燃料のペレット1個で、家庭の電気の6〜8か月分", y: ["genshi"], n: not("genshi"), d: 1, s: "m3" },
    { id: "rod", t: "制御棒で、反応をコントロールする", y: ["genshi"], n: not("genshi"), d: 1, s: "m3" },
    { id: "recycle", t: "使い終わった燃料を、リサイクルして使える", y: ["genshi"], n: [...KAR, "sui", "taiyo", "furyoku", "chinetsu"], d: 1, s: "m3" },
    { id: "radio", t: "放射性物質をあつかうので、厳しい管理がいる", y: ["genshi"], n: not("genshi"), d: 1, s: "m3" },
    { id: "fall", t: "高い所から落ちる水の力で水車を回す", y: ["sui"], n: not("sui"), d: 0, s: "m1" },
    { id: "dam", t: "ダムに水をためてから落とす方法がある", y: ["sui"], n: not("sui"), d: 0, s: "m1" },
    { id: "drought", t: "雨や雪が少ないと、発電できないこともある", y: ["sui"], n: [...KAR, "chinetsu"], d: 1, s: "m1" },
    { id: "small", t: "川辺に水車を置く、小さなものが増えそう", y: ["sui"], n: not("sui"), d: 1, s: "m1" },
    { id: "pump", t: "電気が余る時に水をくみ上げ、あとで発電する", y: ["sui"], n: not("sui"), d: 1, s: "pump" },
    { id: "panel", t: "パネルに当たった光を電気に変える", y: ["taiyo"], n: not("taiyo"), d: 0, s: "m2" },
    { id: "roof", t: "家の屋根にのせる、小さなものもある", y: ["taiyo"], n: [...KAR, "genshi", "chinetsu"], d: 1, s: "m2" },
    { id: "blade", t: "風で大きな羽根（プロペラ）を回す", y: ["furyoku"], n: not("furyoku"), d: 0, s: "m2" },
    { id: "nacelle", t: "羽根の後ろの「ナセル」に発電機がある", y: ["furyoku"], n: not("furyoku"), d: 1, s: "m2" },
    { id: "weak", t: "風が弱いと、発電の量が少なくなる", y: ["furyoku"], n: not("furyoku"), d: 1, s: "m2" },
    { id: "offshore", t: "海の上（洋上）につくる取り組みもある", y: ["furyoku"], n: not("furyoku"), d: 1, s: "pam" },
    { id: "hot", t: "地下の熱水や蒸気をくみ上げて使う", y: ["chinetsu"], n: not("chinetsu"), d: 0, s: "m2" },
    { id: "volcano", t: "つくれる場所は、火山や自然公園の近くが多い", y: ["chinetsu"], n: not("chinetsu"), d: 1, s: "m2" },
    { id: "rank3", t: "日本の資源量は、世界で3番目に多い", y: ["chinetsu"], n: [...KAR, "genshi"], d: 1, s: "geo" },
    { id: "back", t: "使ったあとの熱水は、地下に戻す", y: ["chinetsu"], n: not("chinetsu"), d: 1, s: "geo" },
    { id: "wood", t: "森の間伐材や家畜のふんを燃料にする", y: ["bio"], n: not("bio"), d: 0, s: "bio" },
    { id: "food", t: "食べ物のごみ（食品廃棄物）も燃料になる", y: ["bio"], n: not("bio"), d: 1, s: "bio" },
    { id: "neutral", t: "CO2は出るが「カーボンニュートラル」とされる", y: ["bio"], n: not("bio"), d: 1, s: "bio" },
    { id: "village", t: "燃料になる資源は、農村や漁村に多い", y: ["bio"], n: not("bio"), d: 1, s: "bio" },
    { id: "biocost", t: "燃料代が、費用の約7割をしめる（木質）", y: ["bio"], n: ["sui", "taiyo", "furyoku", "chinetsu"], d: 1, s: "bio" },
  ];
  const CL = Object.fromEntries(CLUES.map((c) => [c.id, c]));

  // 種類＝発電方法×難しさ（例 "lng0"）。やさしい：選び肢3つ・決め手はしくみ。ふつう：4つ。むずかしい：4つ・同じなかまをまぜ、くわしい決め手
  const KINDS = [];
  for (const lv of [0, 1, 2]) for (const m of METHODS) KINDS.push({ id: m.id + lv, m: m.id, lv, name: m.name });
  const BY = Object.fromEntries(KINDS.map((k) => [k.id, k]));
  const kindsOf = (lv) => KINDS.filter((k) => k.lv === lv).map((k) => k.id);
  const kindsOfM = (m) => KINDS.filter((k) => k.m === m).map((k) => k.id);

  const ri = (R, a, b) => a + Math.floor(R() * (b - a + 1));
  const pick = (R, a) => a[ri(R, 0, a.length - 1)];
  function shuffle(R, a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = ri(R, 0, i); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  function pickN(R, a, n) { return shuffle(R, a).slice(0, n); }

  // 1段目のヒント（見るところ）：答えのなかまを言う（答えそのものは言わない）
  const lookOf = (m) => (MBY[m].fam === "re" ? "答えは「再生可能エネルギー」のなかまです。" : "答えは「再生可能エネルギー」ではありません。");

  // 問題を組む。決め手 → 手がかり2枚 → ほかの選び肢（手がかり2枚のどちらにも当てはまる方法を1つずつ入れる）
  function build(R, m, lv) {
    const nOpt = lv === 0 ? 3 : 4, mine = CLUES.filter((c) => c.y.includes(m));
    for (let t = 0; t < 200; t++) {
      // 決め手：答えに当てはまり、選び肢にそろえる分だけ「当てはまらない」方法がある手がかり
      let keys = mine.filter((c) => c.n.length >= nOpt - 1);
      if (lv === 0) keys = keys.filter((c) => c.d === 0);
      if (lv === 2 && keys.filter((c) => c.d === 1).length >= 2) keys = keys.filter((c) => c.d === 1); // くわしい決め手が2つ以上ある方法は、それだけから
      if (!keys.length) keys = mine.filter((c) => c.n.length >= nOpt - 1);
      const key = pick(R, keys);
      // 手がかり2枚：答えにも、決め手で消える方法のどれかにも当てはまる
      const sup = mine.filter((c) => c !== key && c.y.some((x) => x !== m && key.n.includes(x)));
      if (sup.length < 2) continue;
      const [s1, s2] = pickN(R, sup, 2);
      const pool = key.n.filter((x) => x !== m);
      const a = pick(R, s1.y.filter((x) => x !== m && pool.includes(x))), b = pick(R, s2.y.filter((x) => x !== m && pool.includes(x)));
      const ds = [a]; if (!ds.includes(b)) ds.push(b);
      // むずかしい：できれば同じなかまを先にまぜる
      const fam = MBY[m].fam, rest = shuffle(R, pool.filter((x) => !ds.includes(x)));
      const order = lv === 2 ? rest.filter((x) => MBY[x].fam === fam).concat(rest.filter((x) => MBY[x].fam !== fam)) : rest;
      for (const x of order) if (ds.length < nOpt - 1) ds.push(x);
      if (ds.length !== nOpt - 1) continue;
      // 手がかり2枚は、決め手にならない（ほかの選び肢のどれかにも当てはまる）ことを確かめる
      if (![s1, s2].every((c) => c.y.some((x) => ds.includes(x)))) continue;
      const cl = shuffle(R, [key, s1, s2]).map((c) => c.id), opts = shuffle(R, [m, ...ds]);
      return { cl, grp: key.id, opts: opts.map((x) => MBY[x].name), ans: MBY[m].name, om: opts, v: `${cl.join(".")}:${opts.join(".")}` };
    }
    return null;
  }

  function seedOf(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // 1問を作る。tag は「種類|種」（例 "lng0|2026-11-17:d0"）。同じ tag ならいつも同じ問題
  function make(tag) {
    const [kind] = String(tag).split("|"), k = Object.prototype.hasOwnProperty.call(BY, kind) ? BY[kind] : null;
    if (!k) return null;
    const p = build(rng(seedOf(tag)), k.m, k.lv);
    if (!p) return null;
    const M = MBY[k.m], key = CL[p.grp];
    const src = [...new Set([...M.src, ...p.cl.map((c) => CL[c].s)])].map((s) => SRC[s]);
    return { tag, kind, m: k.m, lv: k.lv, name: M.name, icon: M.icon, fam: M.fam, look: lookOf(k.m), why: M.why, key: key.t,
      clues: p.cl.map((c) => ({ id: c, t: CL[c].t })), src, ...p };
  }
  // 同じ問題かを見分ける鍵（答え・決め手・手がかりの組・選び肢の組。並びだけちがうものは同じ）
  const keyOf = (P) => `${P.m}:${P.grp}:${P.cl.slice().sort().join("/")}:${P.opts.slice().sort().join("/")}`;

  // 今日の5問（やさしい2・ふつう2・むずかしい1）。発電方法は重ねない
  function dailyTags(date) {
    const R = rng(seedOf("day:" + date)), ms = pickN(R, MID, 5), lvs = [0, 0, 1, 1, 2];
    return ms.map((m, i) => `${m}${lvs[i]}|${date}:d${i}`);
  }
  // 上級の3問（むずかしいだけ・今日の5問のむずかしいとは別の発電方法）
  function hardTags(date) {
    const dh = BY[dailyTags(date)[4].split("|")[0]].m, R = rng(seedOf("hard:" + date)), ms = pickN(R, MID.filter((x) => x !== dh), 3);
    return ms.map((m, i) => `${m}2|${date}:h${i}`);
  }

  const HATSU = { KINDS, BY, METHODS, MBY, MID, CLUES, CL, FAM, LV, SRC, kindsOf, kindsOfM, seedOf, rng, make, keyOf, dailyTags, hardTags, pickN };
  if (typeof module !== "undefined" && module.exports) module.exports = HATSU; else root.HATSU = HATSU;
})(typeof self !== "undefined" ? self : this);
