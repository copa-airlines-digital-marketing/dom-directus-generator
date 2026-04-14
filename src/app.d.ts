// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare module '$env/static/private' {
	export const DIRECTUS_URL: string;
	export const DIRECTUS_TOKEN: string;
}

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
