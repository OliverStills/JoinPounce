// ─── JoinPounce Shared TypeScript Types ───────────────────────────────────────
// These interfaces mirror the PostgreSQL schema exactly.
// Used by both /api and /worker packages.

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserTier = 'free' | 'pro';

export type NotificationType =
    | 'price_drop'
    | 'dead_link'
    | 'reengagement'
    | 'return_window'
    | 'shared_list';

export type ListCollaboratorRole = 'viewer' | 'editor';

export type SupportedRetailer =
    | 'amazon'
    | 'target'
    | 'walmart'
    | 'bestbuy'
    | 'wayfair';

// ─── Database Row Types ───────────────────────────────────────────────────────

export interface User {
    id: string; // UUID
    email: string;
    password_hash: string;
    phone: string | null;
    tier: UserTier;
    stripe_customer_id: string | null;
    fcm_token: string | null;
    referral_code: string | null;
    referred_by: string | null; // UUID → users.id
    last_active: Date | null;
    created_at: Date;
}

export interface List {
    id: string; // UUID
    user_id: string; // UUID → users.id
    name: string;
    is_shared: boolean;
    share_token: string | null;
    created_at: Date;
}

export interface ListCollaborator {
    id: string; // UUID
    list_id: string; // UUID → lists.id
    user_id: string; // UUID → users.id
    role: ListCollaboratorRole;
    joined_at: Date;
}

export interface Item {
    id: string; // UUID
    list_id: string; // UUID → lists.id
    user_id: string; // UUID → users.id
    url: string;
    canonical_url: string;
    retailer: SupportedRetailer;
    product_name: string | null;
    product_image: string | null;
    variant_params: Record<string, string>; // JSONB
    original_price: number | null;
    current_price: number | null;
    target_price: number | null;
    alert_threshold_percent: number; // default 10.00
    alert_threshold_amount: number; // default 10.00
    is_private: boolean;
    is_active: boolean;
    is_dead: boolean;
    last_checked: Date | null;
    created_at: Date;
}

export interface PriceHistory {
    id: string; // UUID
    item_id: string; // UUID → items.id
    price: number;
    in_stock: boolean;
    checked_at: Date;
}

export interface Notification {
    id: string; // UUID
    user_id: string; // UUID → users.id
    item_id: string; // UUID → items.id
    type: NotificationType;
    price_before: number | null;
    price_after: number | null;
    affiliate_url: string | null;
    sent_at: Date | null;
    opened_at: Date | null;
    converted_at: Date | null;
    purchase_amount: number | null;
    created_at: Date;
}

export interface Waitlist {
    id: string; // UUID
    email: string;
    referral_source: string | null;
    created_at: Date;
}

// ─── API Request / Response Types ────────────────────────────────────────────

export interface RegisterRequest {
    email: string;
    password: string;
    referral_code?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: Omit<User, 'password_hash'>;
}

export interface CreateListRequest {
    name: string;
    is_shared?: boolean;
}

export interface AddItemRequest {
    list_id: string;
    url: string;
    target_price?: number;
    alert_threshold_percent?: number;
    alert_threshold_amount?: number;
    is_private?: boolean;
}

export interface ItemPreviewRequest {
    url: string;
}

export interface ItemPreviewResponse {
    product_name: string;
    product_image: string | null;
    current_price: number | null;
    retailer: SupportedRetailer | null;
    canonical_url: string;
    is_supported: boolean;
    variant_params: Record<string, string>;
}

export interface WaitlistRequest {
    email: string;
    referral_source?: string;
}

// ─── URL Normalizer Types ─────────────────────────────────────────────────────

export interface NormalizedUrl {
    original_url: string;
    resolved_url: string;
    canonical_url: string;
    retailer: SupportedRetailer | null;
    is_supported: boolean;
    variant_params: Record<string, string>;
    tracking_params_stripped: string[];
}

// ─── Price Check Types ────────────────────────────────────────────────────────

export interface PriceCheckResult {
    item_id: string;
    retailer: SupportedRetailer;
    current_price: number | null;
    in_stock: boolean;
    checked_at: Date;
    error?: string;
}

export interface PriceDropAlert {
    item: Item;
    user: Pick<User, 'id' | 'email' | 'fcm_token'>;
    price_before: number;
    price_after: number;
    drop_percent: number;
    drop_amount: number;
    affiliate_url: string;
}

// ─── Affiliate Types ──────────────────────────────────────────────────────────

export interface AffiliateTag {
    retailer: SupportedRetailer;
    param_name: string;
    tag_value: string;
}

export const AFFILIATE_TAGS: Record<SupportedRetailer, AffiliateTag> = {
    amazon: {
        retailer: 'amazon',
        param_name: 'tag',
        tag_value: process.env.AMAZON_AFFILIATE_TAG ?? 'joinpounce-20',
    },
    target: {
        retailer: 'target',
        param_name: 'afid',
        tag_value: process.env.TARGET_AFFILIATE_ID ?? '',
    },
    walmart: {
        retailer: 'walmart',
        param_name: 'affiliateId',
        tag_value: process.env.WALMART_AFFILIATE_ID ?? '',
    },
    bestbuy: {
        retailer: 'bestbuy',
        param_name: 'ref',
        tag_value: process.env.BESTBUY_AFFILIATE_ID ?? '',
    },
    wayfair: {
        retailer: 'wayfair',
        param_name: 'refid',
        tag_value: process.env.WAYFAIR_AFFILIATE_ID ?? '',
    },
};
