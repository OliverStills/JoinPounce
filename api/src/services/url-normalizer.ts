import type { NormalizedUrl, SupportedRetailer } from '@joinpounce/shared';

// Tracking and affiliate parameters to strip from every URL
const STRIP_PARAMS = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'ref', 'tag', 'affiliate', 'source', 'fbclid', 'gclid', 'mc_eid', '_ga',
    'mkwid', 'pcrid', 'pdv', 'rkg_id', 'th', 'psc', 'spLa',
];

// Domain → retailer mapping
const RETAILER_DOMAINS: Record<string, SupportedRetailer> = {
    'amazon.com': 'amazon',
    'www.amazon.com': 'amazon',
    'amzn.to': 'amazon',
    'target.com': 'target',
    'www.target.com': 'target',
    'walmart.com': 'walmart',
    'www.walmart.com': 'walmart',
    'bestbuy.com': 'bestbuy',
    'www.bestbuy.com': 'bestbuy',
    'wayfair.com': 'wayfair',
    'www.wayfair.com': 'wayfair',
};

/**
 * Full URL normalization pipeline:
 * 1. Resolve redirects → final URL
 * 2. Strip tracking params (utm_*, ref, fbclid, etc.)
 * 3. Strip existing affiliate tags
 * 4. Detect retailer from domain
 * 5. Extract variant params (size, color, style)
 *
 * @see JoinPounce master doc — URL Normalization Rules
 * @see Mission 3 for full implementation with retailer API metadata fetch
 */
export async function normalizeUrl(rawUrl: string): Promise<NormalizedUrl> {
    const url = rawUrl.trim();

    // Step 1: Parse and validate
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        throw new Error(`Invalid URL: ${url}`);
    }

    // Step 2: Resolve redirects (TODO Mission 3: follow redirects with fetch + redirect tracking)
    const resolved_url = url; // stub — Mission 3 will follow redirects

    // Step 3: Strip tracking and affiliate params
    const strippedParams: string[] = [];
    const cleanParams = new URLSearchParams();

    for (const [key, value] of new URLSearchParams(parsed.search)) {
        const lowerKey = key.toLowerCase();
        const isTrackingParam =
            STRIP_PARAMS.includes(lowerKey) ||
            lowerKey.startsWith('utm_') ||
            lowerKey === 'tag'; // Amazon affiliate tag

        if (isTrackingParam) {
            strippedParams.push(key);
        } else {
            cleanParams.append(key, value);
        }
    }

    // Step 4: Detect retailer
    const hostname = parsed.hostname.toLowerCase();
    const retailer: SupportedRetailer | null = RETAILER_DOMAINS[hostname] ?? null;

    // Step 5: Extract variant params
    // (Mission 3 implements retailer-specific variant extraction)
    const variantKeys: Record<SupportedRetailer, string[]> = {
        amazon: ['th', 'psc'],
        target: ['preselect'],
        walmart: ['color', 'size'],
        bestbuy: ['skuId'],
        wayfair: [],
    };

    const variant_params: Record<string, string> = {};
    if (retailer) {
        for (const key of variantKeys[retailer]) {
            const val = cleanParams.get(key);
            if (val) {
                variant_params[key] = val;
                cleanParams.delete(key);
            }
        }
    }

    // Build canonical URL
    const canonicalUrl = new URL(parsed.origin + parsed.pathname);
    for (const [key, value] of cleanParams) {
        canonicalUrl.searchParams.append(key, value);
    }

    return {
        original_url: url,
        resolved_url,
        canonical_url: canonicalUrl.toString(),
        retailer,
        is_supported: retailer !== null,
        variant_params,
        tracking_params_stripped: strippedParams,
    };
}

/**
 * Quick retailer detection from URL without full normalization
 */
export function detectRetailer(url: string): SupportedRetailer | null {
    try {
        const hostname = new URL(url).hostname.toLowerCase();
        return RETAILER_DOMAINS[hostname] ?? null;
    } catch {
        return null;
    }
}
