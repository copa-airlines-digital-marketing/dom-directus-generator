import { error } from '@sveltejs/kit';
import { getAllPublishedDestinations, getPublishedDestination } from '$lib/server/directus';
import type { PageServerLoad } from './$types';

export async function entries() {
	const destinations = await getAllPublishedDestinations();
	const langs = ['es', 'en', 'pt'] as const;
	const available = new Set<string>();
	for (const dest of destinations) {
		const rows = dest.translations;
		if (!Array.isArray(rows)) continue;
		for (const row of rows) {
			if (typeof row === 'object' && row !== null && 'languages_code' in row) {
				const code = (row as { languages_code?: string }).languages_code;
				if (code) available.add(code);
			}
		}
	}
	return langs.filter((l) => available.has(l)).map((lang) => ({ lang }));
}

export const load: PageServerLoad = async ({ params }) => {
	const { lang } = params;
	if (lang !== 'es' && lang !== 'en' && lang !== 'pt') {
		throw error(404, 'Invalid language');
	}

	const published = await getAllPublishedDestinations();
	if (published.length === 0) {
		throw error(500, 'No published destination of the month found.');
	}

	const destination = await getPublishedDestination(lang);
	return { destination, lang: lang as 'es' | 'en' | 'pt' };
};
