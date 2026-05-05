const VIDEO_EXT = /\.(webm|mp4|m4v|ogg|ogv|mov)(\?.*)?$/i;

/** Directus file field: UUID string, or expanded `{ id, type, filename_download }`. */
export type MainImageField = string | MainImageExpanded | null | undefined;

export type MainImageExpanded = {
	id?: string | null;
	type?: string | null;
	filename_download?: string | null;
};

export function parseMainImageField(main: unknown): {
	id: string;
	mimeType?: string;
	filename?: string;
} | null {
	if (main == null) return null;
	if (typeof main === 'string' && main.trim() !== '') {
		return { id: main.trim() };
	}
	if (typeof main === 'object' && main !== null && 'id' in main) {
		const id = (main as MainImageExpanded).id;
		if (typeof id === 'string' && id.trim() !== '') {
			const type = (main as MainImageExpanded).type;
			const filename_download = (main as MainImageExpanded).filename_download;
			return {
				id: id.trim(),
				mimeType: typeof type === 'string' ? type : undefined,
				filename: typeof filename_download === 'string' ? filename_download : undefined
			};
		}
	}
	return null;
}

export function isHeroVideoAsset(mimeType?: string, filename?: string): boolean {
	if (mimeType?.toLowerCase().startsWith('video/')) return true;
	if (filename && VIDEO_EXT.test(filename)) return true;
	return false;
}
