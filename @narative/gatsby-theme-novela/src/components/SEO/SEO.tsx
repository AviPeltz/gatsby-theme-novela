/**
 * This react helmt code is adapted from
 * https://themeteorchef.com/tutorials/reusable-seo-with-react-helmet.
 *
 * A great tutorial explaining how to setup a robust version of an
 * SEO friendly react-helmet instance.
 *
 *
 * Use the Helmt on pages to generate SEO and meta content!
 *
 * Usage:
 * <SEO
 *   title={title}
 *   description={description}
 *   image={image}
 * />
 *
 */

import React from 'react';
import Helmet from 'react-helmet';
import { graphql, useStaticQuery } from 'gatsby';

interface HelmetProps {
  title: string;
  description?: string;
  pathname: string;
  image?: string;
  canonicalUrl?: string;
  published?: string;
  timeToRead?: string;
  dateforSEO?: string;
  authorName?: string;
  authorsSlug?: string;
  authorsBio?: string;
  isBlogPost: false;
}

const seoQuery = graphql`
  {
    allSite {
      edges {
        node {
          siteMetadata {
            description
            social {
              url
              name
            }
            siteUrl
            title
            name
          }
        }
      }
    }
  }
`;

const themeUIDarkModeWorkaroundScript = [
  {
    type: 'text/javascript',
    innerHTML: `
    (function() {
      try {
        var mode = localStorage.getItem('theme-ui-color-mode');
        if (!mode) {
          localStorage.setItem('theme-ui-color-mode', 'light');
        }
      } catch (e) {}
    })();
  `,
  },
];

