<script lang="ts">
	import type { PageData } from './$types';

	const ASSETS_BASE = 'https://cm-marketing.directus.app/assets';
	const COPA_ISOTIPO =
		'https://cm-marketing.directus.app/assets/eea750ff-7448-4506-8c8b-c754b8a7e436';
	const COPA_FOOTER_LOGO =
		'https://cm-marketing.directus.app/assets/06cb3d00-8dd6-4f41-9f35-40f7d02ba0e3';
	const BRAND = '#003087';

	const LANGS = ['es', 'en', 'pt'] as const;
	type Lang = (typeof LANGS)[number];

	let { data }: { data: PageData } = $props();

	type Translation = { languages_code: string; intro_title?: string | null };

	function getTitle(dest: PageData['destinations'][number], lang: Lang): string {
		const rows = dest.translations;
		if (!Array.isArray(rows)) return dest.destination_slug ?? `#${dest.id}`;
		const t = rows.find(
			(r): r is Translation =>
				typeof r === 'object' && r !== null && (r as Translation).languages_code === lang
		);
		return t?.intro_title ?? dest.destination_slug ?? `#${dest.id}`;
	}

	function previewPath(slug: string, lang: Lang): string {
		return `/${lang}/${slug}`;
	}

	// ── State ──────────────────────────────────────────────────────────────────
	let _selected = $state<PageData['destinations'][number] | null>(null);
	const selected = $derived(_selected ?? data.destinations[0] ?? null);
	let previewLang = $state<Lang>('es');
	let copied = $state<string | null>(null);

	// ── Auto-scroll ────────────────────────────────────────────────────────────
	let iframeEl = $state<HTMLIFrameElement | null>(null);
	let scrollTimer: ReturnType<typeof setInterval> | null = null;
	let scrollingToTop = false;
	let scrollPaused = $state(false);

	function stopAutoScroll() {
		if (scrollTimer !== null) {
			clearInterval(scrollTimer);
			scrollTimer = null;
		}
	}

	function toggleScrollPause() {
		scrollPaused = !scrollPaused;
	}

	function startAutoScroll() {
		stopAutoScroll();
		scrollingToTop = false;
		scrollTimer = setInterval(() => {
			try {
				if (scrollPaused) return;
				const win = iframeEl?.contentWindow;
				if (!win) return;
				if (scrollingToTop) {
					if (win.scrollY < 10) scrollingToTop = false;
					return;
				}
				const maxScroll = win.document.body.scrollHeight - win.innerHeight;
				if (maxScroll <= 0) return;
				if (win.scrollY >= maxScroll - 2) {
					scrollingToTop = true;
					win.scrollTo({ top: 0, behavior: 'smooth' });
				} else {
					win.scrollBy(0, 1);
				}
			} catch {
				/* not ready */
			}
		}, 16);
	}

	$effect(() => {
		void _selected;
		void previewLang;
		scrollPaused = false;
		stopAutoScroll();
	});
	$effect(() => () => stopAutoScroll());
	function onIframeLoad() {
		startAutoScroll();
	}

	// ── Pre-fetched build HTML ──────────────────────────────────────────────────
	const CLEANUP_SCRIPT = `
<script type="text/javascript">
            (function deleteAll() {
                const x = document.querySelectorAll(".__pfs, .__bss");
                for (i = 0; i < x.length; i++) {
                    x[i].classList.remove('__pfs', '__bss');
                }
            })();
        <\/script>`;

	let builds = $state<Record<string, string>>({});
	let buildsLoading = $state(false);

	async function extractBuildHtml(path: string): Promise<string> {
		const res = await fetch(path);
		const html = await res.text();
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');
		const wrapper = doc.querySelector('div[style*="display: contents"]');
		return (wrapper?.innerHTML ?? html) + CLEANUP_SCRIPT;
	}

	$effect(() => {
		const dest = selected;
		if (!dest?.destination_slug) {
			builds = {};
			return;
		}
		const slug = dest.destination_slug;
		const langs = dest.availableLangs;
		builds = {};
		buildsLoading = true;
		let cancelled = false;
		const delay = new Promise<void>((r) => setTimeout(r, 3000));
		Promise.all([
			Promise.all(langs.map((lang) => extractBuildHtml(`/${lang}/${slug}`).then((html) => ({ lang, html })))),
			delay
		])
			.then(([results]) => {
				if (cancelled) return;
				const map: Record<string, string> = {};
				for (const { lang, html } of results) map[lang] = html;
				builds = map;
				buildsLoading = false;
			})
			.catch(() => {
				if (!cancelled) buildsLoading = false;
			});
		return () => {
			cancelled = true;
		};
	});

	function copyBuild(lang: string, key: string) {
		const content = builds[lang];
		if (!content) return;
		navigator.clipboard.writeText(content);
		copied = key;
		setTimeout(() => (copied = null), 2200);
	}

	const LANG_LABEL: Record<Lang, string> = { es: 'Español', en: 'English', pt: 'Português' };
