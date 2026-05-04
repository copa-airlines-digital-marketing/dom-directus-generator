import { getAllPublishedDestinations } from '$lib/server/directus';
import type { PageServerLoad } from './$types';

type Lang = 'es' | 'en' | 'pt';
const VALID_LANGS: Lang[] = ['es', 'en', 'pt'];

function availableLangs(translations: unknown): Lang[] {
	if (!Array.isArray(translations)) return [];
	const codes = new Set<string>();
	for (const row of translations) {
		if (typeof row === 'object' && row !== null && 'languages_code' in row) {
			const code = (row as { languages_code?: string }).languages_code;
			if (code) codes.add(code);
		}
	}
	return VALID_LANGS.filter((l) => codes.has(l));
}

export const load: PageServerLoad = async () => {
	const raw = await getAllPublishedDestinations();
	const destinations = raw.map((d) => ({
		...d,
		availableLangs: availableLangs(d.translations),
	}));
	return { destinations };
};
