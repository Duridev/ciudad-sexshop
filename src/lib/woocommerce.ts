import type { WooCommerceProduct, WooCommerceCategory } from '../types/woocommerce';
import rawCatalog from '../data/products-catalog.json';

const baseCatalog = rawCatalog as unknown as WooCommerceProduct[];
const API_BASE_URL = 'https://ciudadsexshop.cl/wp-json/wc/store/v1';

// In-memory cache for build performance and resilience
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

/**
 * Formats a raw WooCommerce price value into Chilean Pesos (CLP).
 * e.g. "9990" -> "$9.990"
 */
export function formatCLP(amount: string | number, minorUnits: number = 0): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return '$0';

  const actualValue = minorUnits > 0 ? numericAmount / Math.pow(10, minorUnits) : numericAmount;

  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(actualValue);
}

/**
 * Cleans HTML markup from strings (for previews or meta descriptions).
 */
export function stripHtml(html: string = ''): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#038;/g, '&')
    .trim();
}

/**
 * Filter catalog locally with complete fidelity and speed.
 */
function filterLocalCatalog(options: {
  per_page?: number;
  page?: number;
  category?: number | string;
  featured?: boolean;
  search?: string;
  orderby?: string;
  order?: 'asc' | 'desc';
} = {}): WooCommerceProduct[] {
  let list = [...baseCatalog];

  if (options.category) {
    const catQuery = String(options.category).toLowerCase();
    list = list.filter((p) => {
      if (!p.categories || p.categories.length === 0) return false;
      return p.categories.some((c) => {
        return (
          String(c.id) === catQuery ||
          c.slug.toLowerCase() === catQuery ||
          c.name.toLowerCase() === catQuery
        );
      });
    });
  }

  if (options.search) {
    const q = options.search.toLowerCase();
    list = list.filter((p) => {
      const name = p.name ? p.name.toLowerCase() : '';
      const desc = p.description ? p.description.toLowerCase() : '';
      const sDesc = p.short_description ? p.short_description.toLowerCase() : '';
      return name.includes(q) || desc.includes(q) || sDesc.includes(q);
    });
  }

  if (options.orderby) {
    if (options.orderby === 'price' || options.orderby === 'price-asc') {
      list.sort((a, b) => parseInt(a.prices?.price || '0') - parseInt(b.prices?.price || '0'));
    } else if (options.orderby === 'price-desc') {
      list.sort((a, b) => parseInt(b.prices?.price || '0') - parseInt(a.prices?.price || '0'));
    } else if (options.orderby === 'title' || options.orderby === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  if (options.featured) {
    list = list.slice(0, 8);
  }

  if (options.page && options.per_page) {
    const start = (options.page - 1) * options.per_page;
    return list.slice(start, start + options.per_page);
  } else if (options.per_page) {
    return list.slice(0, options.per_page);
  }

  return list;
}

/**
 * Fetch products from the WooCommerce Store REST API with fast local fallback.
 */
export async function getProducts(options: {
  per_page?: number;
  page?: number;
  category?: number | string;
  featured?: boolean;
  search?: string;
  orderby?: string;
  order?: 'asc' | 'desc';
} = {}): Promise<WooCommerceProduct[]> {
  const url = new URL(`${API_BASE_URL}/products`);
  if (options.per_page) url.searchParams.set('per_page', options.per_page.toString());
  if (options.page) url.searchParams.set('page', options.page.toString());
  if (options.category) url.searchParams.set('category', options.category.toString());
  if (options.featured) url.searchParams.set('featured', 'true');
  if (options.search) url.searchParams.set('search', options.search);
  if (options.orderby) url.searchParams.set('orderby', options.orderby);
  if (options.order) url.searchParams.set('order', options.order);

  const cacheKey = url.toString();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CiudadSexShop-Astro-Frontend/1.0',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data: WooCommerceProduct[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      }
    }
  } catch (_e) {
    // Graceful fallback to local complete catalog
  }

  const fallbackData = filterLocalCatalog(options);
  cache.set(cacheKey, { data: fallbackData, timestamp: Date.now() });
  return fallbackData;
}

