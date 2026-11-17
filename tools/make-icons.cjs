// アプリのアイコン（icon-192.png・icon-512.png）を作る。青い空に、稲妻の形の電気のしるし。
// 使い方: node tools/make-icons.cjs（qa/ の playwright を使う）
const path = require("path");
const { chromium } = require(path.join(__dirname, "..", "qa", "node_modules", "playwright"));
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const s of [192, 512]) {
    const p = await b.newPage({ viewport: { width: s, height: s } });
    await p.setContent(`<body style="margin:0"><svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f4f7a"/><stop offset="1" stop-color="#2f7a5a"/></linearGradient></defs>
      <rect width="100" height="100" fill="url(#g)"/>
      <circle cx="50" cy="50" r="34" fill="#fffdf7"/>
      <path d="M56 18 L32 54 H48 L42 82 L68 44 H52 Z" fill="#e0a21a" stroke="#123554" stroke-width="3" stroke-linejoin="round"/></svg></body>`);
    await p.screenshot({ path: path.join(__dirname, "..", `icon-${s}.png`), clip: { x: 0, y: 0, width: s, height: s } });
  }
  await b.close();
})();
