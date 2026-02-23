import type { SupportedRetailer, PriceCheckResult } from '@joinpounce/shared';

/**
 * Checks the current price of an item from the appropriate retailer API.
 *
 * Day 1 supported retailers:
 *   - amazon  → Amazon Product Advertising API
 *   - target  → Roundel API via Impact affiliate
 *   - walmart → Walmart Open API
 *   - bestbuy → Best Buy Products API
 *   - wayfair → CJ Affiliate API
 *
 * TODO Mission 3: Implement each retailer's API call.
 * TODO Mission 5: Called in batch by the price-check worker.
 */
export async function checkPrice(
    item_id: string,
    canonical_url: string,
    retailer: SupportedRetailer,
    variant_params: Record<string, string>
): Promise<PriceCheckResult> {
    console.log(`[price-checker] Checking ${retailer} price for item ${item_id}`);

    // TODO Mission 3: route to correct retailer handler
    switch (retailer) {
        case 'amazon':
            return checkAmazonPrice(item_id, canonical_url, variant_params);
        case 'target':
            return checkTargetPrice(item_id, canonical_url, variant_params);
        case 'walmart':
            return checkWalmartPrice(item_id, canonical_url, variant_params);
        case 'bestbuy':
            return checkBestBuyPrice(item_id, canonical_url, variant_params);
        case 'wayfair':
            return checkWayfairPrice(item_id, canonical_url, variant_params);
        default:
            return {
                item_id,
                retailer,
                current_price: null,
                in_stock: false,
                checked_at: new Date(),
                error: `Unsupported retailer: ${retailer}`,
            };
    }
}

// ─── Retailer Stubs (Mission 3 implements these) ─────────────────────────────

async function checkAmazonPrice(
    item_id: string,
    _canonical_url: string,
    _variant_params: Record<string, string>
): Promise<PriceCheckResult> {
    // TODO Mission 3: Amazon Product Advertising API
    // SDK: amazon-paapi | Requires: AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, AMAZON_PARTNER_TAG
    return { item_id, retailer: 'amazon', current_price: null, in_stock: true, checked_at: new Date(), error: 'stub' };
}

async function checkTargetPrice(
    item_id: string,
    _canonical_url: string,
    _variant_params: Record<string, string>
): Promise<PriceCheckResult> {
    // TODO Mission 3: Target Roundel API via Impact affiliate
    return { item_id, retailer: 'target', current_price: null, in_stock: true, checked_at: new Date(), error: 'stub' };
}

async function checkWalmartPrice(
    item_id: string,
    _canonical_url: string,
    _variant_params: Record<string, string>
): Promise<PriceCheckResult> {
    // TODO Mission 3: Walmart Open API
    // Endpoint: https://developer.walmart.com/api/us/mp/items
    return { item_id, retailer: 'walmart', current_price: null, in_stock: true, checked_at: new Date(), error: 'stub' };
}

async function checkBestBuyPrice(
    item_id: string,
    _canonical_url: string,
    _variant_params: Record<string, string>
): Promise<PriceCheckResult> {
    // TODO Mission 3: Best Buy Products API
    // Requires: BESTBUY_API_KEY
    return { item_id, retailer: 'bestbuy', current_price: null, in_stock: true, checked_at: new Date(), error: 'stub' };
}

async function checkWayfairPrice(
    item_id: string,
    _canonical_url: string,
    _variant_params: Record<string, string>
): Promise<PriceCheckResult> {
    // TODO Mission 3: Wayfair via CJ Affiliate API
    return { item_id, retailer: 'wayfair', current_price: null, in_stock: true, checked_at: new Date(), error: 'stub' };
}

/**
 * Price drop significance check.
 * A drop is significant if:
 *   - It dropped by ≥ threshold% OR ≥ $threshold amount (whichever is GREATER)
 *
 * @see JoinPounce master doc — Price Alert Logic
 */
export function isPriceDropSignificant(
    priceBefore: number,
    priceAfter: number,
    thresholdPercent: number = 10,
    thresholdAmount: number = 10
): boolean {
    if (priceAfter >= priceBefore) return false;

    const dropAmount = priceBefore - priceAfter;
    const dropPercent = (dropAmount / priceBefore) * 100;

    // Must meet BOTH: percent OR amount threshold
    return dropPercent >= thresholdPercent || dropAmount >= thresholdAmount;
}
