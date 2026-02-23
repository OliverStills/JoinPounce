import type { SupportedRetailer } from '@joinpounce/shared';
import { AFFILIATE_TAGS } from '@joinpounce/shared';

/**
 * Injects the JoinPounce affiliate tag into a canonical product URL.
 *
 * Process:
 * 1. Take canonical_url (already stripped of tracking/affiliate params)
 * 2. Strip any lingering affiliate parameters
 * 3. Append our affiliate tag for that retailer
 *
 * Called when:
 *   - A price drop notification is fired
 *   - User taps "Buy Now" in the app
 *
 * @see JoinPounce master doc — Affiliate Link Injection
 */
export function injectAffiliateTag(
    canonicalUrl: string,
    retailer: SupportedRetailer
): string {
    const tag = AFFILIATE_TAGS[retailer];

    if (!tag.tag_value) {
        // Affiliate program not yet approved — return canonical URL as-is
        console.warn(`[affiliate] No tag value configured for ${retailer}`);
        return canonicalUrl;
    }

    try {
        const url = new URL(canonicalUrl);

        // Remove any existing affiliate param first (safety net)
        url.searchParams.delete(tag.param_name);

        // Append our tag
        url.searchParams.set(tag.param_name, tag.tag_value);

        return url.toString();
    } catch {
        console.error(`[affiliate] Failed to inject tag into URL: ${canonicalUrl}`);
        return canonicalUrl;
    }
}

/**
 * Builds a deep-link URL that routes through JoinPounce tracking
 * before redirecting to the affiliate link.
 *
 * TODO Mission 3: Implement server-side redirect endpoint
 * Pattern: https://go.joinpounce.com/r?n={notification_id}
 * → logs opened_at → redirects to affiliate URL
 */
export function buildTrackingUrl(
    notificationId: string,
    affiliateUrl: string
): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://joinpounce.com';
    const tracking = new URL(`${baseUrl}/r`);
    tracking.searchParams.set('n', notificationId);
    tracking.searchParams.set('u', encodeURIComponent(affiliateUrl));
    return tracking.toString();
}
