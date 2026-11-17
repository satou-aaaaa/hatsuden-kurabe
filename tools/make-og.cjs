// SNS で貼られたときの絵（og.png 1200×630）を作る。今日の問題（答え）は入れず、遊び方の例だけ（手がかり3枚と選び肢）。
// 使い方: node tools/make-og.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  const clue = (n, t) => `<div style="font-size:30px;font-weight:700;padding:10px 18px;border-radius:12px;background:#fff;border:3px solid #1d2a3f55;display:flex;gap:14px;align-items:center"><span style="background:#1f4f7a;color:#fff;border-radius:50%;width:44px;height:44px;display:grid;place-items:center;flex:none">${n}</span>${t}</div>`;
  const opt = (t) => `<span style="font-size:30px;font-weight:900;padding:10px 18px;border-radius:12px;background:#fff;border:3px solid #1d2a3f">${t}</span>`;
  await p.setContent(`<body style="margin:0;font-family:'Noto Sans CJK JP','IPAPGothic',sans-serif">
  <div style="width:1200px;height:630px;box-sizing:border-box;padding:48px 64px;background:#eef3ef;color:#1d2a3f;display:flex;gap:44px;align-items:center">
    <div style="flex:0 0 400px">
      <div style="font-size:25px;color:#83261a;letter-spacing:.02em;white-space:nowrap">資源エネルギー庁の資料で学ぶ</div>
      <div style="font-size:92px;font-weight:900;margin-top:8px;line-height:1.15;color:#123554">発電の<br><span style="color:#2f7a5a">しくみ</span><br>くらべ</div>
    </div>
    <div style="flex:1;background:#fffdf7;border:4px solid #1d2a3f;border-radius:8px;overflow:hidden">
      <div style="font-size:30px;font-weight:700;padding:18px 20px 6px;background:#1d2a3f;color:#fff">⚡ 手がかり3枚。どの発電方法？</div>
      <div style="display:flex;flex-direction:column;gap:10px;padding:16px">${clue(1, "発電のときにCO2を出さない")}${clue(2, "くり返し使えるエネルギー")}${clue(3, "？？？")}</div>
      <div style="display:flex;gap:10px;padding:0 16px 18px;flex-wrap:wrap">${opt("水力")}${opt("地熱")}${opt("風力")}${opt("太陽光")}</div>
    </div>
  </div></body>`);
  await p.screenshot({ path: path.join(__dirname, "..", "og.png") });
  await b.close();
})();
