import type { SupportedRetailer } from '@joinpounce/shared';

export interface SimilarProduct {
    retailer: SupportedRetailer;
    product_name: string;
    product_image: string | null;
    current_price: number | null;
    url: string;
    affiliate_url: string;
    similarity_score: number; // 0–1
}

/**
 * Finds up to 3 similar products when an item goes dead (404 or out-of-stock).
 *
 * Algorithm:
 * 1. Strip product name to keywords (remove stop words, colors, sizes)
 * 2. Search across all supported retailer APIs using those keywords
 * 3. Filter by original_price ±20%
 * 4. Rank by similarity score
 * 5. Return top 3
 *
 * Called by: dead-links worker, notificationRoutes
 *
 * @see JoinPounce master doc — Dead Link Handling
 * TODO Mission 3: Implement retailer API search calls.
 */
export async function findSimilarProducts(
    product_name: string,
    original_price: number,
    excluded_retailer?: SupportedRetailer
): Promise<SimilarProduct[]> {
    const keywords = extractKeywords(product_name);
    const priceMin = original_price * 0.8;
    const priceMax = original_price * 1.2;

    console.log(
        `[similarity] Searching for "${keywords.join(' ')}" $${priceMin.toFixed(2)}–$${priceMax.toFixed(2)}`
    );

    // TODO Mission 3: call each retailer's search API in parallel
    // const [amazonResults, targetResults, ...] = await Promise.allSettled([...])

    return []; // stub — returns empty until Mission 3
}

/**
 * Strips product name down to searchable keywords.
 * Removes stop words, dimensions, colors, and common retail filler words.
 */
export function extractKeywords(productName: string): string[] {
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'of', 'with', 'in', 'for', 'by',
        'set', 'piece', 'pack', 'new', 'free', 'shipping', 'sale',
    ]);

    return productName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopWords.has(word))
        .slice(0, 6); // limit to 6 most relevant keywords
}
