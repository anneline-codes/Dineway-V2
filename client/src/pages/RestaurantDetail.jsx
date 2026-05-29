import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { MapPin, Phone, Mail, Clock, Star, ChevronRight, UtensilsCrossed, MessageSquare, Info } from 'lucide-react';
import { restaurantAPI, reviewAPI, menuAPI } from '../services/api';
import MenuItemCard from '../components/ui/MenuItemCard';
import ReviewCard from '../components/ui/ReviewCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import Spinner from '../components/ui/Spinner';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const RestaurantDetail = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useAuthStore();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('menu');
  const [menuCategory, setMenuCategory] = useState('All');
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const categories = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks', 'Specials'];

  useEffect(() => {
    const fetchRestaurantData = async () => {
      setIsLoading(true);
      try {
        // Fetch restaurant details
        const restaurantRes = await restaurantAPI.getById(slug);
        setRestaurant(restaurantRes.data.data);

        // Fetch menu items
        const menuRes = await menuAPI.getRestaurantMenu(restaurantRes.data.data._id);
        setMenuItems(menuRes.data.data);

        // Fetch reviews
        const reviewsRes = await reviewAPI.getRestaurant(restaurantRes.data.data._id);
        setReviews(reviewsRes.data.data);
      } catch (error) {
        toast.error('Failed to load restaurant details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantData();
  }, [slug]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await reviewAPI.create({
        restaurantId: restaurant._id,
        rating: newReview.rating,
        comment: newReview.comment,
      });
      
      setReviews([response.data.data, ...reviews]);
      setNewReview({ rating: 5, comment: '' });
      toast.success('Review submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const filteredMenuItems = menuItems.filter(item => 
    menuCategory === 'All' || item.category === menuCategory
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold text-text-primary mb-4">
            Restaurant Not Found
          </h2>
          <p className="text-text-muted mb-6">
            The restaurant you're looking for doesn't exist.
          </p>
          <Link
            to="/overview"
            className="px-6 py-3 bg-gold text-bg-primary rounded-md hover:bg-gold-hover transition-colors"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${restaurant.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80'})`,
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">
                {restaurant.name}
              </h1>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-gold text-bg-primary text-sm rounded-md">
                  {restaurant.category}
                </span>
                <span className="flex items-center gap-1 text-white">
                  <Star className="text-gold fill-gold" size={16} />
                  {restaurant.rating?.toFixed(1) || '0.0'}
                  <span className="text-text-muted">({restaurant.reviewCount} reviews)</span>
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-md text-sm ${
                restaurant.status === 'registered'
                  ? 'bg-success/20 text-success border border-success'
                  : 'bg-gold-light text-gold border border-gold'
              }`}>
                {restaurant.status === 'registered' ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Info Bar */}
      <section className="bg-bg-secondary border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4 px-4">
            <div className="flex items-center gap-2 text-text-muted">
              <MapPin size={18} />
              <span className="text-sm truncate">
                {restaurant.address?.city}, {restaurant.address?.country}
              </span>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <Phone size={18} />
              <span className="text-sm">{restaurant.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <Mail size={18} />
              <span className="text-sm truncate">{restaurant.email}</span>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <Clock size={18} />
              <span className="text-sm">Open Today</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/reservations"
                className="flex items-center gap-2 px-4 py-2 bg-gold text-bg-primary text-sm font-medium rounded-md hover:bg-gold-hover transition-colors justify-center"
              >
                Book a Table
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="bg-bg-primary border-b border-border sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {[
              { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
              { id: 'reviews', label: 'Reviews', icon: MessageSquare },
              { id: 'info', label: 'Info', icon: Info },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-gold text-gold'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-12 px-4 bg-bg-primary">
        <div className="max-w-7xl mx-auto">
          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <div>
              {/* Category Tabs */}
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setMenuCategory(category)}
                    className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                      menuCategory === category
                        ? 'bg-gold text-bg-primary'
                        : 'bg-bg-secondary text-text-muted hover:text-gold border border-border'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Menu Grid */}
              {filteredMenuItems.length === 0 ? (
                <div className="text-center py-20">
                  <UtensilsCrossed className="mx-auto text-gold mb-4" size={48} />
                  <h3 className="text-xl font-serif font-semibold text-text-primary mb-2">
                    No menu items yet
                  </h3>
                  <p className="text-text-muted">
                    This restaurant hasn't added any items in this category.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMenuItems.map(item => (
                    <MenuItemCard key={item._id} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Review Form */}
              <div className="md:col-span-1">
                <div className="bg-bg-secondary border border-border rounded-md p-6 sticky top-32">
                  <h3 className="text-xl font-serif font-bold text-text-primary mb-4">
                    Write a Review
                  </h3>
                  {isAuthenticated ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm text-text-muted mb-2">
                          Rating
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                              className="text-2xl transition-transform hover:scale-110"
                            >
                              <Star
                                className={`${
                                  star <= newReview.rating
                                    ? 'text-gold fill-gold'
                                    : 'text-text-muted'
                                }`}
                                size={24}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-text-muted mb-2">
                          Comment
                        </label>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          rows={4}
                          placeholder="Share your experience..."
                          className="w-full bg-bg-primary border border-border rounded-md px-4 py-3 text-text-primary placeholder-text-muted focus:border-gold focus:ring-1 focus:ring-gold-light outline-none resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="w-full px-4 py-3 bg-gold text-bg-primary font-medium rounded-md hover:bg-gold-hover transition-colors disabled:opacity-50"
                      >
                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-text-muted mb-4">
                        Login to share your experience
                      </p>
                      <Link
                        to="/login"
                        className="px-6 py-2 bg-gold text-bg-primary rounded-md hover:bg-gold-hover transition-colors inline-block"
                      >
                        Sign In
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews List */}
              <div className="md:col-span-2 space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-20">
                    <MessageSquare className="mx-auto text-gold mb-4" size={48} />
                    <h3 className="text-xl font-serif font-semibold text-text-primary mb-2">
                      No reviews yet
                    </h3>
                    <p className="text-text-muted">
                      Be the first to review this restaurant.
                    </p>
                  </div>
                ) : (
                  reviews.map(review => (
                    <ReviewCard key={review._id} review={review} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-serif font-bold text-text-primary mb-6">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin className="text-gold flex-shrink-0" size={20} />
                    <div>
                      <p className="text-sm text-text-muted">Address</p>
                      <p className="text-text-primary">
                        {restaurant.address?.street}<br />
                        {restaurant.address?.city}, {restaurant.address?.state} {restaurant.address?.zipCode}<br />
                        {restaurant.address?.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="text-gold flex-shrink-0" size={20} />
                    <div>
                      <p className="text-sm text-text-muted">Phone</p>
                      <p className="text-text-primary">{restaurant.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail className="text-gold flex-shrink-0" size={20} />
                    <div>
                      <p className="text-sm text-text-muted">Email</p>
                      <p className="text-text-primary">{restaurant.email}</p>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-serif font-bold text-text-primary mt-8 mb-6">
                  Opening Hours
                </h3>
                <div className="space-y-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                    const hours = restaurant.openingHours?.[day];
                    return (
                      <div key={day} className="flex justify-between py-2 border-b border-border">
                        <span className="text-text-primary capitalize">{day}</span>
                        <span className="text-text-muted">
                          {hours?.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-serif font-bold text-text-primary mb-6">
                  Location
                </h3>
                <div className="bg-bg-secondary border border-border rounded-md h-80 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="mx-auto text-gold mb-4" size={48} />
                    <p className="text-text-muted">Map coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default RestaurantDetail;