const SEO: React.FC<HelmetProps> = ({
  title,
  description,
  children,
  image,
  published,
  timeToRead,
  canonicalUrl,
  dateforSEO,
  authorName,
  authorsSlug,
  authorsBio,
  isBlogPost,
}) => {
  const results = useStaticQuery(seoQuery);
  const site = results.allSite.edges[0].node.siteMetadata;
  const twitter = site.social.find(option => option.name === 'twitter') || {};
  const github = site.social.find(option => option.name === 'github') || {};
  const linkedin = site.social.find(option => option.name === 'linkedin') || {};
  const medium = site.social.find(option => option.name === 'medium') || {};

  const fullURL = (path: string) =>
    path ? `${path}` : site.siteUrl;

  // If no image is provided lets looks for a default novela static image
  image = image ? image : `${site.siteUrl}/preview.jpg`;

  // Checks if the source of the image is hosted on Contentful
  if (`${image}`.includes('ctfassets')) {
    image = `${image}`;
  } else {
    image = fullURL(image);
  }

  let siteSchema = `{
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "${site.siteUrl}/#organization",
        "name": "${site.title}",
        "url": "${site.siteUrl}",
        "sameAs": [
          "${twitter.url}",
          "${github.url}",
          "${linkedin.url}",
          "${medium.url}"
        ],
        "logo": {
          "@type": "ImageObject",
          "@id": "${site.siteUrl}/#logo",
          "inLanguage": "en-US",
          "url": "${site.siteUrl}/icons/icon-512x512.png",
          "width": 512,
          "height": 512,
          "caption": "${site.title}"
        },
        "image": {
          "@id": "${site.siteUrl}/#logo"
        }
      },
      {
        "@type": "WebSite",
        "@id": "${site.siteUrl}/#website",
        "url": "${site.siteUrl}",
        "name": "${site.name}",
        "description": "${site.description.replace(/"/g, '\\"')}",
        "publisher": {
          "@id": "${site.siteUrl}/#organization"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": [
          "WebPage"
        ],
        "@id": "${site.siteUrl}/#webpage",
        "url": "${site.siteUrl}",
        "name": "${site.name}",
        "isPartOf": {
          "@id": "${site.siteUrl}/#website"
        },
        "about": {
          "@id": "${site.siteUrl}/#organization"
        },
        "description": "${site.description.replace(/"/g, '\\"')}",
        "inLanguage": "en-US"
      },
      {
        "@type": "BreadcrumbList",
        "description": "Breadcrumbs list",
        "itemListElement": [
          {
            "@type": "ListItem",
            "item": "${site.siteUrl}",
            "name": "Homepage",
            "position": "1"
          }
        ],
        "name": "Breadcrumbs"
      }
    ]
  }
`.replace(/"[^"]+"|(\s)/gm, function (matched, group1) {
    if (!group1) {
      return matched;
    } else {
      return '';
    }
  });

  let blogSchema = `{
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "${site.siteUrl}/#organization",
        "name": "${site.title}",
        "url": "${site.siteUrl}",
        "sameAs": [
          "${twitter.url}",
          "${github.url}",
          "${linkedin.url}",
          "${medium.url}"
        ],
        "logo": {
          "@type": "ImageObject",
          "@id": "${site.siteUrl}/#logo",
          "inLanguage": "en-US",
          "url": "${site.siteUrl}/icons/icon-512x512.png",
          "width": 512,
          "height": 512,
          "caption": "${site.title}"
        },
        "image": {
          "@id": "${site.siteUrl}/#logo"
        }
      },
      {
        "@type": "WebSite",
        "@id": "${site.siteUrl}/#website",
        "url": "${site.siteUrl}",
        "name": "${site.name}",
        "description": "${site.description.replace(/"/g, '\\"')}",
        "publisher": {
          "@id": "${site.siteUrl}/#organization"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "ImageObject",
        "@id": "${canonicalUrl}/#primaryimage",
        "inLanguage": "en-US",
        "url": "${image}",
        "width": 1200,
        "height": 628
      },
      {
        "@type": [
          "WebPage"
        ],
        "@id": "${canonicalUrl}/#webpage",
        "url": "${canonicalUrl}",
        "name": "${title}",
        "isPartOf": {
          "@id": "${site.siteUrl}/#website"
        },
        "primaryImageOfPage": {
          "@id": "${canonicalUrl}/#primaryimage"
        },
        "datePublished": "${dateforSEO}",
        "dateModified": "${dateforSEO}",
        "description": "${description}",
        "breadcrumb": {
          "@id": "${canonicalUrl}/#breadcrumb"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "BreadcrumbList",
        "@id": "${canonicalUrl}/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@type": "WebPage",
              "@id": "${site.siteUrl}",
              "url": "${site.siteUrl}",
              "name": "Home"
            }
          },
          {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@type": "WebPage",
              "@id": "${canonicalUrl}",
              "url": "${canonicalUrl}",
              "name": "${title}"
            }
          }
        ]
      },
      {
        "@type": "Article",
        "@id": "${canonicalUrl}/#article",
        "isPartOf": {
          "@id": "${canonicalUrl}/#webpage"
        },
        "author": {
          "@id": "${site.siteUrl}/#/schema${authorsSlug}"
        },
        "headline": "${title}",
        "datePublished": "${dateforSEO}",
        "dateModified": "${dateforSEO}",
        "mainEntityOfPage": {
          "@id": "${canonicalUrl}/#webpage"
        },
        "publisher": {
          "@id": "${site.siteUrl}/#organization"
        },
        "image": {
          "@id": "${canonicalUrl}/#primaryimage"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": [
          "Person"
        ],
        "@id": "${site.siteUrl}/#/schema${authorsSlug}",
        "name": "${authorName}",
        "image": {
          "@type": "ImageObject",
        "@id": "${site.siteUrl}/#personlogo",
          "inLanguage": "en-US",
          "caption": "${authorName}"
        },
        "description": "${authorsBio}",
        "sameAs": [
          "${twitter.url}",
          "${github.url}",
          "${linkedin.url}",
          "${medium.url}"
        ]
      }
    ]
  }
`.replace(/"[^"]+"|(\s)/gm, function (matched, group1) {
    if (!group1) {
      return matched;
    } else {
      return '';
    }
  });

  const schema = isBlogPost ? blogSchema : siteSchema

  const metaTags = [
    { charset: 'utf-8' },
    {
      'http-equiv': 'X-UA-Compatible',
      content: 'IE=edge',
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      name: 'theme-color',
      content: '#fff',
    },
    { itemprop: 'name', content: title || site.title },
    { itemprop: 'description', content: description || site.description },
    { itemprop: 'image', content: image },
    { name: 'description', content: description || site.description },

    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: site.name },
    { name: 'twitter:title', content: title || site.title },
    { name: 'twitter:description', content: description || site.description },
    { name: 'twitter:creator', content: twitter.url },
    {
      name: 'twitter:image',
      content: image,
    },

    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title || site.title },
    { property: 'og:url', content: canonicalUrl || site.siteUrl },
    { property: 'og:image', content: image },
    { property: 'og:description', content: description || site.description },
    { property: 'og:site_name', content: site.name },
  ];

  if (published) {
    metaTags.push({ name: 'article:published_time', content: published });
  }

  if (timeToRead) {
    metaTags.push({ name: 'twitter:label1', value: 'Reading time' });
    metaTags.push({ name: 'twitter:data1', value: `${timeToRead} min read` });
  }

  return (
    <Helmet
      title={title || site.title}
      htmlAttributes={{ lang: 'en' }}
      script={themeUIDarkModeWorkaroundScript}
      meta={metaTags}
    >
      <script type="application/ld+json">{schema}</script>
      <link rel="canonical" href={canonicalUrl || site.siteUrl} />
      {children}
    </Helmet>
  );
};

export default SEO;
