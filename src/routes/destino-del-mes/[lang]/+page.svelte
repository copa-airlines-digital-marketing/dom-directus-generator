<script lang="ts">
	import FareIntro from '$lib/components/FareIntro.svelte';
	import type { PageData } from './$types';

	const ASSETS_BASE = 'https://cm-marketing.directus.app/assets';

	let { data }: { data: PageData } = $props();

	type MonthTranslation = {
		languages_code: string;
		intro_title?: string | null;
		intro_description?: string | null;
		destination_label?: string | null;
	};

	type CardTranslation = {
		languages_code: string;
		card_title?: string | null;
		card_description?: string | null;
		card_image_alt?: string | null;
	};

	type Card = {
		id?: number;
		card_image?: string | null;
		translations?: unknown;
	};

	const translation = $derived.by((): MonthTranslation | undefined => {
		const rows = data.destination.translations;
		if (!Array.isArray(rows)) return undefined;
		return rows.find(
			(t): t is MonthTranslation =>
				typeof t === 'object' &&
				t !== null &&
				'languages_code' in t &&
				(t as MonthTranslation).languages_code === data.lang,
		);
	});

	function cardTranslation(card: Card): CardTranslation | undefined {
		const rows = card.translations;
		if (!Array.isArray(rows)) return undefined;
		return rows.find(
			(t): t is CardTranslation =>
				typeof t === 'object' &&
				t !== null &&
				'languages_code' in t &&
				(t as CardTranslation).languages_code === data.lang,
		);
	}

	const cards = $derived.by((): Card[] => {
		const raw = data.destination.destination_of_the_month_cards;
		if (!Array.isArray(raw)) return [];
		return [...raw]
			.filter((c): c is Card => typeof c === 'object' && c !== null)
			.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
	});

	const fareDestinationLabel = $derived(
		translation?.destination_label?.trim() ||
			data.destination.destination_slug ||
			'',
	);
</script>

<svelte:head>
	{#if translation?.intro_title}
		<title>{translation.intro_title}</title>
	{/if}
</svelte:head>

{#if translation}
	<div class="min-h-screen bg-slate-100">
		<section class="relative h-[min(70vh,30rem)] w-full overflow-hidden bg-slate-900">
			{#if data.destination.main_image}
				<img
					src="{ASSETS_BASE}/{data.destination.main_image}"
					alt={translation.intro_title ?? ''}
					class="h-full w-full object-cover object-bottom"
				/>
			{:else}
				<div class="flex h-full min-h-[12rem] w-full items-center justify-center bg-slate-800 text-slate-400">
					<span class="text-sm">—</span>
				</div>
			{/if}
			<div
				class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent"
			></div>
		</section>

		<div class="container mx-auto px-4 pb-16">
			<article
				class="relative z-10 -mt-20 mx-auto max-w-3xl rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl md:p-10"
			>
				<h1 class="mb-4 text-center text-3xl font-bold text-primary md:text-4xl">
					{translation.intro_title}
				</h1>
				{#if translation.intro_description}
					<p
						class="whitespace-pre-line text-center text-lg leading-relaxed text-slate-600 md:text-xl"
					>
						{translation.intro_description}
					</p>
				{/if}
			</article>

			<div class="mx-auto mt-14 max-w-5xl">
				<div class="grid gap-6 sm:grid-cols-2">
					{#each cards as card (card.id ?? card.card_image)}
						{@const ct = cardTranslation(card)}
						{#if card.card_image && ct}
							<div
								class="group relative aspect-[4/3] overflow-hidden rounded-2xl border-2 border-primary/20 bg-slate-200 shadow-md transition-all duration-300 hover:border-primary hover:shadow-xl"
							>
								<img
									src="{ASSETS_BASE}/{card.card_image}"
									alt={ct.card_image_alt ?? ct.card_title ?? ''}
									class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								/>
								<div
									class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"
								></div>
								<div class="absolute inset-x-0 bottom-0 p-6 text-white">
									<h3 class="text-xl font-bold drop-shadow-sm md:text-2xl">{ct.card_title}</h3>
									{#if ct.card_description}
										<p class="mt-2 text-sm leading-relaxed text-white/95 drop-shadow-sm md:text-base">
											{ct.card_description}
										</p>
									{/if}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</div>

		<FareIntro
			lang={data.lang}
			destination={fareDestinationLabel}
			bookLimitDate={data.destination.book_limit_date ?? ''}
			bookLimitYear={data.destination.book_limit_year ?? ''}
			flyLimitDate={data.destination.fly_limit_date ?? ''}
			flyLimitYear={data.destination.fly_limit_year ?? ''}
		/>
	</div>
{:else}
	<div class="container mx-auto px-4 py-24 text-center text-slate-600">
		<p>No translation found for this language.</p>
	</div>
{/if}
