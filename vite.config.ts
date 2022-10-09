import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()],
	build: {
		sourcemap: process.env.PUBLIC_RUN_MODE === 'development' ? 'inline' : false
	}
};

export default config;
