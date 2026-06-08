import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'book';
  jsonLd?: Record<string, unknown>;
}

export default function SEO({
  title = 'NeuroLibrary - Perpustakaan Digital Neurologi',
  description = 'Koleksi literatur neurologi, neurosains, dan kedokteran saraf untuk praktisi dan mahasiswa kedokteran. Dikurasi oleh dokter spesialis neurologi.',
  image = '/avatar-default.jpg',
  url = 'https://neurolibrary.id',
  type = 'website',
  jsonLd,
}: SEOProps) {
  const fullTitle = title.includes('NeuroLibrary') ? title : `${title} | NeuroLibrary`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}
