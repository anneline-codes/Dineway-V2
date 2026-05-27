import { Link } from 'react-router-dom';
import { MapPin, Clock, Star } from 'lucide-react';

const RestaurantCard = ({ restaurant }) => {
  const { _id, name, slug, description, category, address, rating, reviewCount, coverImage, status } = restaurant;

  const truncateDescription = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-card-bg border border-border rounded-md overflow-hidden card-hover group">
      {/* Cover Image */}
      <div className="relative h-48 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-bg-tertiary flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gold opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}
        
        {/* Status Badge */}
        {status && (
          <div className="absolute top-3 right-3">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                status === 'registered'
                  ? 'bg-success/20 text-success'
                  : 'bg-gold-light text-gold'
              }`}
            >
              {status}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Category Badge */}
        <span className="inline-block px-2 py-1 text-xs font-medium bg-gold-light text-gold rounded-full">
          {category}
        </span>

        {/* Name */}
        <h3 className="text-lg font-serif font-semibold text-text-primary line-clamp-1">
          {name}
        </h3>

        {/* Description */}
        <p className="text-sm text-text-muted line-clamp-2">
          {truncateDescription(description)}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-text-muted">
          <MapPin size={14} />
          <span className="line-clamp-1">
            {address?.city}, {address?.country}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-gold fill-gold" />
            <span className="text-sm font-medium text-text-primary">
              {rating?.toFixed(1) || '0.0'}
            </span>
          </div>
          <span className="text-sm text-text-muted">
            ({reviewCount || 0} reviews)
          </span>
        </div>

        {/* Action */}
        <Link
          to={`/restaurant/${slug}`}
          className="block w-full text-center py-2 px-4 bg-gold text-bg-primary font-medium rounded-md hover:bg-gold-hover transition-colors"
        >
          View Menu
        </Link>
      </div>
    </div>
  );
};

export default RestaurantCard;