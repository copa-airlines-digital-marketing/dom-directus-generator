import { error } from '@sveltejs/kit';
import { getAllPublishedDestinations, getDestinationBySlug } from '$lib/server/directus';
import type { PageServerLoad } from './$types';

export async function entries() {
	const destinations = await getAllPublishedDestinations();
	const result: { lang: string; slug: string }[] = [];

	for (const dest of destinations) {
		if (!dest.destination_slug) continue;
		const rows = dest.translations;
		if (!Array.isArray(rows)) continue;
		for (const row of rows) {
			if (typeof row !== 'object' || row === null) continue;
			const code = (row as { languages_code?: string }).languages_code;
			if (code === 'es' || code === 'en' || code === 'pt') {
				result.push({ lang: code, slug: dest.destination_slug });
			}
		}
	}

	return result;
}

export const load: PageServerLoad = async ({ params }) => {
	const lang = params.lang as 'es' | 'en' | 'pt';
	const { slug } = params;

	const destination = await getDestinationBySlug(slug, lang);

	if (!destination) {
		throw error(404, `No published destination found for slug "${slug}" in language "${lang}".`);
	}

	return { destination, lang, slug };
};
