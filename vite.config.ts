import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import * as dotenv from 'dotenv';
dotenv.config();

const config: UserConfig = {
	plugins: [sveltekit()],
	build: {
		sourcemap: process.env.MODE === 'dev' ? 'inline' : false
	}
};

export default config;
