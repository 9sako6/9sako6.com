# 9sako6.com Business Card Front Page Design

## Goal

`9sako6.com` へアクセスしたときに、記事一覧や個別記事ではなく、単一の静的な `index.html` だけが見える状態にする。ページはダークモード前提の超ミニマムな名刺ページとして構成し、`X` と `GitHub` へのリンクを主目的とする。

## Current State

- このリポジトリのルートに空の `index.html` がある。
- `public/favicon.ico` は存在する。
- `posts/` 配下に過去記事の Markdown が残っている。
- Terraform は `../9sako6-terraform/services/blog/production/main.tf` で Cloudflare Pages の `9sako6-blog` プロジェクトに `9sako6.com` を紐づけている。
- Terraform では Pages のデプロイ内容自体は管理しておらず、配信コンテンツの切り替えはこのリポジトリ側の静的成果物で完結する。

## Requirements

### Functional

- ルートの `index.html` をトップページとして配信する。
- `favicon.ico` をトップページから参照できるようにする。
- ページには以下だけを置く。
  - 表示名 `9sako6`
  - 短い自己紹介 1 文
  - `X`
  - `GitHub`
- 既存記事は一旦見えなくなってよい。
- `about/page.mdx` にあった自己紹介の雰囲気は、ごく短い説明文として一部のみ残してよい。

### Non-Functional

- HTML は素の `index.html` で実装する。
- Web 標準を優先し、JavaScript なしで成立させる。
- アクセシビリティを考慮する。
  - 適切な見出し構造
  - 十分なコントラスト
  - キーボード操作可能なリンク
  - `prefers-color-scheme: dark` に依存せず、初期状態でダークテーマ
- 見た目は名刺のように簡潔にする。

## Chosen Approach

### 1. Static Root Page

ルートの `index.html` を完成させ、ビルド不要の静的トップページとして扱う。内容は HTML と最小限のインライン CSS のみで構成する。これがもっとも変更範囲が小さく、目的にも合う。

### 2. Favicon at Root

既存の `public/favicon.ico` をルートの `favicon.ico` としても参照できるようにする。Cloudflare Pages の静的配信で確実に `/favicon.ico` が解決される形に寄せる。

### 3. Route Suppression with `_redirects`

Cloudflare Pages 向けにルートの `_redirects` を追加し、`/* / 200` で全パスをトップページへフォールバックさせる。これにより過去記事や個別 URL は一旦見えなくなり、要件どおり「アクセスしたら `index.html` が表示されるだけ」の挙動になる。

Terraform 側は既存の Pages プロジェクトとドメイン関連付けを保持するだけで十分なので、今回は変更しない。`apply` もしない。

## Content Design

掲載文言は以下の粒度に留める。

- タイトル: `9sako6`
- 説明: `Web アプリケーションの開発をしている 9sako6 です。`
- リンク:
  - `X`: `https://x.com/9sako6`
  - `GitHub`: `https://github.com/9sako6`

説明文は `about/page.mdx` の詳細な経歴ではなく、名刺として破綻しない最小限だけを採用する。

## Accessibility

- ページ最上位に `main` を置く。
- 主見出しは `h1` のみを使う。
- 補足文は通常段落で表現する。
- ナビゲーション相当のリンク群はリストで表現する。
- フォーカスリングを明示する。
- テキストサイズと行間を小さくしすぎない。

## Testing

- `index.html` をローカルで開いて表示崩れがないことを確認する。
- `python3 -m http.server` 等の簡易サーバで `/` と `/favicon.ico` を確認する。
- `_redirects` は Cloudflare Pages 依存のためローカルでは完全再現しないが、ファイル内容を確認して意図したルールになっていることを検証する。

## Files To Change

- Modify: `index.html`
- Create: `favicon.ico`
- Create: `_redirects`
- No change: `../9sako6-terraform/services/blog/production/main.tf`

## Out of Scope

- 記事データの削除
- Next.js やビルド設定の復旧
- Terraform の apply
- Cloudflare Pages プロジェクト名やドメイン設定の変更
