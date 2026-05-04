import { error } from '@sveltejs/kit';
import { getDestinationBySlug } from '$lib/server/directus';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const lang = params.lang as 'es' | 'en' | 'pt';
	const { slug } = params;

	const destination = await getDestinationBySlug(slug, lang);

	if (!destination) {
		throw error(404, `No published destination found for slug "${slug}" in language "${lang}".`);
	}

	return { destination, lang, slug };
};
