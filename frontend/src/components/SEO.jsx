import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, keywords, image }) {
  const siteTitle = 'Apni Zameen - Your Trusted Real Estate Platform';
  const defaultDescription = 'Find your dream property with Apni Zameen. Browse through residential and commercial properties, connect with verified sellers, and make informed real estate decisions.';
  const defaultKeywords = 'real estate, property, buy property, sell property, rent property, real estate platform, property listing, property search';
  const defaultImage = '/images/og-image.jpg';

  return (
    <Helmet>
      <title>{title ? `${title} | ${siteTitle}` : siteTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title ? `${title} | ${siteTitle}` : siteTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title ? `${title} | ${siteTitle}` : siteTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={image || defaultImage} />
      
      {/* Additional SEO tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#4F46E5" />
      <link rel="canonical" href={window.location.href} />
    </Helmet>
  );
} 