import { Adapter } from '@sveltejs/kit';

export interface AdapterOptions {
	pages?: string;
	assets?: string;
	fallback?: string;
	precompress?: boolean;
	strict?: boolean;
	manifest?: string;
}

export default function plugin(options?: AdapterOptions): Adapter;
