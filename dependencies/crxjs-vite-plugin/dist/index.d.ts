import { ConfigEnv, Plugin, ViteDevServer, PluginOption } from 'vite';
import { PluginContext, OutputBundle, OutputOptions } from 'rollup';
import { Options } from 'fast-glob';

interface DeclarativeNetRequestResource {
    id: string;
    enabled: boolean;
    path: string;
}
interface WebAccessibleResourceByMatch {
    matches: string[];
    resources: string[];
    use_dynamic_url?: boolean;
}
interface WebAccessibleResourceById {
    extension_ids: string[];
    resources: string[];
    use_dynamic_url?: boolean;
}
interface ManifestV3 {
    manifest_version: number;
    name: string;
    version: string;
    default_locale?: string | undefined;
    description?: string | undefined;
    icons?: chrome.runtime.ManifestIcons | undefined;
    action?: chrome.runtime.ManifestAction | undefined;
    author?: string | undefined;
    background?: {
        service_worker: string;
        type?: 'module';
    } | undefined;
    chrome_settings_overrides?: {
        homepage?: string | undefined;
        search_provider?: chrome.runtime.SearchProvider | undefined;
        startup_pages?: string[] | undefined;
    } | undefined;
    chrome_ui_overrides?: {
        bookmarks_ui?: {
            remove_bookmark_shortcut?: boolean | undefined;
            remove_button?: boolean | undefined;
        } | undefined;
    } | undefined;
    chrome_url_overrides?: {
        bookmarks?: string | undefined;
        history?: string | undefined;
        newtab?: string | undefined;
    } | undefined;
    commands?: {
        [name: string]: {
            suggested_key?: {
                default?: string | undefined;
                windows?: string | undefined;
                mac?: string | undefined;
                chromeos?: string | undefined;
                linux?: string | undefined;
            } | undefined;
            description?: string | undefined;
            global?: boolean | undefined;
        };
    } | undefined;
    content_capabilities?: {
        matches?: string[] | undefined;
        permissions?: string[] | undefined;
    } | undefined;
    content_scripts?: {
        matches?: string[] | undefined;
        exclude_matches?: string[] | undefined;
        css?: string[] | undefined;
        js?: string[] | undefined;
        run_at?: string | undefined;
        all_frames?: boolean | undefined;
        match_about_blank?: boolean | undefined;
        include_globs?: string[] | undefined;
        exclude_globs?: string[] | undefined;
    }[] | undefined;
    content_security_policy?: {
        extension_pages?: string;
        sandbox?: string;
    };
    converted_from_user_script?: boolean | undefined;
    current_locale?: string | undefined;
    declarative_net_request?: {
        rule_resources: DeclarativeNetRequestResource[];
    };
    devtools_page?: string | undefined;
    event_rules?: {
        event?: string | undefined;
        actions?: {
            type: string;
        }[] | undefined;
        conditions?: chrome.declarativeContent.PageStateMatcherProperties[] | undefined;
    }[] | undefined;
    externally_connectable?: {
        ids?: string[] | undefined;
        matches?: string[] | undefined;
        accepts_tls_channel_id?: boolean | undefined;
    } | undefined;
    file_browser_handlers?: {
        id?: string | undefined;
        default_title?: string | undefined;
        file_filters?: string[] | undefined;
    }[] | undefined;
    file_system_provider_capabilities?: {
        configurable?: boolean | undefined;
        watchable?: boolean | undefined;
        multiple_mounts?: boolean | undefined;
        source?: string | undefined;
    } | undefined;
    homepage_url?: string | undefined;
    host_permissions?: string[] | undefined;
    import?: {
        id: string;
        minimum_version?: string | undefined;
    }[] | undefined;
    export?: {
        whitelist?: string[] | undefined;
    } | undefined;
    incognito?: string | undefined;
    input_components?: {
        name?: string | undefined;
        type?: string | undefined;
        id?: string | undefined;
        description?: string | undefined;
        language?: string | undefined;
        layouts?: string[] | undefined;
    }[] | undefined;
    key?: string | undefined;
    minimum_chrome_version?: string | undefined;
    nacl_modules?: {
        path: string;
        mime_type: string;
    }[] | undefined;
    oauth2?: {
        client_id: string;
        scopes?: string[] | undefined;
    } | undefined;
    offline_enabled?: boolean | undefined;
    omnibox?: {
        keyword: string;
    } | undefined;
    optional_permissions?: chrome.runtime.ManifestPermissions[] | string[] | undefined;
    options_page?: string | undefined;
    options_ui?: {
        page?: string | undefined;
        chrome_style?: boolean | undefined;
        open_in_tab?: boolean | undefined;
    } | undefined;
    permissions?: chrome.runtime.ManifestPermissions[] | string[] | undefined;
    platforms?: {
        nacl_arch?: string | undefined;
        sub_package_path: string;
    }[] | undefined;
    plugins?: {
        path: string;
    }[] | undefined;
    requirements?: {
        '3D'?: {
            features?: string[] | undefined;
        } | undefined;
        plugins?: {
            npapi?: boolean | undefined;
        } | undefined;
    } | undefined;
    sandbox?: {
        pages: string[];
        content_security_policy?: string | undefined;
    } | undefined;
    short_name?: string | undefined;
    spellcheck?: {
        dictionary_language?: string | undefined;
        dictionary_locale?: string | undefined;
        dictionary_format?: string | undefined;
        dictionary_path?: string | undefined;
    } | undefined;
    storage?: {
        managed_schema: string;
    } | undefined;
    tts_engine?: {
        voices: {
            voice_name: string;
            lang?: string | undefined;
            gender?: string | undefined;
            event_types?: string[] | undefined;
        }[];
    } | undefined;
    update_url?: string | undefined;
    version_name?: string | undefined;
    web_accessible_resources?: (WebAccessibleResourceById | WebAccessibleResourceByMatch)[] | undefined;
}

