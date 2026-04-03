import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const Seo = ({ title, description, image, url, type = 'website' }) => {
    // Cấu hình mặc định (Fallback)
    const siteName = "The Horizons";
    const defaultDescription = "Explore Vietnam with The Horizons – book tours, hotels, cruises, train and bus tickets in one seamless travel platform.";
    const defaultImage = "https://images.squarespace-cdn.com/content/v1/660c52f44ee9cf0f3abea26f/ffeb4ccc-0e05-4738-81f3-17d44334b66a/Logo-ngang-final.png?format=1500w";
    const defaultUrl = "https://thehorizons.com";

    // Logic: Ưu tiên props truyền vào, nếu không có thì dùng mặc định
    const metaTitle = title ? `${title} | ${siteName}` : `${siteName}`;
    const metaDescription = description || defaultDescription;
    const metaImage = image || defaultImage;
    const metaUrl = url || defaultUrl;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            <link rel="canonical" href={metaUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />
        </Helmet>
    );
};

Seo.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    url: PropTypes.string,
    type: PropTypes.string
};

export default Seo;
