import type { Metadata } from 'next';

interface Props {
    params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const name = params.username;
    return {
        title: `${name} invited you to JoinPounce`,
        description: `${name} uses JoinPounce to track prices and never pay full price. Join for free.`,
        openGraph: {
            title: `${name} invited you to JoinPounce`,
            description: 'Track prices on Amazon, Target, Walmart, Best Buy, and Wayfair. Get alerted when they drop.',
        },
    };
}

/**
 * Personalized Invite Page — /invite/[username]
 *
 * Every user gets a joinpounce.com/invite/[username] URL.
 * Shared via: iMessage, Copy Link, QR Code
 * Successful invite = 1 month Pro free for both users
 *
 * @see JoinPounce master doc — Virality Mechanics — Invite Links
 * TODO Mission 4: Fetch referrer user name from API, pre-apply referral_code to signup
 */
export default function InvitePage({ params }: Props) {
    const { username } = params;

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
            <div className="max-w-lg w-full text-center">
                {/* Avatar placeholder */}
                <div className="w-20 h-20 rounded-full bg-electric-600/20 border border-electric-500/30
                        flex items-center justify-center mx-auto mb-6 text-3xl">
                    👋
                </div>

                <h1 className="text-3xl font-bold mb-3">
                    <span className="gradient-text">{username}</span> invited you to JoinPounce
                </h1>
                <p className="text-white/60 mb-8 leading-relaxed">
                    JoinPounce watches your Amazon, Target, and Walmart wishlists and sends
                    you a push notification the moment prices drop. Never pay full price again.
                </p>

                {/* Referral bonus callout */}
                <div className="card-glass p-5 mb-8 text-left">
                    <div className="flex items-start gap-4">
                        <span className="text-2xl">🎁</span>
                        <div>
                            <p className="font-semibold text-sm mb-1">Invite reward</p>
                            <p className="text-white/60 text-sm">
                                Sign up with {username}&apos;s link and you both get{' '}
                                <strong className="text-white">1 month of Pro free</strong> — unlimited items,
                                daily price checks, and full price history.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <a
                    href={`/signup?ref=${username}`}
                    className="btn-primary w-full text-base py-4 block"
                >
                    Join JoinPounce →
                </a>
                <p className="text-white/30 text-sm mt-4">
                    Free to start. $4.99 one-time for full access.
                </p>
            </div>
        </main>
    );
}
