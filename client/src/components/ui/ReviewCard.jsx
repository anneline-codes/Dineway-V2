import { Star } from 'lucide-react';
import { format } from 'date-fns';

const ReviewCard = ({ review, showRestaurant = false }) => {
  const { userId, restaurantId, rating, comment, createdAt } = review;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'text-gold fill-gold' : 'text-text-muted'}
      />
    ));
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'U';
  };

  return (
    <div className="bg-card-bg border border-border rounded-md p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-bg-primary font-semibold text-sm flex-shrink-0">
          {getInitials(userId?.name)}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">
                {userId?.name || 'Anonymous'}
              </p>
              {showRestaurant && restaurantId && (
                <p className="text-sm text-gold">
                  {restaurantId.name}
                </p>
              )}
            </div>
            <div className="flex">{renderStars(rating)}</div>
          </div>
        </div>
      </div>

      {/* Comment */}
      <p className="text-text-muted text-sm leading-relaxed">{comment}</p>

      {/* Date */}
      <p className="text-xs text-text-muted">
        {createdAt ? format(new Date(createdAt), 'MMM d, yyyy') : ''}
      </p>
    </div>
  );
};

export default ReviewCard;