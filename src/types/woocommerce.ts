export interface WooCommercePrice {
  price: string;
  regular_price: string;
  sale_price: string;
  price_range: { min_amount: string; max_amount: string } | null;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_decimal_separator: string;
  currency_thousand_separator: string;
  currency_prefix: string;
  currency_suffix: string;
}

export interface WooCommerceImage {
  id: number;
  src: string;
  thumbnail: string;
  srcset?: string;
  sizes?: string;
  name?: string;
  alt?: string;
}

export interface WooCommerceCategory {
  id: number;
  name: string;
  slug: string;
  link: string;
  count?: number;
  image?: WooCommerceImage | null;
}

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink?: string;
  description?: string;
  short_description?: string;
  prices: WooCommercePrice;
  images: WooCommerceImage[];
  categories: WooCommerceCategory[];
  tags?: Array<{ id: number; name: string; slug: string }>;
  is_in_stock: boolean;
  is_purchasable: boolean;
  on_sale?: boolean;
  average_rating?: string;
  review_count?: number;
  attributes?: Array<{
    id: number;
    name: string;
    taxonomy?: string;
    has_variations?: boolean;
    terms: Array<{ id: number; name: string; slug: string }>;
  }>;
  stock_availability?: {
    text: string;
    class: string;
  };
}
