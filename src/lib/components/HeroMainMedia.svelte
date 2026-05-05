<script lang="ts">
	import { Body } from 'design-sytem-svelte-components/typography';
	import { isHeroVideoAsset, parseMainImageField, type MainImageField } from '$lib/utils/mainImage';

	const ASSETS_BASE = 'https://cm-marketing.directus.app/assets';

	let {
		mainImage,
		title
	}: {
		mainImage: MainImageField;
		title: string;
	} = $props();

	const parsed = $derived(parseMainImageField(mainImage));
	const src = $derived(parsed ? `${ASSETS_BASE}/${parsed.id}` : '');
	const isVideo = $derived(
		parsed ? isHeroVideoAsset(parsed.mimeType, parsed.filename) : false
	);
</script>

{#if parsed}
	{#if isVideo}
		<!-- `src` on the element: asset URLs are UUID paths without extension; browser uses response MIME. -->
		<video
			class="h-full w-full object-cover object-center"
			{src}
			autoplay
			muted
			loop
			playsinline
			aria-label={title}
		></video>
	{:else}
		<img {src} alt={title} class="h-full w-full object-cover object-center" />
	{/if}
{:else}
	<div
		class="flex h-full min-h-48 w-full items-center justify-center bg-slate-800 text-slate-400"
	>
		<Body tag="span" size="body-small" variant="body-invert" class="mb-0">—</Body>
	</div>
{/if}
