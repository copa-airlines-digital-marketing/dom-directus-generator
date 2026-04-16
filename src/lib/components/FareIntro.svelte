<script lang="ts">
	import { Body, Caption, Heading } from 'design-sytem-svelte-components/typography';

	type Lang = 'es' | 'en' | 'pt';

	const STRINGS: Record<Lang, { heading: string; bookLabel: string; flyLabel: string }> = {
		es: {
			heading: 'Aprovecha nuestras ofertas para viajar a',
			bookLabel: 'Compra hasta',
			flyLabel: 'Viaja hasta'
		},
		en: {
			heading: 'Take advantage of our offers to travel to',
			bookLabel: 'Book by',
			flyLabel: 'Fly by'
		},
		pt: {
			heading: 'Aproveite nossas ofertas para viajar para',
			bookLabel: 'Compre até',
			flyLabel: 'Viaje até'
		}
	};

	let {
		lang,
		destination,
		bookLimitDate,
		bookLimitYear,
		flyLimitDate,
		flyLimitYear
	}: {
		lang: Lang;
		destination: string;
		bookLimitDate: string;
		bookLimitYear: string;
		flyLimitDate: string;
		flyLimitYear: string;
	} = $props();

	const strings = $derived(STRINGS[lang]);
</script>

<div id="fares" class="container mx-auto scroll-mt-20 px-4">
	<div class="relative mx-auto max-w-5xl">
		<div class="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl"></div>
		<div class="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-secondary/5 blur-2xl"></div>
		<div class="relative">
			<Heading tag="h2" variant="h2" class="mb-8 text-center">
				{strings.heading} <br />
				<span class="relative inline-block">
					<span class="relative z-10 text-secondary">{destination}</span>
					<span class="absolute -bottom-2 left-0 right-0 h-3 -rotate-1 bg-secondary"></span>
				</span>
			</Heading>
			<div class="grid gap-6 md:grid-cols-2">
				<div
					class="group relative overflow-hidden rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/5 to-transparent p-3 transition-all duration-300 hover:border-primary hover:shadow-lg"
				>
					<div class="relative">
						<Caption
							tag="p"
							size="caption"
							variant="caption"
							class="mb-2 text-center font-semibold !text-primary-dark"
						>
							{strings.bookLabel}
						</Caption>
						<Body
							tag="p"
							size="body-large"
							variant="body-emphasis"
							class="text-center text-u2 font-body font-bold tabular-nums lining-nums !text-primary !mb-0"
						>
							{bookLimitDate}
							{bookLimitYear}
						</Body>
					</div>
				</div>
				<div
					class="group relative overflow-hidden rounded-2xl border-2 border-secondary bg-gradient-to-br from-secondary/5 to-transparent p-3 transition-all duration-300 hover:border-secondary hover:shadow-lg"
				>
					<div class="relative">
						<Caption
							tag="p"
							size="caption"
							variant="caption"
							class="mb-2 text-center font-semibold !text-primary-dark"
						>
							{strings.flyLabel}
						</Caption>
						<Body
							tag="p"
							size="body-large"
							variant="body-emphasis"
							class="text-center text-u2 font-body font-bold tabular-nums lining-nums !text-primary !mb-0"
						>
							{flyLimitDate}
							{flyLimitYear}
						</Body>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
