import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    name?: string;
    type?: string;
    url?: string;
    image?: string;
}

export default function SEO({
    title,
    description,
    name = 'Mrs. Deore Premix',
    type = 'website',
    url = 'https://mrs-deores.onrender.com', // Replace with your production URL base
    image = 'https://mrs-deores.onrender.com/og-image.png' // Default OG image
}: SEOProps) {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title}</title>
            <meta name='description' content={description} />

            {/* Open Graph / Facebook tags */}
            <meta property='og:title' content={title} />
            <meta property='og:description' content={description} />
            <meta property='og:type' content={type} />
            <meta property='og:url' content={url} />
            <meta property='og:site_name' content={name} />

            {/* Ensure image has an absolute URL if one is provided */}
            {image && <meta property='og:image' content={image} />}

            {/* Twitter tags */}
            <meta name='twitter:creator' content={name} />
            <meta name='twitter:card' content={type === 'article' ? 'summary_large_image' : 'summary'} />
            <meta name='twitter:title' content={title} />
            <meta name='twitter:description' content={description} />
            {image && <meta name='twitter:image' content={image} />}
        </Helmet>
    );
}
