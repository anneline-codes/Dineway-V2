import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, Star } from 'lucide-react';
import { restaurantAPI } from '../services/api';
import RestaurantCard from '../components/ui/RestaurantCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import TornEdge from '../components/ui/TornEdge';
import ReviewCard from '../components/ui/ReviewCard';
import { Link } from 'react-router-dom';

const Overview = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt:desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const categories = ['Fine Dining', 'Casual', 'Fast Food', 'African', 'Asian', 'French'];

  useEffect(() => {
    fetchData();
  }, [searchTerm, selectedCategory, sortBy, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        category: selectedCategory,
        sort: sortBy,
        page,
        limit: 12,
      };

      const [restaurantsRes, statsRes] = await Promise.all([
        restaurantAPI.getAll(params),
        restaurantAPI.getStats(),
      ]);

      setRestaurants(restaurantsRes.data.data);
      setTotalPages(restaurantsRes.data.pages);
      setTotal(restaurantsRes.data.total);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const sampleReviews = [
    {
      _id: '1',
      userId: { name: 'Sarah M.' },
      restaurantId: { name: 'M Hotel' },
      rating: 5,
      comment: 'Absolutely stunning experience! The ambiance and food were exceptional.',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2',
      userId: { name: 'John D.' },
      restaurantId: { name: 'Chez Lando' },
      rating: 5,
      comment: 'Best dining experience in Kigali. Highly recommend!',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '3',
      userId: { name: 'Emily R.' },
      restaurantId: { name: 'Soy Restaurant' },
      rating: 4,
      comment: 'Great food and excellent service. Will definitely come back.',
      createdAt: new Date().toISOString(),
    },
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Page Header */}
      <section className="bg-bg-secondary border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-text-primary mb-4">
              Restaurant <span className="text-gold">Overview</span>
            </h1>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Discover our curated selection of exceptional dining establishments
            </p>
          </div>

          {/* Stats Bar */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-bg-primary border border-border rounded-lg p-4 text-center">
                <p className="text-2xl font-serif font-bold text-gold">{stats.total}</p>
                <p className="text-sm text-text-muted">Total Restaurants</p>
              </div>
              <div className="bg-bg-primary border border-border rounded-lg p-4 text-center">
                <p className="text-2xl font-serif font-bold text-gold">{stats.registered}</p>
                <p className="text-sm text-text-muted">Registered</p>
              </div>
              <div className="bg-bg-primary border border-border rounded-lg p-4 text-center">
                <p className="text-2xl font-serif font-bold text-gold">{stats.pending}</p>
                <p className="text-sm text-text-muted">Pending</p>
              </div>
              <div className="bg-bg-primary border border-border rounded-lg p-4 text-center">
                <p className="text-2xl font-serif font-bold text-gold">{stats.newThisMonth}</p>
                <p className="text-sm text-text-muted">New This Month</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="bg-bg-primary border-b border-border sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border rounded-md text-text-primary placeholder-text-muted focus:border-gold focus:ring-1 focus:ring-gold-light outline-none"
                />
              </div>
            </form>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap justify-center">
              <button
                onClick={() => { setSelectedCategory(''); setPage(1); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-gold text-bg-primary'
                    : 'bg-bg-secondary border border-border text-text-primary hover:border-gold'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setPage(1); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-gold text-bg-primary'
                      : 'bg-bg-secondary border border-border text-text-primary hover:border-gold'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="px-4 py-2 pr-10 bg-bg-secondary border border-border rounded-md text-text-primary appearance-none cursor-pointer focus:border-gold focus:ring-1 focus:ring-gold-light outline-none"
              >
                <option value="createdAt:desc">Newest First</option>
                <option value="createdAt:asc">Oldest First</option>
                <option value="name:asc">Name A-Z</option>
                <option value="name:desc">Name Z-A</option>
                <option value="rating:desc">Highest Rated</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* Restaurant Grid */}
      <section className="py-12 px-4 bg-bg-primary">
        <div className="max-w-7xl mx-auto">
          <p className="text-text-muted mb-6">
            Showing {loading ? 0 : restaurants.length} of {total} restaurants
          </p>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : restaurants.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-bg-secondary border border-border rounded-md text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:border-gold transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-4 py-2 rounded-md transition-colors ${
                          page === pageNum
                            ? 'bg-gold text-bg-primary'
                            : 'bg-bg-secondary border border-border text-text-primary hover:border-gold'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-bg-secondary border border-border rounded-md text-text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:border-gold transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-text-muted">No restaurants found</p>
              <p className="text-text-muted mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      {/* Torn Edge */}
      <TornEdge color="var(--bg-secondary)" />

      {/* Customer Feedback */}
      <section className="py-20 px-4 bg-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-text-primary mb-4">
              Customer <span className="text-gold">Feedback</span>
            </h2>
            <p className="text-lg text-text-muted">What our diners are saying</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {sampleReviews.map((review) => (
              <ReviewCard key={review._id} review={review} showRestaurant />
            ))}
          </div>
        </div>
      </section>

      {/* Torn Edge */}
      <TornEdge flip color="var(--bg-primary)" />

      {/* View Menu CTA */}
      <section className="py-16 px-4 bg-bg-primary text-center">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-text-primary mb-6">
          Ready to Explore Our Menus?
        </h2>
        <p className="text-text-muted mb-8 max-w-2xl mx-auto">
          Browse through our extensive collection of dishes from top restaurants
        </p>
        <Link
          to="/menu"
          className="inline-block px-8 py-4 bg-gold text-bg-primary font-semibold rounded-md hover:bg-gold-hover transition-all"
        >
          View Menu
        </Link>
      </section>
    </div>
  );
};

export default Overview;