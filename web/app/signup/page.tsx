import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Get Early Access — $4.99 One-Time',
    description:
        'Sign up for JoinPounce via web and pay once. No App Store cut, no subscription required.',
};

/**
 * Web Signup Page — /signup
 *
 * Stripe payment: $4.99 one-time (bypasses Apple's 30% cut)
 * On success: create user, send welcome email via Resend, redirect to /download
 *
 * @see JoinPounce master doc — Website Pages — Web Signup
 * TODO Mission 6: Wire up Stripe Checkout Session server action
 */
export default function SignupPage() {
    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-20">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <a href="/" className="text-xl font-bold gradient-text">
                        JoinPounce
                    </a>
                    <h1 className="text-3xl font-bold mt-6 mb-2">Get Early Access</h1>
                    <p className="text-white/60">
                        Pay once. Get everything — forever.
                    </p>
                </div>

                <div className="card-glass p-8">
                    {/* Pricing callout */}
                    <div className="text-center mb-8 p-4 rounded-xl bg-electric-600/10 border border-electric-500/20">
                        <p className="text-white/50 text-sm line-through">$9.99</p>
                        <p className="text-4xl font-bold text-electric-400">$4.99</p>
                        <p className="text-white/60 text-sm mt-1">one-time · early access pricing</p>
                    </div>

                    {/* What you get */}
                    <ul className="space-y-3 mb-8 text-sm text-white/70">
                        {[
                            'Unlimited items tracked',
                            'Daily price checks',
                            '90-day price history charts',
                            'Shared lists with friends',
                            'Push notifications instantly',
                            'All future features included',
                        ].map((feature) => (
                            <li key={feature} className="flex items-center gap-3">
                                <span className="text-electric-400 text-base">✓</span>
                                {feature}
                            </li>
                        ))}
                    </ul>

                    {/* Signup form */}
                    <form className="space-y-4">
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="Email address"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                         text-white placeholder-white/30 outline-none focus:border-electric-500
                         transition-colors"
                        />
                        <input
                            type="password"
                            name="password"
                            required
                            minLength={8}
                            placeholder="Create password (8+ characters)"
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                         text-white placeholder-white/30 outline-none focus:border-electric-500
                         transition-colors"
                        />

                        {/* TODO: Add Stripe Checkout button once server action is wired (Mission 6) */}
                        <button
                            type="submit"
                            className="btn-primary w-full text-base py-4"
                        >
                            Pay $4.99 → Get Access
                        </button>
                    </form>

                    <p className="text-center text-white/30 text-xs mt-4">
                        Secure payment via Stripe. Your features will{' '}
                        <strong className="text-white/50">never go behind a paywall</strong>.
                    </p>
                </div>

                <p className="text-center text-white/30 text-sm mt-6">
                    Already have an account?{' '}
                    <a href="/" className="text-electric-400 hover:text-electric-300">
                        Download the app
                    </a>
                </p>
            </div>
        </main>
    );
}
