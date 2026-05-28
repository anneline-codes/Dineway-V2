import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UtensilsCrossed, Star, Search, ChevronDown } from 'lucide-react';
import { restaurantAPI, menuAPI } from '../services/api';
import MenuItemCard from '../components/ui/MenuItemCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import TornEdge from '../components/ui/TornEdge';
import toast from 'react-hot-toast';

const Menu = () => {
  const [searchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks', 'Specials'];

  // Pre-select restaurant from query param
  useEffect(() => {
    const restaurantId = searchParams.get('restaurantId');
    if (restaurantId) {
      setSelectedRestaurant(restaurantId);
    }
  }, [searchParams]);

  // Fetch restaurants for dropdown
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await restaurantAPI.getAll();
        setRestaurants(response.data.data);
      } catch (error) {
        toast.error('Failed to load restaurants');
      } finally {
        setIsLoadingRestaurants(false);
      }
    };
    fetchRestaurants();
  }, []);

  // Fetch menu when restaurant changes
  useEffect(() => {
    if (!selectedRestaurant) {
      setMenuItems([]);
      return;
    }

    const fetchMenu = async () => {
      setIsLoadingMenu(true);
      try {
        const response = await menuAPI.getRestaurantMenu(selectedRestaurant);
        setMenuItems(response.data.data);
      } catch (error) {
        toast.error('Failed to load menu');
        setMenuItems([]);
      } finally {
        setIsLoadingMenu(false);
      }
    };
    fetchMenu();
  }, [selectedRestaurant]);

  // Filter menu items by search and category
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, activeCategory]);

  // Get popular items
  const popularItems = useMemo(() => {
    return menuItems.filter(item => item.isPopular);
  }, [menuItems]);

  const handleRestaurantChange = (e) => {
    setSelectedRestaurant(e.target.value);
    setSearchQuery('');
    setActiveCategory('All');
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="pt-24 pb-12 px-4 bg-bg-primary">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold mb-4">
            Our Menu
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Explore dishes from our partner restaurants
          </p>
        </div>
      </section>

      {/* Restaurant Selector */}
      <section className="py-8 px-4 bg-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <label className="text-text-primary font-medium">
              Select Restaurant:
            </label>
            <div className="relative">
              <select
                value={selectedRestaurant}
                onChange={handleRestaurantChange}
                className="appearance-none bg-bg-primary border border-border rounded-md px-4 py-3 pr-10 text-text-primary focus:border-gold focus:ring-1 focus:ring-gold-light outline-none min-w-[300px]"
              >
                <option value="">Choose a restaurant...</option>
                {isLoadingRestaurants ? (
                  <option>Loading...</option>
                ) : (
                  restaurants.map(restaurant => (
                    <option key={restaurant._id} value={restaurant._id}>
                      {restaurant.name}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            </div>
          </div>
        </div>
      </section>

      {selectedRestaurant && (
        <>
          {/* Search Bar */}
          <section className="py-6 px-4 bg-bg-primary">
            <div className="max-w-7xl mx-auto">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-bg-secondary border border-border rounded-md pl-12 pr-4 py-3 text-text-primary placeholder-text-muted focus:border-gold focus:ring-1 focus:ring-gold-light outline-none"
                />
              </div>
            </div>
          </section>

          {/* Popular Items Section */}
          {popularItems.length > 0 && (
            <section className="py-8 px-4 bg-bg-primary">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-serif font-bold text-gold mb-6 flex items-center gap-2">
                  <Star className="text-gold" size={24} />
                  Chef's Recommendations
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {popularItems.map(item => (
                    <div key={item._id} className="flex-shrink-0 w-72">
                      <MenuItemCard item={item} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Category Tabs */}
          <section className="py-4 px-4 bg-bg-secondary sticky top-16 z-30 border-b border-border">
            <div className="max-w-7xl mx-auto">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-6 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
                      activeCategory === category
                        ? 'bg-gold text-bg-primary'
                        : 'bg-bg-primary text-text-muted hover:text-gold border border-border'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Menu Grid */}
          <section className="py-12 px-4 bg-bg-secondary">
            <div className="max-w-7xl mx-auto">
              {isLoadingMenu ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-20">
                  <UtensilsCrossed className="mx-auto text-gold mb-4" size={48} />
                  <h3 className="text-xl font-serif font-semibold text-text-primary mb-2">
                    No items found
                  </h3>
                  <p className="text-text-muted">
                    {searchQuery
                      ? 'Try a different search term'
                      : 'No items in this category yet'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map(item => (
                    <MenuItemCard key={item._id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {!selectedRestaurant && (
        <section className="py-20 px-4 bg-bg-secondary">
          <div className="max-w-7xl mx-auto text-center">
            <UtensilsCrossed className="mx-auto text-gold mb-4" size={64} />
            <h2 className="text-2xl font-serif font-bold text-text-primary mb-4">
              Select a Restaurant
            </h2>
            <p className="text-text-muted max-w-md mx-auto">
              Choose a restaurant from the dropdown above to explore their menu offerings.
            </p>
          </div>
        </section>
      )}

      <TornEdge color="var(--bg-primary)" />
    </div>
  );
};

export default Menu;