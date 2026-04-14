import { error } from '@sveltejs/kit';
import { getAllPublishedDestinations, getPublishedDestination } from '$lib/server/directus';
import type { PageServerLoad } from './$types';

export async function entries() {
	await getAllPublishedDestinations();
	return [{ lang: 'es' }, { lang: 'en' }, { lang: 'pt' }];
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