</script>

<svelte:head>
	<title>Marketing Tools — Copa Airlines</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-slate-100 font-body text-slate-800">
	<!-- ── Header ── -->
	<header class="shrink-0 shadow-md" style="background-color: {BRAND}; padding: 14px 28px;">
		<div class="mx-auto flex max-w-screen-2xl items-center gap-4">
			<img src={COPA_ISOTIPO} alt="Copa Airlines" class="h-10 w-auto shrink-0" />
			<div>
				<h1
					class="font-heading font-bold text-white"
					style="font-size: 18px; letter-spacing: -0.01em;"
				>
					Marketing Tools — Copa Airlines
				</h1>
				<p class="font-body font-normal text-white/70" style="font-size: 11px; margin-top: 2px;">
					Destination of the Month Generator — HTML para AirTRFX
				</p>
			</div>
		</div>
	</header>

	<div class="mx-auto flex w-full max-w-screen-2xl flex-1 overflow-hidden">
		<!-- ── Sidebar ── -->
		<aside class="w-64 shrink-0 border-r border-slate-200 bg-white">
			<div class="border-b border-slate-100 px-4 py-3">
				<p class="text-xs font-semibold uppercase tracking-widest text-slate-500">
					Published ({data.destinations.length})
				</p>
			</div>
			<ul
				class="divide-y divide-slate-100 overflow-y-auto"
				style="max-height: calc(100vh - 68px - 32px);"
			>
				{#each data.destinations as dest (dest.id)}
					<li>
						<button
							type="button"
							onclick={() => {
								_selected = dest;
								previewLang = dest.availableLangs[0] ?? 'es';
							}}
							class="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50
								{selected?.id === dest.id ? 'bg-blue-50' : ''}"
							style={selected?.id === dest.id
								? `border-left: 2px solid ${BRAND};`
								: 'border-left: 2px solid transparent;'}
						>
							{#if dest.main_image}
								<img
									src="{ASSETS_BASE}/{dest.main_image}?width=48&height=48&fit=cover"
									alt=""
									class="mt-0.5 h-10 w-10 shrink-0 rounded-lg object-cover"
								/>
							{:else}
								<div
									class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-400 text-xs"
								>
									—
								</div>
							{/if}
							<div class="min-w-0">
								<p class="font-heading truncate text-sm font-bold text-slate-800">
									{getTitle(dest, 'es')}
								</p>
								<p class="mt-0.5 truncate font-mono text-xs text-slate-400">
									{dest.destination_slug ?? '—'}
								</p>
							</div>
						</button>
					</li>
				{/each}
				{#if data.destinations.length === 0}
					<li class="px-4 py-8 text-center text-sm text-slate-400">
						No published destinations found.
					</li>
				{/if}
			</ul>
		</aside>

		<!-- ── Main panel ── -->
		<main class="flex min-w-0 flex-1 flex-col overflow-hidden">
			{#if selected && selected.destination_slug}
				{@const slug = selected.destination_slug}
				{@const availLangs = selected.availableLangs}

				<!-- Detail header -->
				<div class="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
					<div class="flex flex-wrap items-center justify-between gap-3">
						<div>
							<h2 class="font-heading text-lg font-bold text-slate-800">
								{getTitle(selected, 'es')}
							</h2>
							<p class="mt-0.5 font-mono text-sm text-slate-500">
								slug: <span style="color:{BRAND};">{slug}</span>
							</p>
						</div>
						<div class="flex flex-wrap gap-2">
							{#each availLangs as lang}
								<a
									href={previewPath(slug, lang)}
									target="_blank"
									rel="noopener noreferrer"
									class="rounded-full border bg-white px-4 py-1.5 text-sm font-semibold no-underline transition-colors"
									style="border-color:{BRAND}; color:{BRAND};"
									onmouseenter={(e) => {
										(e.currentTarget as HTMLElement).style.backgroundColor = BRAND;
										(e.currentTarget as HTMLElement).style.color = '#fff';
									}}
									onmouseleave={(e) => {
										(e.currentTarget as HTMLElement).style.backgroundColor = '#fff';
										(e.currentTarget as HTMLElement).style.color = BRAND;
									}}
								>
									{lang.toUpperCase()} ↗
								</a>
							{/each}
						</div>
					</div>
				</div>

				<!-- Build HTML -->
				<div class="shrink-0 border-b border-slate-200 bg-slate-50 px-6 py-4">
					<p class="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
						Build HTML
					</p>

					{#if buildsLoading}
						<!-- Loader -->
						<div
							class="flex flex-col items-center gap-3 rounded-xl px-6 py-6"
							style="background-color: #0032A0;"
						>
							<img src={COPA_FOOTER_LOGO} alt="" class="h-auto w-40 animate-pulse drop-shadow-lg" />
							<div class="text-center">
								<p class="font-heading text-sm font-semibold text-white">Preparando builds…</p>
								<p class="mt-0.5 text-xs text-white/60">Extrayendo HTML renderizado para cada idioma</p>
							</div>
						</div>
					{:else}
						<div class="grid gap-2 sm:grid-cols-3">
							{#each availLangs as lang}
								{@const path = previewPath(slug, lang)}
								{@const key = `${slug}-${lang}`}
								{@const ready = !!builds[lang]}
								<div
									class="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
								>
									<div class="min-w-0">
										<span
											class="rounded-md px-1.5 py-0.5 font-mono text-xs font-bold text-white"
											style="background-color:{BRAND};">{lang.toUpperCase()}</span
										>
										<span class="ml-2 font-mono text-xs text-slate-500">{path}</span>
									</div>
									<button
										type="button"
										onclick={() => copyBuild(lang, key)}
										disabled={!ready}
										class="shrink-0 rounded-md border px-2 py-1 text-xs font-semibold transition-colors
											{copied === key
											? 'border-green-500 bg-green-500 text-white'
											: !ready
												? 'cursor-wait border-slate-200 bg-slate-50 text-slate-300'
												: 'border-slate-200 bg-slate-50 text-slate-600'}"
										onmouseenter={(e) => {
											if (ready && copied !== key) {
												const el = e.currentTarget as HTMLElement;
												el.style.backgroundColor = BRAND;
												el.style.borderColor = BRAND;
												el.style.color = '#fff';
											}
										}}
										onmouseleave={(e) => {
											const el = e.currentTarget as HTMLElement;
											el.style.backgroundColor = '';
											el.style.borderColor = '';
											el.style.color = '';
										}}
									>
										{copied === key ? '✓ Copied' : !ready ? '…' : 'Copy HTML'}
									</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Preview -->
				<div class="flex flex-1 flex-col overflow-hidden">
					<!-- Language tabs -->
					<div
						class="shrink-0 flex items-center gap-1 border-b border-slate-200 bg-white px-6 py-2"
					>
						<span class="mr-3 text-xs font-semibold uppercase tracking-widest text-slate-500"
							>Preview</span
						>
						{#each availLangs as lang}
							<button
								type="button"
								onclick={() => (previewLang = lang)}
								class="rounded-full px-4 py-1.5 text-sm font-semibold transition-colors
									{previewLang === lang ? 'text-white' : 'text-slate-600 hover:bg-slate-100'}"
								style={previewLang === lang ? `background-color:${BRAND};` : ''}
							>
								{LANG_LABEL[lang]}
							</button>
						{/each}
					</div>

					<!-- 1200px centered iframe showcase -->
					<div
						class="flex flex-1 items-stretch justify-center overflow-hidden bg-slate-300 px-10 py-8"
					>
						<div
							class="relative flex w-full max-w-[1200px] overflow-hidden rounded-xl"
							style="box-shadow: 0 24px 60px rgba(0,48,135,0.22);"
						>
							<iframe
								bind:this={iframeEl}
								onload={onIframeLoad}
								src={previewPath(slug, previewLang)}
								title="Preview — {previewLang} / {slug}"
								class="h-full w-full flex-1 border-0 bg-white"
								loading="lazy"
							></iframe>

							<!-- Pause / Resume button -->
							<button
								onclick={toggleScrollPause}
								title={scrollPaused ? 'Reanudar scroll' : 'Pausar scroll'}
								class="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition-opacity duration-200 hover:opacity-90"
								style="background-color: #0032A0;"
							>
								{#if scrollPaused}
									<!-- Play icon -->
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="h-4 w-4 translate-x-px">
										<path d="M8 5v14l11-7z"/>
									</svg>
								{:else}
									<!-- Pause icon -->
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="h-4 w-4">
										<path d="M6 19h4V5H6zm8-14v14h4V5z"/>
									</svg>
								{/if}
							</button>
						</div>
					</div>
				</div>
			{:else}
				<div class="flex flex-1 flex-col items-center justify-center gap-4 text-slate-400">
					<img src={COPA_ISOTIPO} alt="" class="h-12 w-12 opacity-20" />
					<p class="text-sm">Select a destination from the sidebar to preview it.</p>
				</div>
			{/if}
		</main>
	</div>

	<!-- ── Footer ── -->
	<footer class="flex h-8 shrink-0 items-center justify-center" style="background-color:{BRAND};">
		<img
			src={COPA_FOOTER_LOGO}
			alt="Copa Marketing"
			class="h-4 w-auto opacity-90 transition-opacity duration-200 hover:opacity-100"
		/>
	</footer>
</div>