declare type ManifestV3Export = ManifestV3 | Promise<ManifestV3> | ManifestV3Fn;
declare type ManifestV3Fn = (env: ConfigEnv) => ManifestV3 | Promise<ManifestV3>;
declare const defineManifest: (manifest: ManifestV3Export) => ManifestV3Export;
/**
 * Content script resources like CSS and image files must be declared in the
 * manifest under `web_accessible_resources`. Manifest V3 uses a match pattern
 * to narrow the origins that can access a Chrome CRX resource.
 *
 * Content script resources use the same match pattern as the content script for
 * web accessible resources.
 *
 * You don't need to define a match pattern for dynamic content script
 * resources, but if you want to do so, you can use the helper function
 * `defineDynamicResource` to define your web accessible resources in a TypeScript file:
 *
 * ```typescript
 * import { crx, defineManifest, defineDynamicResource }
 * const manifest = defineManifest({
 *   "web_accessible_resources": [
 *     defineDynamicResource({
 *       matches: ["https://google.com/*", "file:///*.mp3", "..."]
 *       use_dynamic_url?: true
 *     })
 *   ]
 * })
 * ```
 */
declare const defineDynamicResource: ({ matches, use_dynamic_url, }: Omit<WebAccessibleResourceByMatch, 'resources'>) => WebAccessibleResourceByMatch;

interface CrxPlugin extends Plugin {
    /** Runs during dev mode when the file writer has started and server is listening. */
    fileWriterStart?: (server: ViteDevServer) => Promise<void> | void;
    /** Runs during the transform hook for the manifest. */
    transformCrxManifest?: (this: PluginContext, manifest: ManifestV3) => Promise<ManifestV3 | null | undefined> | ManifestV3 | null | undefined;
    /** Runs during generateBundle, before manifest output. */
    renderCrxManifest?: (this: PluginContext, manifest: ManifestV3, bundle: OutputBundle) => Promise<ManifestV3 | null | undefined> | ManifestV3 | null | undefined;
}
interface CrxOptions {
    contentScripts?: {
        preambleCode?: string | false;
        hmrTimeout?: number;
        injectCss?: boolean;
    };
    fastGlobOptions?: Options;
}

declare const filesReady: () => Promise<{
    type: 'writeBundle';
    options: OutputOptions;
    bundle: OutputBundle;
    duration: number;
    timestamp: number;
}>;
/** Trigger a rebuild from other plugins */
declare const rebuildFiles: () => Promise<void>;

declare const crx: ({ manifest, ...options }: {
    manifest: ManifestV3Export;
} & CrxOptions) => PluginOption[];
declare const chromeExtension: ({ manifest, ...options }: {
    manifest: ManifestV3Export;
} & CrxOptions) => PluginOption[];

export { CrxPlugin, ManifestV3Export, chromeExtension, crx, defineDynamicResource, defineManifest, filesReady, rebuildFiles };
