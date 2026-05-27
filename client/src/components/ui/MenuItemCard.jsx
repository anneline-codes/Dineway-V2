import { Star } from 'lucide-react';

const MenuItemCard = ({ item }) => {
  const { name, description, price, category, image, isPopular, isAvailable } = item;

  return (
    <div className="bg-card-bg border border-border rounded-md overflow-hidden card-hover">
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-bg-tertiary flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gold opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        )}

        {/* Popular Badge */}
        {isPopular && (
          <div className="absolute top-2 left-2">
            <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gold text-bg-primary rounded-full">
              <Star size={12} fill="currentColor" />
              Popular
            </span>
          </div>
        )}

        {/* Available Badge */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-bg-primary/70 flex items-center justify-center">
            <span className="px-3 py-1 text-sm font-medium bg-bg-tertiary text-text-muted rounded-full">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Category */}
        <span className="text-xs text-gold font-medium">{category}</span>

        {/* Name */}
        <h4 className="text-base font-semibold text-text-primary line-clamp-1">
          {name}
        </h4>

        {/* Description */}
        <p className="text-sm text-text-muted line-clamp-2">
          {description}
        </p>

        {/* Price */}
        <p className="text-lg font-serif font-semibold text-gold">
          {price?.toLocaleString()} RWF
        </p>
      </div>
    </div>
  );
};

export default MenuItemCard;