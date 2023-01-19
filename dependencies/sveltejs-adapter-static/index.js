import fs from 'fs/promises';
import path from 'path';
import { platforms } from './platforms.js';

/** @type {import('.').default} */
export default function (options) {
	return {
		name: '@sveltejs/adapter-static',

		async adapt(builder) {
			if (!options?.fallback) {
				/** @type {string[]} */
				const dynamic_routes = [];

				// this is a bit of a hack — it allows us to know whether there are dynamic
				// (i.e. prerender = false/'auto') routes without having dedicated API
				// surface area for it
				builder.createEntries((route) => {
					dynamic_routes.push(route.id);

					return {
						id: '',
						filter: () => false,
						complete: () => {}
					};
				});

				if (dynamic_routes.length > 0 && options?.strict !== false) {
					const prefix = path.relative('.', builder.config.kit.files.routes);
					const has_param_routes = dynamic_routes.some((route) => route.includes('['));
					const config_option =
						has_param_routes || JSON.stringify(builder.config.kit.prerender.entries) !== '["*"]'
							? `  - adjust the \`prerender.entries\` config option ${
									has_param_routes
										? '(routes with parameters are not part of entry points by default)'
										: ''
							  } — see https://kit.svelte.dev/docs/configuration#prerender for more info.`
							: '';

					builder.log.error(
						`@sveltejs/adapter-static: all routes must be fully prerenderable, but found the following routes that are dynamic:
${dynamic_routes.map((id) => `  - ${path.posix.join(prefix, id)}`).join('\n')}

You have the following options:
  - set the \`fallback\` option — see https://github.com/sveltejs/kit/tree/master/packages/adapter-static#spa-mode for more info.
  - add \`export const prerender = true\` to your root \`+layout.js/.ts\` or \`+layout.server.js/.ts\` file. This will try to prerender all pages.
  - add \`export const prerender = true\` to any \`+server.js/ts\` files that are not fetched by page \`load\` functions.
${config_option}
  - pass \`strict: false\` to \`adapter-static\` to ignore this error. Only do this if you are sure you don't need the routes in question in your final app, as they will be unavailable. See https://github.com/sveltejs/kit/tree/master/packages/adapter-static#strict for more info.

If this doesn't help, you may need to use a different adapter. @sveltejs/adapter-static can only be used for sites that don't need a server for dynamic rendering, and can run on just a static file server.
See https://kit.svelte.dev/docs/page-options#prerender for more details`
					);
					throw new Error('Encountered dynamic routes');
				}
			}

			const platform = platforms.find((platform) => platform.test());

			if (platform) {
				if (options) {
					builder.log.warn(
						`Detected ${platform.name}. Please remove adapter-static options to enable zero-config mode`
					);
				} else {
					builder.log.info(`Detected ${platform.name}, using zero-config mode`);
				}
			}

			const {
				pages = 'build',
				assets = pages,
				fallback,
				precompress,
				manifest = 'vite-manifest.json'
			} = options ?? platform?.defaults ?? /** @type {import('./index').AdapterOptions} */ ({});

			builder.rimraf(assets);
			builder.rimraf(pages);

			builder.writeClient(assets);
			builder.writePrerendered(pages);

			if (fallback) {
				builder.generateFallback(path.join(pages, fallback));
			}

			if (precompress) {
				builder.log.minor('Compressing assets and pages');
				if (pages === assets) {
					await builder.compress(assets);
				} else {
					await Promise.all([builder.compress(assets), builder.compress(pages)]);
				}
			}

			if (pages === assets) {
				builder.log(`Wrote site to "${pages}"`);
			} else {
				builder.log(`Wrote pages to "${pages}" and assets to "${assets}"`);
			}

			if (!options) platform?.done(builder);

			try {
				await makeManifest(pages, builder, manifest);
				builder.log.success('Make manifest.json success')
			} catch (error) {
				builder.log.error(error);
				throw new Error('Make manifest.json error');
			}
		}
	};
}

// 参考项目
// https://github.com/thecrazyrussian/sveltekit-adapter-browser-extension

async function makeManifest(pages, builder, manifest) {
	const encoding = 'utf8';
	const svelte_page = '/+page.svelte';
	const regexp_inline_script = /<script ([^]+?)>([^]+?)<\/script>/gi;

	const prefix = path.relative('.', builder.config.kit.files.routes);

	// 修改 manifest.json 中的页面文件路径
	const filepath = path.resolve('.', pages, 'manifest.json');
	const json = JSON.parse(await fs.readFile(filepath, { encoding }));

	const files = [];
	const route = (option, name) => {
		if (!option) return;
		if (!option[name]) return;
		if (typeof option[name] !== 'string') return;
		if (!option[name].endsWith(svelte_page)) return;

		option[name] = `${option[name].slice(prefix.length + 1, -svelte_page.length)}.html`;
		files.push(option[name]);
	};

	route(json, 'devtools_page');
	route(json, 'options_page');
	route(json.action, 'default_popup');
	route(json.options_ui, 'page');
	route(json.sandbox, 'page');
	route(json.chrome_url_overrides, 'bookmarks');
	route(json.chrome_url_overrides, 'history');
	route(json.chrome_url_overrides, 'newtab');

	// 修改页面文件中的内联脚本
	/** The content security policy of manifest_version 3 does not allow for inlined scripts.
	Until kit implements a config option (#1776) to externalize scripts, the below code block should do 
	for a quick and dirty externalization of the scripts' contents **/
	const hash = (value) => {
		let hash = 5381;
		let i = value.length;

		if (typeof value === 'string') {
			while (i) hash = (hash * 33) ^ value.charCodeAt(--i);
		} else {
			while (i) hash = (hash * 33) ^ value[--i];
		}

		return (hash >>> 0).toString(36);
	};

	for (const file of files) {
		const filepath = path.resolve('.', pages, file);
		let html = await fs.readFile(filepath, { encoding });

		let matches;
		while ((matches = regexp_inline_script.exec(html)) !== null) {
			const [script, attrs, content] = matches;
			const filename = `script-${hash(content)}.js`;
			const filepath = path.resolve('.', pages, filename);

			await fs.writeFile(filepath, content.replace(/\t\n/g, ''), { encoding });

			html = html.replace(script, `<script ${attrs} src="./${filename}"></script>`);
		}
		await fs.writeFile(filepath, html, { encoding });
	}

	await fs.writeFile(filepath, JSON.stringify(json, null, 2), { encoding });

	// 清理 vite-manifest.json
	await fs.rm(path.resolve('.', pages, manifest));
}
