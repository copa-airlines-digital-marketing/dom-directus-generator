<script lang="ts">
	type Lang = 'es' | 'en' | 'pt';

	const STRINGS: Record<Lang, { heading: string; bookLabel: string; flyLabel: string }> = {
		es: {
			heading: 'Aprovecha nuestras ofertas para viajar a',
			bookLabel: 'Compra hasta',
			flyLabel: 'Viaja hasta',
		},
		en: {
			heading: 'Take advantage of our offers to travel to',
			bookLabel: 'Book by',
			flyLabel: 'Fly by',
		},
		pt: {
			heading: 'Aproveite nossas ofertas para viajar para',
			bookLabel: 'Compre até',
			flyLabel: 'Viaje até',
		},
	};

	let {
		lang,
		destination,
		bookLimitDate,
		bookLimitYear,
		flyLimitDate,
		flyLimitYear,
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

<div class="container mx-auto px-4 py-16">
	<div class="relative mx-auto max-w-5xl">
		<div class="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl"></div>
		<div class="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-secondary/5 blur-2xl"></div>
		<div class="relative">
			<h2 class="mb-8 text-center text-4xl font-bold text-primary md:text-3xl">
				{strings.heading} <br />
				<span class="relative inline-block">
					<span class="relative z-10 text-secondary">{destination}</span>
					<span class="absolute -bottom-2 left-0 right-0 h-3 -rotate-1 bg-secondary"></span>
				</span>
			</h2>
			<div class="grid gap-6 md:grid-cols-2">
				<div
					class="group relative overflow-hidden rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/5 to-transparent p-3 transition-all duration-300 hover:border-primary hover:shadow-lg"
				>
					<div class="relative">
						<p class="mb-2 text-center font-semibold text-primary-dark">{strings.bookLabel}</p>
						<p class="text-center text-2xl font-bold text-primary">{bookLimitDate} {bookLimitYear}</p>
					</div>
				</div>
				<div
					class="group relative overflow-hidden rounded-2xl border-2 border-secondary bg-gradient-to-br from-secondary/5 to-transparent p-3 transition-all duration-300 hover:border-secondary hover:shadow-lg"
				>
					<div class="relative">
						<p class="mb-2 text-center font-semibold text-primary-dark">{strings.flyLabel}</p>
						<p class="text-center text-2xl font-bold text-primary">{flyLimitDate} {flyLimitYear}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
