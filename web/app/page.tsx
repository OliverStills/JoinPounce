import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Stop Missing Sales on Things You Actually Want',
    description:
        'JoinPounce watches your wishlist and texts you the moment prices drop on Amazon, Target, Walmart, Best Buy, and Wayfair.',
};

/**
 * Landing Page — /
 *
 * Mission 4 builds this out fully with animated demo, live stats, etc.
 * This scaffold establishes the page structure and copy.
 *
 * @see JoinPounce master doc — Website Pages — Landing Page
 */
export default function HomePage() {
    return (
        <main className="min-h-screen">
            {/* ─── Nav ─────────────────────────────────────────────────────────── */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-navy-950/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <span className="text-xl font-bold gradient-text">JoinPounce</span>
                    <a href="/signup" className="btn-primary text-sm px-4 py-2">
                        Get Early Access
                    </a>
                </div>
            </nav>

            {/* ─── Hero ────────────────────────────────────────────────────────── */}
            <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16">
                <div className="max-w-4xl mx-auto animate-fade-in">
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
                        Stop missing sales on{' '}
                        <span className="gradient-text">things you actually want.</span>
                    </h1>
                    <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
                        JoinPounce watches your wishlist and texts you the moment prices
                        drop. Save the link. Get the alert. Pounce on it.
                    </p>

                    {/* Waitlist form — POSTs to /api/waitlist */}
                    <form
                        action="/api/waitlist"
                        method="POST"
                        className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto"
                    >
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="your@email.com"
                            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20
                         text-white placeholder-white/40 outline-none focus:border-electric-500
                         transition-colors"
                        />
                        <button type="submit" className="btn-primary whitespace-nowrap">
                            Join Waitlist →
                        </button>
                    </form>
                    <p className="text-white/30 text-sm mt-4">
                        Free to join. No spam. No credit card.
                    </p>
                </div>
            </section>

            {/* ─── How It Works ────────────────────────────────────────────────── */}
            <section className="py-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-16">
                        Three steps to never pay full price again
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '01',
                                title: 'Save it',
                                desc: 'Share any product link from any app — Amazon, Target, Walmart, anywhere — into JoinPounce. We clean the URL and start watching.',
                            },
                            {
                                step: '02',
                                title: 'Watch it',
                                desc: 'Our tracker checks prices daily across all your wishlist items. We verify every drop before we bother you — no false alarms.',
                            },
                            {
                                step: '03',
                                title: 'Pounce on it',
                                desc: 'The moment a real price drop hits, you get a notification with a direct buy link. One tap, straight to checkout.',
                            },
                        ].map(({ step, title, desc }) => (
                            <div key={step} className="card-glass p-8 flex flex-col gap-4">
                                <span className="text-electric-500 font-mono text-sm font-bold">{step}</span>
                                <h3 className="text-2xl font-bold">{title}</h3>
                                <p className="text-white/60 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Supported Retailers ─────────────────────────────────────────── */}
            <section className="py-16 px-4 border-t border-white/5">
                <div className="max-w-5xl mx-auto text-center">
                    <p className="text-white/40 text-sm uppercase tracking-widest mb-8">
                        Works with the retailers you already shop
                    </p>
                    <div className="flex flex-wrap gap-6 justify-center items-center">
                        {['Amazon', 'Target', 'Walmart', 'Best Buy', 'Wayfair'].map((r) => (
                            <span
                                key={r}
                                className="px-5 py-2 rounded-full border border-white/10 text-white/60 text-sm font-medium"
                            >
                                {r}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Footer ──────────────────────────────────────────────────────── */}
            <footer className="border-t border-white/5 py-10 px-4 text-center text-white/30 text-sm">
                <p>© {new Date().getFullYear()} JoinPounce · joinpounce.com</p>
            </footer>
        </main>
    );
}
