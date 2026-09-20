# Jev Decision Studio

TypeSafe Jevをブラウザから試すための、Cloudflare Workers対応アプリです。

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

Cloudflare Workers Static Assetsで静的ファイルとAPI中継を同じWorkerから配信します。

公開URL:

`https://jev-api-proxy.kamata-shun-oki.workers.dev/`

## API

- Endpoint: `POST /v1/systemone`（同一Cloudflare Worker）
- Model: `jev-latest`
- Authorization: Bearer API key

TypeSafe公式ドキュメント:
https://docs.typesafe.ai/

## セキュリティ上の注意

入力したAPIキーをユーザーのブラウザから同一Cloudflare Workerへ送り、Workerがそのリクエストに限ってTypeSafe APIへ中継します。
WorkerやアプリのコードではAPIキーをlocalStorage、sessionStorage、Cookieへ保存しません。

ただし、ブラウザ上でAPIキーを利用する以上、そのブラウザの開発者ツールや実行中のページからキーを参照できる点は避けられません。
自分自身のAPIキーを自分の端末で利用する用途を想定しています。

## License

Personal / experimental project.


## Cloudflare WorkerでのAPI通信について

`worker/src/index.js` が `/v1/systemone` と `/v1/models` だけをTypeSafe APIへ中継し、それ以外のパスは静的アセットとして配信します。

ルートディレクトリでのデプロイ:

```bash
npx wrangler deploy
```

詳細: `worker/README.md`
