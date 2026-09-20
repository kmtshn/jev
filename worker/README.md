# Jev API Proxy

GitHub Pages から TypeSafe API を直接呼ぶと、ブラウザの CORS 制約で失敗する環境があります。
この Worker は `https://kmtshn.github.io` からのリクエストだけを受け付け、TypeSafe API へ中継します。

## 重要

- TypeSafe APIキーは Worker に保存しません。
- APIキーは各リクエストの `Authorization: Bearer ...` を TypeSafe へ転送します。
- このコードでは APIキーや本文をログ出力しません。
- Cloudflare 側のアカウント設定やプラットフォームログの扱いは Cloudflare の設定・規約に従います。
- 許可しているAPIは `POST /v1/systemone` と `GET /v1/models` のみです。
- 許可Originは `https://kmtshn.github.io` のみです。

## デプロイ

Cloudflare アカウントで Workers を利用できる状態にしたあと、`worker` ディレクトリで:

```bash
npm install -g wrangler
wrangler login
wrangler deploy
```

表示されたURLが例えば:

```text
https://jev-api-proxy.<account>.workers.dev
```

なら、リポジトリルートの `config.js` を:

```js
window.JEV_API_BASE = "https://jev-api-proxy.<account>.workers.dev";
```

に変更して GitHub Pages を再公開します。

以降、サイト利用者はこれまでどおり自分のTypeSafe APIキーを画面に入力するだけです。
