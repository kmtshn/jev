# Jev Cloudflare Worker

静的ファイルをCloudflare Workers Static Assetsから配信し、APIリクエストだけをTypeSafeへ中継します。

## 重要

- TypeSafe APIキーは Worker に保存しません。
- APIキーは各リクエストの `Authorization: Bearer ...` を TypeSafe へ転送します。
- このコードでは APIキーや本文をログ出力しません。
- Cloudflare 側のアカウント設定やプラットフォームログの扱いは Cloudflare の設定・規約に従います。
- APIとして処理するのは `POST /v1/systemone` と `GET /v1/models` のみです。
- 同一Worker Origin以外からのAPIリクエストは拒否します。

## デプロイ

CloudflareアカウントでWorkersを利用できる状態にしたあと、リポジトリルートで:

```bash
npx wrangler login
npx wrangler deploy
```

表示されたURLが例えば:

```text
https://jev-api-proxy.<account>.workers.dev
```

なら、そのURLがアプリとAPIの同一Originになります。サイト利用者は自分のTypeSafe APIキーを画面に入力するだけです。
