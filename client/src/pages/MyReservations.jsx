import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, UtensilsCrossed } from 'lucide-react';
import { reservationAPI } from '../services/api';
import ReservationCard from '../components/ui/ReservationCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import Spinner from '../components/ui/Spinner';
import { isBefore, startOfDay } from 'date-fns';
import toast from 'react-hot-toast';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchReservations = async () => {
    try {
      const response = await reservationAPI.getMy();
      setReservations(response.data.data);
    } catch (error) {
      toast.error('Failed to load reservations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const filteredReservations = useMemo(() => {
    const today = startOfDay(new Date());
    
    switch (activeTab) {
      case 'upcoming':
        return reservations.filter(r => {
          const reservationDate = new Date(r.date);
          return (r.status === 'pending' || r.status === 'confirmed') && !isBefore(reservationDate, today);
        });
      case 'past':
        return reservations.filter(r => {
          const reservationDate = new Date(r.date);
          return isBefore(reservationDate, today);
        });
      case 'cancelled':
        return reservations.filter(r => r.status === 'cancelled');
      default:
        return reservations;
    }
  }, [reservations, activeTab]);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const getEmptyState = () => {
    switch (activeTab) {
      case 'upcoming':
        return {
          icon: Calendar,
          title: 'No upcoming reservations',
          message: 'You don\'t have any upcoming reservations scheduled.',
          action: (
            <Link
              to="/reservations"
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gold text-bg-primary rounded-md hover:bg-gold-hover transition-colors"
            >
              Book a Table
              <ChevronRight size={16} />
            </Link>
          ),
        };
      case 'past':
        return {
          icon: Clock,
          title: 'No past reservations',
          message: 'You haven\'t had any reservations yet.',
          action: null,
        };
      case 'cancelled':
        return {
          icon: UtensilsCrossed,
          title: 'No cancelled reservations',
          message: 'You don\'t have any cancelled reservations.',
          action: null,
        };
      default:
        return {
          icon: Calendar,
          title: 'No reservations yet',
          message: 'Start exploring restaurants and make your first reservation.',
          action: (
            <Link
              to="/overview"
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gold text-bg-primary rounded-md hover:bg-gold-hover transition-colors"
            >
              Explore Restaurants
              <ChevronRight size={16} />
            </Link>
          ),
        };
    }
  };

  const emptyState = getEmptyState();
  const EmptyIcon = emptyState.icon;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Page Header */}
      <section className="pt-24 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-gold mb-2">
            My Reservations
          </h1>
          <p className="text-text-muted">
            Manage your upcoming and past bookings
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="border-b border-border bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-gold text-gold'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Reservations List */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-20">
              <EmptyIcon className="mx-auto text-gold mb-4" size={64} />
              <h3 className="text-2xl font-serif font-bold text-text-primary mb-2">
                {emptyState.title}
              </h3>
              <p className="text-text-muted mb-6">{emptyState.message}</p>
              {emptyState.action}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map(reservation => (
                <ReservationCard
                  key={reservation._id}
                  reservation={reservation}
                  onCancel={fetchReservations}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyReservations;