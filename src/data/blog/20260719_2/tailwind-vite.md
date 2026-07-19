---
title: "Tailwind CSSをViteで使う方法"
description: "Viteプラグインを使ってTailwind CSSを導入する最小手順"
publishedAt: 2026-07-19
author: "Sasaki"
tags: ["Tailwind CSS", "Vite", "Astro"]
---

## 1. パッケージを追加

```bash
npm install tailwindcss @tailwindcss/vite
```

## 2. Viteプラグインを設定

Astroでは `astro.config.mjs` に追加する。

```js
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

## 3. CSSを読み込む

共通CSSに次の1行を書き、レイアウトからそのCSSを読み込む。

```css
@import "tailwindcss";
```

あとはHTMLやAstroコンポーネントでクラスを指定する。

```html
<h1 class="text-3xl font-bold text-emerald-700">Hello Tailwind!</h1>
```
