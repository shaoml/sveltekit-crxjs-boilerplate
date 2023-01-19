# sveltekit-crxjs-boilerplate

## 构建工具

- [sveltekit](https://kit.svelte.dev/docs/introduction)
- [crxjs](https://crxjs.dev/vite-plugin)

## 依赖项目

- [sveltejs-adapter-crx](https://github.com/shaoml/sveltejs-adapter-crx)
- [crxjs-vite-plugin-sveltekit](https://github.com/shaoml/crxjs-vite-plugin-sveltekit)

## 源码结构

```bash
src
├── routes
│   ├── popup/+page.svelte
│   └── +layout.ts
├── scripts
│   ├── background.ts
│   └── content.ts
├── app.html
└── manifest.ts
static
└── icons
    ├── 16.png
    ├── 48.png
    └── 128.png
```

## How to use

### 从本项目开始

- 克隆项目到本地，安装依赖 `npm i` ，并构建项目 `npm run build` 。
- 用 chrome 打开 `chrome://extensions/`，开启`开发者模式`，点击`加载已解压的扩展程序`，选择到项目目录下的`build`目录。
- 在 chrome 的扩展工具栏中固定图标，点击图标，显示弹窗并开始计时。

### 从新项目开始

- 用 `sveltekit` 构建骨架项目。

```bash
npm create svelte@latest app-name
# select: Skeleton project
# select: Yes, using TypeScript syntax
```

- 设置预渲染模式。

```javascript
// src/routes/+layout.ts
export const prerender = true;
```

- 复制清单文件 `src/manifest.ts` 及其关联的图标、脚本、页面等。
- 复制`dependencies`目录到新项目根目录下，并安装依赖 `npm i`。
- 配置构建选项：

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static'; // Required
import { vitePreprocess } from '@sveltejs/kit/vite';

const config = {
	preprocess: vitePreprocess(),

	kit: {
		appDir: 'app', // Required
		adapter: adapter({ strict: true }), // Required
		csp: { directives: { 'script-src': ['self'] } }, // optional
	},
};

export default config;
```

```javascript
// vite.config.ts
import { crx } from '@crxjs/vite-plugin'; // Required
import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path';
import { mergeConfig, type UserConfig } from 'vite';
import manifest from './src/manifest'; // Required

const config: UserConfig = {
	plugins: [
		sveltekit(),
		crx({ manifest }), // Required
		{
			name: 'mergeConfig',
			apply: 'build',
			enforce: 'post',
			config(config) {
				return mergeConfig(config, {
					publicDir: 'static', // Required
				});
			},
		},
	],
	build: { assetsInlineLimit: 0 }, // optional
	resolve: {
		alias: {
			'~': resolve(__dirname, 'src'), // optional
		},
	},
};

export default config;
```

- 构建项目 `npm run build`，并在 chrome 中调试。方法同`从本项目开始`。

### 代码风格

- 格式化

```json
// .vscode/settings.json
{
	"editor.formatOnSave": true,
	"editor.defaultFormatter": "esbenp.prettier-vscode",
	"editor.codeActionsOnSave": {
		"source.organizeImports": true,
		"source.fixAll.eslint": true,
		"source.fixAll.stylelint": true
	},
	"eslint.validate": ["svelte"],
	"stylelint.validate": ["svelte"],
	"[svelte]": {
		"editor.formatOnSave": true,
		"editor.defaultFormatter": "svelte.svelte-vscode"
	}
}
```

```json
// .prettierrc
// 删除
{
	"plugins": ["prettier-plugin-svelte"],
	"pluginSearchDirs": ["."],
	"overrides": [{ "files": "*.svelte", "options": { "parser": "svelte" } }]
}
```

```bash
npm i -D stylelint stylelint-config-standard stylelint-config-prettier stylelint-config-recess-order
npm i -D postcss-html stylelint-config-html
```

```json
// .stylelintrc
{
	"extends": [
		"stylelint-config-html/svelte",
		"stylelint-config-standard",
		"stylelint-config-prettier",
		"stylelint-config-recess-order"
	]
}
```
