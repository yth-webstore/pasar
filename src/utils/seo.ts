import { Product, VillageNews, Category } from '../types';

export function updatePageSEO(title: string = '', description: string = '', url?: string, ogImage?: string) {
  // Update document title
  const safeTitle = typeof title === 'string' ? title : '';
  const fullTitle = safeTitle.includes('Pasar Desa') ? safeTitle : `${safeTitle} | Pasar Desa Mandiri Mekar Terus`;
  document.title = fullTitle;

  // Update meta description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  // Update OpenGraph
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', fullTitle);

  let ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute('content', description);

  if (ogImage) {
    let ogImgTag = document.querySelector('meta[property="og:image"]');
    if (!ogImgTag) {
      ogImgTag = document.createElement('meta');
      ogImgTag.setAttribute('property', 'og:image');
      document.head.appendChild(ogImgTag);
    }
    ogImgTag.setAttribute('content', ogImage);
  }

  // Update canonical link
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('content', url || window.location.href);
}

export function injectProductJsonLd(product: Product) {
  const jsonLdId = 'structured-data-product';
  let scriptTag = document.getElementById(jsonLdId);
  if (!scriptTag) {
    scriptTag = document.createElement('script');
    scriptTag.id = jsonLdId;
    scriptTag.setAttribute('type', 'application/ld+json');
    document.head.appendChild(scriptTag);
  }

  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: [product.imageUrl],
    description: product.description,
    sku: `DESA-${product.id}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IDR',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'LocalBusiness',
        name: product.sellerName,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Desa Mekar Terus',
          addressRegion: 'Jawa Tengah',
          addressCountry: 'ID',
        },
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toFixed(1),
      reviewCount: Math.max(1, Math.round(product.soldCount / 3)),
    },
  };

  scriptTag.textContent = JSON.stringify(structuredData);
}

export function injectNewsJsonLd(news: VillageNews) {
  const jsonLdId = 'structured-data-news';
  let scriptTag = document.getElementById(jsonLdId);
  if (!scriptTag) {
    scriptTag = document.createElement('script');
    scriptTag.id = jsonLdId;
    scriptTag.setAttribute('type', 'application/ld+json');
    document.head.appendChild(scriptTag);
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title,
    description: news.summary,
    datePublished: news.date,
    author: {
      '@type': 'Organization',
      name: 'Pemerintah Desa Mekar Terus & BUMDes',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Pasar Desa Mandiri',
    },
  };

  scriptTag.textContent = JSON.stringify(structuredData);
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

export function generateSitemapUrls(products: Product[], categories: Category[], news: VillageNews[]) {
  const baseUrl = window.location.origin;
  const list = [
    { loc: `${baseUrl}/`, changefreq: 'daily', priority: '1.0', title: 'Beranda Pasar Desa' },
    { loc: `${baseUrl}/kategori`, changefreq: 'weekly', priority: '0.8', title: 'Semua Kategori Produk' },
    { loc: `${baseUrl}/berita-desa`, changefreq: 'daily', priority: '0.8', title: 'Pengumuman & Berita Desa' },
  ];

  categories.forEach((cat) => {
    list.push({
      loc: `${baseUrl}/kategori/${cat.slug}`,
      changefreq: 'weekly',
      priority: '0.7',
      title: `Kategori ${cat.name} Desa`,
    });
  });

  products.forEach((prod) => {
    list.push({
      loc: `${baseUrl}/produk/${prod.slug}`,
      changefreq: 'daily',
      priority: '0.9',
      title: prod.name,
    });
  });

  news.forEach((n) => {
    list.push({
      loc: `${baseUrl}/berita/${n.slug}`,
      changefreq: 'monthly',
      priority: '0.6',
      title: n.title,
    });
  });

  return list;
}
