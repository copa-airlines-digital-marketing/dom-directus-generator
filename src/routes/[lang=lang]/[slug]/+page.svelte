<script lang="ts">
	import { page } from '$app/state';
	import FareIntro from '$lib/components/FareIntro.svelte';
	import { Body, Heading } from 'design-sytem-svelte-components/typography';
	import type { PageData } from './$types';

	const ASSETS_BASE = 'https://cm-marketing.directus.app/assets';

	const BOOK_NOW_LABEL: Record<PageData['lang'], string> = {
		en: 'Book Now!',
		es: '¡Reserva ya!',
		pt: 'Reserve agora!'
	};

	let { data }: { data: PageData } = $props();

	const faresHref = $derived(`${page.url.pathname}#fares`);

	const bookNowButtonClass =
		'font-body font-medium inline-flex min-w-0 select-none items-center justify-center gap-1 rounded-full border border-primary bg-primary px-6 py-4 text-center text-b text-common-white outline outline-2 outline-primary outline-offset-4 transition-colors hover:bg-primary-ultradark focus:bg-primary-ultradark focus:outline-solid active:bg-primary active:outline-solid';

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
				(t as MonthTranslation).languages_code === data.lang
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
				(t as CardTranslation).languages_code === data.lang
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
		translation?.destination_label?.trim() || data.destination.destination_slug || ''
	);
</script>

<svelte:head>
	{#if translation?.intro_title}
		<title>{translation.intro_title}</title>
	{/if}
</svelte:head>

{#if translation}
	<div class="min-h-screen bg-grey-50 antialiased">
		<section
			class="relative h-[min(72vh,36rem)] min-h-[18rem] w-full overflow-hidden bg-slate-900"
		>
			{#if data.destination.main_image}
				<img
					src="{ASSETS_BASE}/{data.destination.main_image}"
					alt={translation.intro_title ?? ''}
					class="h-full w-full object-cover object-center"
				/>
			{:else}
				<div
					class="flex h-full min-h-48 w-full items-center justify-center bg-slate-800 text-slate-400"
				>
					<Body tag="span" size="body-small" variant="body-invert" class="mb-0">—</Body>
				</div>
			{/if}
			<div
				class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
			></div>
		</section>

		<div class="container mx-auto max-w-5xl px-4 pb-8 md:px-6">
			<article
				class="relative z-10 -mt-[clamp(4.5rem,12vw,6.25rem)] mx-auto rounded-2xl bg-white px-8 py-10 shadow-2xl md:rounded-2xl md:p-10"
			>
				<Heading
					tag="h1"
					variant="h2"
					class="text-left !text-primary-ultradark !font-bold !tracking-tight !leading-tight md:!leading-snug"
				>
					{translation.intro_title}
				</Heading>
				{#if translation.intro_description}
					<Body
						tag="p"
						size="body-large"
						variant="body"
						class="mt-5 whitespace-pre-line text-left !font-normal !text-grey-600 !leading-[1.65]"
					>
						{translation.intro_description}
					</Body>
				{/if}
				<a
					href={faresHref}
					data-sveltekit-preload-data="off"
					class="{bookNowButtonClass} mt-8 w-full max-w-none no-underline sm:w-auto sm:self-start"
				>
					{BOOK_NOW_LABEL[data.lang]}
				</a>
			</article>

			<div class="mx-auto mt-16 max-w-5xl md:mt-20">
				<div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
					{#each cards as card (card.id ?? card.card_image)}
						{@const ct = cardTranslation(card)}
						{#if card.card_image && ct}
							<div
								class="group relative aspect-[4/3] overflow-hidden rounded-[1.125rem] bg-slate-200 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.2)] transition-shadow duration-300 hover:shadow-[0_20px_50px_-12px_rgba(15,23,42,0.28)] md:rounded-2xl"
							>
								<img
									src="{ASSETS_BASE}/{card.card_image}"
									alt={ct.card_image_alt ?? ct.card_title ?? ''}
									class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
								/>
								<div
									class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
								></div>
								<div
									class="absolute inset-x-0 bottom-0 flex flex-col items-start p-7 text-left text-white md:p-8"
								>
									<Heading
										tag="h3"
										variant="h3"
										class="!mt-0 !mb-0 !font-semibold !text-white !leading-snug drop-shadow-sm md:text-u2 md:!font-bold"
									>
										{ct.card_title}
									</Heading>
									{#if ct.card_description}
										<Body
											tag="p"
											size="body"
											variant="body-invert"
											class="mt-2 !mb-0 max-w-prose !font-normal !text-white/92 !leading-[1.55] drop-shadow-sm"
										>
											{ct.card_description}
										</Body>
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
	<div class="container mx-auto px-4 py-24 text-center text-slate-600 antialiased">
		<Body tag="p" size="body" variant="body" class="text-center !text-grey-600">
			No translation found for this language.
		</Body>
	</div>
{/if}
