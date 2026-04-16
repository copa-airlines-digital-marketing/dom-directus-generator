import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		alias: {
			'design-sytem-svelte-components/typography': path.resolve(
				rootDir,
				'libs/design-system/dist/components/typography/index.js'
			)
		}
	},
	server: {
		fs: {
			allow: [path.resolve(rootDir, 'libs/design-system')]
		}
	}
});
