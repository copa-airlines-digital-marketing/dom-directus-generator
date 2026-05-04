import { env } from '$env/dynamic/private';
import type { Item_DestinationOfTheMonth } from '$directus/generated/collections/destination-of-the-month';

const COLLECTION_PATH = '/items/destination_of_the_month';
const FIELDS =
	'*,translations.*,destination_of_the_month_cards.*,destination_of_the_month_cards.translations.*';

type DirectusListResponse<T> = { data: T[] };

function collectionUrl(search: Record<string, string>): string {
	const base = env.DIRECTUS_URL.replace(/\/$/, '');
	const url = new URL(`${base}${COLLECTION_PATH}`);
	for (const [key, value] of Object.entries(search)) {
		url.searchParams.set(key, value);
	}
	return url.toString();
}

async function fetchItems(search: Record<string, string>): Promise<Item_DestinationOfTheMonth[]> {
	const query: Record<string, string> = {
		fields: FIELDS,
		...search,
	};

	const response = await fetch(collectionUrl(query), {
		headers: { Authorization: `Bearer ${env.DIRECTUS_TOKEN}` },
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(`Directus request failed (${response.status}): ${body}`);
	}

	const json = (await response.json()) as DirectusListResponse<Item_DestinationOfTheMonth>;
	return json.data ?? [];
}

function itemHasTranslation(item: Item_DestinationOfTheMonth, lang: 'es' | 'en' | 'pt'): boolean {
	const { translations } = item;
	if (!Array.isArray(translations)) return false;
	return translations.some((row) => {
		if (typeof row !== 'object' || row === null) return false;
		return 'languages_code' in row && (row as { languages_code?: string }).languages_code === lang;
	});
}

/**
 * Returns the first published destination of the month that includes a translation row for the given language.
 */
export async function getPublishedDestination(
	lang: 'es' | 'en' | 'pt',
): Promise<Item_DestinationOfTheMonth> {
	const items = await fetchItems({ 'filter[status][_eq]': 'published' });

	if (items.length === 0) {
		throw new Error('No published destination of the month found.');
	}

	const match = items.find((item) => itemHasTranslation(item, lang));

	if (!match) {
		throw new Error(
			`No published destination of the month found for language "${lang}". Published records exist, but none include a translation with languages_code "${lang}".`,
		);
	}

	return match;
}

/** Returns all published destination-of-the-month records with nested relations. */
export async function getAllPublishedDestinations(): Promise<Item_DestinationOfTheMonth[]> {
	return fetchItems({ 'filter[status][_eq]': 'published' });
}

/** Returns the published destination that matches a given slug, with a translation for the given language. */
export async function getDestinationBySlug(
	slug: string,
	lang: 'es' | 'en' | 'pt',
): Promise<Item_DestinationOfTheMonth | undefined> {
	const items = await fetchItems({
		'filter[status][_eq]': 'published',
		'filter[destination_slug][_eq]': slug,
	});
	return items.find((item) => itemHasTranslation(item, lang));
}
