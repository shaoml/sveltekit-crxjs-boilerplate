// https://developer.chrome.com/docs/extensions/mv3/manifest/

const config = {
	// Required
	manifest_version: 3,
	name: 'My Extension',
	version: '0.0.1',

	// Recommended
	action: {
		// optional
		// default_icon: {
		// 	'16': 'icons/16.png', // optional
		// 	'48': 'icons/48.png', // optional
		// 	'128': 'icons/128.png', // optional
		// },
		default_title: 'Click Me', // optional, shown in tooltip
		default_popup: 'src/routes/popup/+page.svelte', // optional
	},
	// default_locale: 'en',
	description: 'A plain text description',
	icons: {
		'16': 'icons/16.png',
		'48': 'icons/48.png',
		'128': 'icons/128.png',
	},

	// Optional
	author: 'shaoml.cn@gmail.com',
	// automation: {},
	background: {
		service_worker: 'src/scripts/background.ts',
		// type: 'module',
	},
	// chrome_settings_overrides: {},
	// chrome_url_overrides: {
	// 	bookmarks: 'overrides/bookmarks.html',
	// 	history: 'overrides/history.html',
	// 	newtab: 'overrides/newtab.html',
	// },
	// commands: {},
	content_scripts: [
		{
			matches: ['<all_urls>'],
			// css: ['src/content/index.css'],
			js: ['src/scripts/content.ts'],
		},
	],
	content_security_policy: {
		extension_pages: "script-src 'self'; object-src 'self';",
	},
	// cross_origin_embedder_policy: {},
	// cross_origin_opener_policy: {},
	// declarative_net_request: {},
	// devtools_page: 'devtools.html',
	// event_rules: [{}],
	// export: {},
	// externally_connectable: {},
	// file_browser_handlers: [],
	// file_system_provider_capabilities: {},
	// homepage_url: 'https://path/to/homepage',
	// host_permissions: ['*://*/*'],
	// import: [{}],
	// incognito: 'spanning, split, or not_allowed',
	// input_components: [{}],
	// key: 'publicKey',
	// minimum_chrome_version: '107',
	// nacl_modules: [],
	// oauth2: {},
	// omnibox: {},
	// optional_host_permissions: [],
	// optional_permissions: [],
	// options_page: 'options.html',
	// options_ui: {},
	// permissions: ['storage', 'tabs', 'activeTab'],
	// replacement_web_app: 'https://example.com',
	// requirements: {},
	// sandbox: {},
	// short_name: 'Short Name',
	// storage: {},
	// tts_engine: {},
	// update_url: 'https://path/to/updateInfo.xml',
	// version_name: '1.0 beta',
	web_accessible_resources: [
		{
			resources: ['*'],
			matches: ['*://*/*'],
		},
	],
};

export default config;
