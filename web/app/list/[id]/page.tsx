import type { Metadata } from 'next';

interface Props {
    params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    // TODO Mission 4: Fetch list by share_token and return real title/description
    return {
        title: 'Shared Wishlist',
        description: 'Check out this wishlist on JoinPounce — prices tracked daily.',
        openGraph: {
            title: 'Shared Wishlist on JoinPounce',
            description: 'Prices tracked daily. Download JoinPounce to build your own.',
            type: 'website',
        },
    };
}

/**
 * Shared List Preview — /list/[id]
 *
 * Fetches list by share_token from GET /api/lists/:id
 * This is the viral acquisition page — users who receive shared links
 * land here without needing to download the app first.
 *
 * Renders:
 *   - Product cards: image, name, current price, original price, % saved badge
 *   - Price sparkline chart (90-day history) — Mission 4
 *   - "Price dropped X% last week" badge — Mission 4
 *   - Bottom CTA: "Download JoinPounce" — the conversion moment
 *
 * @see JoinPounce master doc — Website Pages — Shared List Preview
 * TODO Mission 4: Implement full product card grid with real data
 */
export default async function SharedListPage({ params }: Props) {
    const { id } = params;

    // TODO Mission 4: Server-side fetch from API
    // const res = await fetch(`${process.env.API_URL}/api/lists/${id}`, { cache: 'no-store' });
    // const { list, items } = await res.json();

    return (
        <main className="min-h-screen">
            {/* ─── Nav ─────────────────────────────────────────────────────────── */}
            <nav className="border-b border-white/5 bg-navy-950/80 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                    <a href="/" className="text-lg font-bold gradient-text">
                        JoinPounce
                    </a>
                    <a href="/signup" className="btn-primary text-sm px-4 py-2">
                        Get the App
                    </a>
                </div>
            </nav>

            {/* ─── List Header ─────────────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-4 py-12">
                <div className="text-center mb-10">
                    <p className="text-white/40 text-sm mb-2">Shared Wishlist</p>
                    <h1 className="text-3xl font-bold mb-3">My Wishlist</h1>
                    {/* TODO Mission 4: render list.name, item count, last updated */}
                </div>

                {/* ─── Product Grid (stub) ──────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* TODO Mission 4: Map over items and render ItemCard components */}
                    <div className="card-glass p-6 flex flex-col gap-3 animate-pulse">
                        <div className="w-full aspect-square rounded-xl bg-white/5" />
                        <div className="h-4 bg-white/5 rounded w-3/4" />
                        <div className="h-4 bg-white/5 rounded w-1/2" />
                    </div>
                </div>
            </section>

            {/* ─── Sticky Bottom CTA — the viral conversion moment ─────────────── */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-navy-950/95 backdrop-blur-md p-4">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-4 justify-between">
                    <p className="text-white/70 text-sm">
                        Want price drop alerts on your own wishlist?
                    </p>
                    <a href="/signup" className="btn-primary w-full sm:w-auto">
                        Download JoinPounce — Free
                    </a>
                </div>
            </div>
        </main>
    );
}
