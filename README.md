# Jev Decision Studio

TypeSafe Jev をブラウザから試すための、GitHub Pages対応の静的Webアプリです。

## 主な機能

- TypeSafe APIキーをユーザー自身が入力
- APIキーは localStorage / sessionStorage / Cookie に保存しない
- 判断させたい内容（State）を自由入力
- 複数質問を1回のAPIリクエストで実行
- Choice / Noul / Score に対応
- Choiceは「キー :: 判断基準」で簡単入力
- Scoreは2〜10段階の判断基準を1行ずつ入力
- NoulはYES / NOの判断基準を任意指定
- 確率分布、Confidence、トークン数、ブラウザから見た応答時間を表示
- インフラ障害 / 営業 / 事務・請求 / 総務のサンプル
- レスポンシブ対応、ライトモード

## 公開

GitHub Actions の `Deploy GitHub Pages` ワークフローで `main` ブランチを公開します。

公開URL:

`https://kmtshn.github.io/jev/`

初回のみ、リポジトリの **Settings → Pages** で GitHub Pages が有効になっていることを確認してください。ワークフロー側でも有効化を試みます。

## API

- Endpoint: `POST https://api.typesafe.ai/v1/systemone`
- Model: `jev-latest`
- Authorization: Bearer API key

TypeSafe公式ドキュメント:
https://docs.typesafe.ai/

## セキュリティ上の注意

GitHub Pages版では、入力したAPIキーをユーザーのブラウザからCloudflare Workerへ送り、Workerがそのリクエストに限ってTypeSafe APIへ中継します。
WorkerやアプリのコードではAPIキーをlocalStorage、sessionStorage、Cookieへ保存しません。

ただし、ブラウザ上でAPIキーを利用する以上、そのブラウザの開発者ツールや実行中のページからキーを参照できる点は避けられません。
自分自身のAPIキーを自分の端末で利用する用途を想定しています。

## License

Personal / experimental project.


## GitHub Pages でのAPI通信について

TypeSafe API はブラウザからの直接アクセスが CORS でブロックされる場合があります。
Windows版やPython/cURLでは動くのにGitHub Pages版だけ `Failed to fetch` になる場合、APIキーではなくブラウザのCORS制約が原因です。

このリポジトリには `worker/` にCloudflare Workerの最小中継コードを含めています。
Workerをデプロイ後、`config.js` の `window.JEV_API_BASE` にWorker URLを設定してください。未設定のままでは、開発用にTypeSafe APIへ直接接続するため、GitHub Pages上ではCORSで失敗する可能性があります。

詳細: `worker/README.md`