/**
 * Fetch all available products across catalog (guaranteed 217 products).
 */
export async function getAllProducts(): Promise<WooCommerceProduct[]> {
  const cacheKey = 'all_products_catalog';
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  cache.set(cacheKey, { data: baseCatalog, timestamp: Date.now() });
  return baseCatalog;
}

/**
 * Fetch a single product by slug from the WooCommerce Store REST API or local catalog.
 */
export async function getProductBySlug(slug: string): Promise<WooCommerceProduct | null> {
  const localMatch = baseCatalog.find((p) => p.slug === slug);
  if (localMatch) {
    return localMatch;
  }

  const cacheKey = `product_slug_${slug}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const url = new URL(`${API_BASE_URL}/products`);
  url.searchParams.set('slug', slug);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CiudadSexShop-Astro-Frontend/1.0',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data: WooCommerceProduct[] = await res.json();
      if (data && data.length > 0) {
        cache.set(cacheKey, { data: data[0], timestamp: Date.now() });
        return data[0];
      }
    }
  } catch (_e) {
    // Silent catch
  }

  return null;
}

/**
 * Official categories matching WordPress menu exactly with dynamic product counts.
 */
export function getOfficialCategories(): WooCommerceCategory[] {
  const base = [
    { id: 60, name: 'Dildos', slug: 'dildos', link: '/categoria/dildos' },
    { id: 34, name: 'Vibradores', slug: 'vibradores', link: '/categoria/vibradores' },
    { id: 47, name: 'Feromonas', slug: 'feromonas', link: '/categoria/feromonas' },
    { id: 31, name: 'Lencería', slug: 'lenceria', link: '/categoria/lenceria' },
    { id: 48, name: 'Lubricantes', slug: 'lubricantes', link: '/categoria/lubricantes' },
    { id: 35, name: 'Dilatadores', slug: 'dilatadores', link: '/categoria/dilatadores' },
    { id: 33, name: 'Accesorios', slug: 'accesorios', link: '/categoria/accesorios' },
    { id: 45, name: 'Anal', slug: 'anal', link: '/categoria/anal' },
    { id: 42, name: 'BDSM-Bondage', slug: 'bdsm-bondage', link: '/categoria/bdsm-bondage' },
    { id: 50, name: 'Joyas', slug: 'joyas', link: '/categoria/joyas' },
    { id: 43, name: 'Pene/Dildo', slug: 'para-pene-dildo', link: '/categoria/para-pene-dildo' },
    { id: 28, name: 'Cuidados', slug: 'cuidados-productos', link: '/categoria/cuidados-productos' },
    { id: 49, name: 'Higiene e Hidratación', slug: 'higiene-e-hidratacion', link: '/categoria/higiene-e-hidratacion' },
    { id: 29, name: 'Juegos', slug: 'juegos', link: '/categoria/juegos' },
    { id: 39, name: 'Promociones', slug: 'promociones', link: '/categoria/promociones' },
    { id: 44, name: 'Varios', slug: 'varios', link: '/categoria/varios' },
  ];

  return base.map((cat) => {
    const count = baseCatalog.filter((p) => {
      if (!p.categories || p.categories.length === 0) return false;
      return p.categories.some(
        (c) =>
          c.id === cat.id ||
          c.slug.toLowerCase() === cat.slug.toLowerCase() ||
          c.name.toLowerCase() === cat.name.toLowerCase()
      );
    }).length;

    return {
      ...cat,
      count,
    };
  });
}

/**
 * Fetch product categories from the WooCommerce Store REST API.
 */
export async function getCategories(): Promise<WooCommerceCategory[]> {
  return getOfficialCategories();
}

/**
 * Complete fallback data.
 */
export function getFallbackProducts(): WooCommerceProduct[] {
  return baseCatalog;
}
