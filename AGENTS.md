# AGENTS.md

発電のしくみくらべ：手がかり3枚から発電方法（火力3つ・原子力・水力・太陽光・風力・地熱・バイオマス）を当てる1日5問の学習ゲーム。正解したら「決め手はどれ？」（その1枚だけでほかの選び肢を全部消せる手がかり）も選ぶ。`index.html` と `data.js`（発電方法と手がかり）を GitHub Pages で公開する。

## 準備（最初に一度）

```bash
bash scripts/setup.sh   # Node.js（版は .nvmrc）を確かめ、検査の依存とブラウザを入れる。何度実行してもよい
```

Claude Code のクラウドセッションでは `.claude/settings.json` のフックが自動で実行する。

## push する前の確認

```bash
node qa/run.mjs   # 手がかりの表（資料の表と同じか）・問題（27種類×3000問：選び肢3〜4つ・答えは1つ・決め手は1枚だけ・出典）・今日の5問と上級（3年分）・とことん・通しで遊ぶ・続きから・2段目・復習・幅320px・PWA・引き継ぎ・見やすさ（CI の QA と同じ）
```

## このリポジトリの決まり

- 中身は資源エネルギー庁の資料（`data.js` の `SRC`。2026-11-17 に読んだ）で確かめた、発電方法ごとの特徴だけ。手がかりを足すときは資料を読み、`CLUES` に出典 `s` を付け、`qa/run.mjs` の `TT`（別に書いた資料の表）にも足す。
- 範囲は発電する側だけ。家の省エネ（setsuden-kotsu）とは重ねない。発電の割合・費用など年で変わる数字は答えにしない。原子力をどうするかなど意見の分かれる論点は扱わず、資料に書いてある特徴だけ（QA が言い方を見る）。
- 手がかりの `y` は当てはまる方法、`n` は当てはまらないと言える方法。どちらにも無い方法は、その手がかりが決め手の問題では選び肢にしない。決め手でない2枚は、ほかの選び肢のどれかにも当てはまる（QA が全問見る）。
- 種類は発電方法×難しさ（例 `lng0`）。やさしい：選び肢3つ・決め手はしくみ。ふつう：4つ。むずかしい：4つ・くわしい決め手・同じなかまをまぜる。ヒント1は「再生可能エネルギーのなかまか」、ヒント2はまちがいの選び肢を消して2つにしぼる。2段目のヒントは決め手でない手がかりを1つ消す。
- 今日の5問（やさしい2・ふつう2・むずかしい1、発電方法は重ねない）・上級（むずかしい3、今日のむずかしいと別の方法）は日本時間の日付の種で決まり、だれでも同じ。`Math.random()` は練習・とことんの種だけ。乱数は `sort` の比較の中で引かない。`METHODS`・`CLUES` の並びは最後に足すだけ（QA の `PIN` が第1回の1問目を見る）。`data.js` を変える PR は自動ではマージされない（`hold_paths`）。
- ★はまちがい＋ヒントの数（0で★3・1で★2・2以上で★1）。上級はヒントなし。時間制限なし。
- 好きなだけ遊べる：チケット・ライフ・回数制限・🔒で開くモードを入れない（shared-workflows `routines/game-dev.md` F1〜F7。QA が見る）。とことん（`runs.e`）はまちがえても続き、「ここで降りる」で終わる。
- 1問を深くする：`depth.js` と `qa/depth-check.mjs` は shared-workflows `template/` の写しで、ここでは直さない。自信あり・2段目「決め手はどれ？」・復習（1→3→7日後）。記録 `hatsuden-v1`・文字 `hatsuden-fs`・復習 `hatsuden-depth`。
- 共有は遊ぶ人が押したときに開くリンクだけ。シェアの文に問題・答えを出さない。感想は Issue フォーム（`.github/ISSUE_TEMPLATE/feedback.yml`）を開くだけ。応援は Ko-fi へのただのリンクだけ。
- 外へ通信しない（CSP の `connect-src 'self'` を広げない）。見やすさ（`<!-- a11y:begin -->`〜`end`・`qa/a11y.mjs`）と引き継ぎ（`transfer.js`・`qa/transfer-check.mjs`）は shared-workflows `template/` の写しで、ここでは直さない。
- 画面の土台は、ひな形（`node scripts/new-game.mjs`）に、別の学習ゲームの index.html の作りを写して作った。写し元の言葉が残っていないかを QA が見る。
- PWA：画面のファイルを足したら `sw.js` の `SHELL` にも足し、中身を大きく変えたら `CACHE` の版を上げる。アイコンは `node tools/make-icons.cjs`、`og.png` は `node tools/make-og.cjs`。
- 公開リポジトリなので、個人情報・鍵を入れない。

## 公開

- GitHub Pages は `main` のルート（`/`）を公開する。PR の QA と Secret scan が ✅ になると `automerge.yml` が自動でマージする。止めたいときは下書きにするか、ラベル「自動マージしない」を付ける。
- `sw.js`・`manifest.webmanifest`・`data.js` を変える PR は自動ではマージされない（`hold_paths`）。CodeRabbit のレビューを読み、手でマージする直前に今の head へのレビューを読み直す。CodeRabbit は PR に `@coderabbitai review` とコメントして頼む。

## 共通のきまり

- PR の作り方・マージの仕方は satou-aaaaa/shared-workflows の `routines/pr.md`、全体のきまりは `routines/common.md` に従う。
- CI の部品は shared-workflows の共通部品を呼ぶ。リポジトリ側の .github/workflows には呼び出しと設定値だけを書く。
- Claude 以外の AI・人が作業するときは、shared-workflows の `routines/tool-map.md` と `routines/without-claude.md` を読む。
