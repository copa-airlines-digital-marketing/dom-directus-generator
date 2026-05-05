import { env } from '$env/dynamic/private';
import type { Item_DestinationOfTheMonth } from '$directus/generated/collections/destination-of-the-month';

const COLLECTION_PATH = '/items/destination_of_the_month';
const FIELDS =
	'*,translations.*,destination_of_the_month_cards.*,destination_of_the_month_cards.translations.*';

/**
 * Static tokens often cannot read `directus_files`, so `main_image` stays a UUID string and
 * nested `main_image.type` is never returned. Public `/assets/:id` still exposes `Content-Type`
 * (e.g. video/webm) — use a light HEAD to decide image vs video for the hero.
 */
function assetProbeUrl(fileId: string): string {
	const base = getDirectusUrl().replace(/\/$/, '');
	return `${base}/assets/${fileId}`;
}

async function probeAssetContentType(fileId: string): Promise<string | undefined> {
	const url = assetProbeUrl(fileId);
	try {
		let res = await fetch(url, { method: 'HEAD' });
		if (res.ok) {
			const ct = res.headers.get('content-type')?.split(';')[0]?.trim();
			if (ct) return ct;
		}
		// Some hosts disallow HEAD; single-byte GET is enough for Content-Type.
		res = await fetch(url, { headers: { Range: 'bytes=0-0' } });
		if (res.ok || res.status === 206) {
			return res.headers.get('content-type')?.split(';')[0]?.trim();
		}
	} catch {
		// ignore
	}
	return undefined;
}

async function withResolvedMainImage(
	item: Item_DestinationOfTheMonth,
): Promise<Item_DestinationOfTheMonth> {
	const main = item.main_image;
	if (typeof main !== 'string' || !main.trim()) return item;

	const type = await probeAssetContentType(main.trim());
	if (!type) return item;

	return {
		...item,
		// Runtime shape for pages: `{ id, type }` matches Directus file expansion + `parseMainImageField`.
		main_image: { id: main.trim(), type } as Item_DestinationOfTheMonth['main_image']
	};
}

type DirectusListResponse<T> = { data: T[] };

// $env/dynamic/private is only populated at request runtime (Cloudflare Worker context).
// During build-time prerender (entries()), fall back to process.env so the same
// module works in both phases without needing separate imports.
function getDirectusUrl(): string {
	const val = env.DIRECTUS_URL ?? process.env['DIRECTUS_URL'];
	if (!val) throw new Error('[directus] DIRECTUS_URL is not set in environment variables.');
	return val;
}
function getDirectusToken(): string {
	const val = env.DIRECTUS_TOKEN ?? process.env['DIRECTUS_TOKEN'];
	if (!val) throw new Error('[directus] DIRECTUS_TOKEN is not set in environment variables.');
	return val;
}

function collectionUrl(search: Record<string, string>): string {
	const base = getDirectusUrl().replace(/\/$/, '');
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
		headers: { Authorization: `Bearer ${getDirectusToken()}` },
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(`Directus request failed (${response.status}): ${body}`);
	}

	const json = (await response.json()) as DirectusListResponse<Item_DestinationOfTheMonth>;
	const rows = json.data ?? [];
	return Promise.all(rows.map((item) => withResolvedMainImage(item)));
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
