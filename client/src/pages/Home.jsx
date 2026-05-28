import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, Calendar, Utensils, Users, TrendingUp, Clock, Shield, Award } from 'lucide-react';
import { reviewAPI, restaurantAPI } from '../services/api';
import { newsletterAPI } from '../services/api';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import TornEdge from '../components/ui/TornEdge';
import ReviewCard from '../components/ui/ReviewCard';
import SkeletonCard from '../components/ui/SkeletonCard';

const Home = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await reviewAPI.getLatest(3);
        setReviews(response.data.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoadingReviews(false);
      }
    };
    fetchReviews();
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setIsSubscribing(true);
    try {
      await newsletterAPI.subscribe(email);
      toast.success('Successfully subscribed!');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to subscribe');
    } finally {
      setIsSubscribing(false);
    }
  };

  const features = [
    { icon: Calendar, title: 'Smart Dashboard', desc: 'Manage your reservations effortlessly' },
    { icon: Utensils, title: 'Easy Management', desc: 'Streamlined restaurant operations' },
    { icon: Users, title: 'Happy Customers', desc: 'Delight every guest with seamless service' },
    { icon: TrendingUp, title: 'Business Growth', desc: 'Data-driven insights for success' },
  ];

  const aboutFeatures = [
    { icon: Clock, title: 'Quick Reservations', desc: 'Book a table in seconds' },
    { icon: Shield, title: 'Secure Payments', desc: 'Safe and encrypted transactions' },
    { icon: Award, title: 'Premium Quality', desc: 'Only the best restaurants' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-gold text-lg mb-4 animate-fade-in-up">
            {isAuthenticated ? `Welcome back, ${user?.name?.split(' ')[0]}!` : 'Welcome to Dineway'}
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-text-primary mb-6 animate-fade-in-up">
            Indulge In <span className="text-gold">Elegant</span> Dining Moments
          </h1>
          <p className="text-lg md:text-xl text-text-muted mb-8 max-w-2xl mx-auto animate-fade-in-up">
            Discover exceptional restaurants, make instant reservations, and create
            unforgettable dining experiences with Dineway.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
            <Link
              to="/reservations"
              className="px-8 py-4 bg-gold text-bg-primary font-semibold rounded-md hover:bg-gold-hover transition-all transform hover:scale-105 btn-shimmer"
            >
              Reserve Your Table
            </Link>
            <Link
              to="/overview"
              className="px-8 py-4 border-2 border-gold text-gold font-semibold rounded-md hover:bg-gold hover:text-bg-primary transition-all"
            >
              Explore More
            </Link>
          </div>
        </div>

        {/* Feature Strip */}
        <div className="absolute bottom-0 left-0 right-0 bg-bg-secondary/90 backdrop-blur-sm border-t border-border">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <feature.icon className="text-gold" size={24} />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{feature.title}</p>
                    <p className="text-xs text-text-muted hidden lg:block">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Torn Edge Transition */}
      <TornEdge color="var(--bg-primary)" />

      {/* Value Proposition */}
      <section className="py-20 px-4 bg-bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-primary mb-6">
            Your Gateway to <span className="text-gold">Exceptional</span> Dining
          </h2>
          <p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto">
            Whether you're planning a romantic dinner, a business lunch, or a family
            celebration, Dineway connects you with the finest restaurants and makes
            reservation effortless.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/reservations"
              className="px-8 py-4 bg-gold text-bg-primary font-semibold rounded-md hover:bg-gold-hover transition-all"
            >
              Book a Table
            </Link>
            <Link
              to="/menu"
              className="px-8 py-4 border-2 border-gold text-gold font-semibold rounded-md hover:bg-gold hover:text-bg-primary transition-all"
            >
              View Menus
            </Link>
          </div>
        </div>
      </section>

      {/* Torn Edge Transition */}
      <TornEdge flip color="var(--bg-secondary)" />

      {/* About Section */}
      <section className="py-20 px-4 bg-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-primary mb-6">
                About <span className="text-gold">Dineway</span>
              </h2>
              <p className="text-lg text-text-muted mb-6 leading-relaxed">
                At Dineway, we believe that every meal is an opportunity to create
                lasting memories. Our platform brings together the finest restaurants
                and passionate diners, making it easier than ever to discover new
                culinary experiences.
              </p>
              <p className="text-lg text-text-muted mb-8 leading-relaxed">
                From intimate cafes to upscale fine dining, we curate a selection of
                establishments that share our commitment to excellence in food,
                service, and atmosphere.
              </p>
              <div className="grid grid-cols-3 gap-6">
                {aboutFeatures.map((feature, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gold-light rounded-full flex items-center justify-center">
                      <feature.icon className="text-gold" size={20} />
                    </div>
                    <p className="text-sm font-medium text-text-primary">{feature.title}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"
                alt="Restaurant interior"
                className="w-full h-96 object-cover rounded-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-gold text-bg-primary p-6 rounded-lg">
                <p className="text-3xl font-serif font-bold">50+</p>
                <p className="text-sm">Partner Restaurants</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-bg-primary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-primary mb-4">
              Why Choose <span className="text-gold">Dineway</span>
            </h2>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              We provide comprehensive solutions for both diners and restaurant partners
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Table Reservations', desc: 'Book your table instantly with real-time availability', icon: Calendar },
              { title: 'Menu Management', desc: 'Browse detailed menus with prices and dietary info', icon: Utensils },
              { title: 'Analytics Dashboard', desc: 'Track your dining history and preferences', icon: TrendingUp },
              { title: 'Staff Coordination', desc: 'Seamless communication with restaurant staff', icon: Users },
              { title: 'Order Notifications', desc: 'Get instant updates on your reservation status', icon: Clock },
              { title: 'Customer Reviews', desc: 'Share your experience and help others decide', icon: Star },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-bg-secondary border border-border rounded-lg p-6 card-hover"
              >
                <div className="w-12 h-12 bg-gold-light rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="text-gold" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-text-muted">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-primary mb-4">
              What Our <span className="text-gold">Customers</span> Say
            </h2>
            <p className="text-lg text-text-muted">
              Real experiences from real diners
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {isLoadingReviews
              ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
              : reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} showRestaurant />
                ))}
          </div>
        </div>
      </section>

      {/* Newsletter Banner */}
      <section className="py-16 px-4 bg-bg-primary">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-primary mb-4">
            Stay Updated
          </h2>
          <p className="text-text-muted mb-8">
            Subscribe to our newsletter for exclusive offers and restaurant updates
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 bg-bg-secondary border border-border rounded-md text-text-primary placeholder-text-muted focus:border-gold focus:ring-1 focus:ring-gold-light outline-none"
            />
            <button
              type="submit"
              disabled={isSubscribing}
              className="px-6 py-3 bg-gold text-bg-primary font-semibold rounded-md hover:bg-gold-hover transition-colors disabled:opacity-50"
            >
              {isSubscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;