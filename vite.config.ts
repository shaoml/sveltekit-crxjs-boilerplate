import { crx } from '@crxjs/vite-plugin';
import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path';
import { mergeConfig, type UserConfig } from 'vite';
import manifest from './src/manifest';

const config: UserConfig = {
	plugins: [
		sveltekit(),
		crx({ manifest }),
		{
			name: 'mergeConfig',
			apply: 'build',
			enforce: 'post',
			config(config) {
				return mergeConfig(config, {
					publicDir: 'static',
				});
			},
		},
	],
	build: { assetsInlineLimit: 0 },
	resolve: {
		alias: {
			'~': resolve(__dirname, 'src'),
		},
	},
};

export default config;
