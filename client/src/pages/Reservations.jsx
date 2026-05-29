import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Users, Check, Calendar, Clock, UtensilsCrossed, AlertCircle } from 'lucide-react';
import { restaurantAPI, tableAPI, reservationAPI } from '../services/api';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';

const Reservations = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [restaurants, setRestaurants] = useState([]);
  const [tables, setTables] = useState([]);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdReservation, setCreatedReservation] = useState(null);

  const [formData, setFormData] = useState({
    restaurantId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    timeSlot: '',
    guestCount: 2,
    tableId: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  // Lunch slots: 11:00 - 13:30 (30min intervals)
  const lunchSlots = ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30'];
  // Dinner slots: 18:00 - 21:00 (30min intervals)
  const dinnerSlots = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

  // Minimum date is today
  const minDate = format(new Date(), 'yyyy-MM-dd');
  // Maximum date is 30 days from now
  const maxDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  // Fetch restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoadingRestaurants(true);
      try {
        const response = await restaurantAPI.getAll({ status: 'registered' });
        setRestaurants(response.data.data);
      } catch (error) {
        toast.error('Failed to load restaurants');
      } finally {
        setIsLoadingRestaurants(false);
      }
    };
    fetchRestaurants();
  }, []);

  // Fetch available tables when restaurant, date, and time are selected
  useEffect(() => {
    if (formData.restaurantId && formData.date && formData.timeSlot) {
      fetchAvailableTables();
    } else {
      setTables([]);
    }
  }, [formData.restaurantId, formData.date, formData.timeSlot]);

  const fetchAvailableTables = async () => {
    setIsLoadingTables(true);
    try {
      const response = await tableAPI.getAvailable({
        restaurantId: formData.restaurantId,
        date: formData.date,
        timeSlot: formData.timeSlot,
      });
      setTables(response.data.data);
      setFormData(prev => ({ ...prev, tableId: '' }));
    } catch (error) {
      toast.error('Failed to load available tables');
      setTables([]);
    } finally {
      setIsLoadingTables(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleGuestCount = (delta) => {
    const newCount = Math.min(12, Math.max(1, formData.guestCount + delta));
    setFormData(prev => ({ ...prev, guestCount: newCount }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.restaurantId) newErrors.restaurantId = 'Please select a restaurant';
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.timeSlot) newErrors.timeSlot = 'Please select a time slot';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.tableId) newErrors.tableId = 'Please select a table';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsCreating(true);
    try {
      const response = await reservationAPI.create({
        restaurantId: formData.restaurantId,
        tableId: formData.tableId,
        date: formData.date,
        timeSlot: formData.timeSlot,
        guestCount: formData.guestCount,
        notes: formData.notes,
      });
      setCreatedReservation(response.data.data);
      setIsSuccess(true);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create reservation');
    } finally {
      setIsCreating(false);
    }
  };

  const selectedRestaurant = restaurants.find(r => r._id === formData.restaurantId);
  const selectedTable = tables.find(t => t._id === formData.tableId);

  if (isSuccess && createdReservation) {
    return (
      <div className="min-h-screen pt-24 px-4 bg-bg-primary">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-success/20 rounded-full flex items-center justify-center">
              <Check className="text-success" size={40} />
            </div>
          </div>
          <h1 className="text-4xl font-serif font-bold text-text-primary mb-4">
            Reservation Confirmed!
          </h1>
          <p className="text-lg text-text-muted mb-8">
            Your table has been booked successfully.
          </p>

          <div className="bg-bg-secondary border border-border rounded-lg p-8 mb-8 text-left">
            <h2 className="text-xl font-serif font-bold text-gold mb-6">
              Booking Details
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-text-muted">Restaurant:</span>
                <span className="text-text-primary font-medium">
                  {selectedRestaurant?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Date:</span>
                <span className="text-text-primary">
                  {format(new Date(formData.date), 'EEEE, MMMM d yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Time:</span>
                <span className="text-text-primary">{formData.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Guests:</span>
                <span className="text-text-primary">{formData.guestCount} people</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Table:</span>
                <span className="text-text-primary">Table {selectedTable?.tableNumber}</span>
              </div>
              {formData.notes && (
                <div className="pt-4 border-t border-border">
                  <span className="text-text-muted">Notes:</span>
                  <p className="text-text-primary mt-1 italic">{formData.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/reservations/my')}
              className="px-8 py-4 bg-gold text-bg-primary font-semibold rounded-md hover:bg-gold-hover transition-colors"
            >
              View My Reservations
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 border-2 border-gold text-gold font-semibold rounded-md hover:bg-gold hover:text-bg-primary transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Page Header */}
      <section className="pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-gold mb-2">
            Make a Reservation
          </h1>
          <p className="text-text-muted">
            Book your table for an unforgettable dining experience
          </p>
        </div>
      </section>

      {/* Progress Stepper */}
      <section className="py-8 px-4 bg-bg-secondary">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step >= s
                      ? 'bg-gold text-bg-primary'
                      : 'bg-bg-primary border border-border text-text-muted'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-20 md:w-32 h-1 transition-colors ${
                      step > s ? 'bg-gold' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <div className="flex gap-16 text-sm text-text-muted">
              <span className={step >= 1 ? 'text-gold' : ''}>Details</span>
              <span className={step >= 2 ? 'text-gold' : ''}>Table</span>
              <span className={step >= 3 ? 'text-gold' : ''}>Confirm</span>
            </div>
          </div>
        </div>
      </section>

      {/* Form Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Restaurant & Date */}
          {step === 1 && (
            <div className="bg-bg-secondary border border-border rounded-lg p-8">
              <h2 className="text-2xl font-serif font-bold text-text-primary mb-6">
                Choose Restaurant & Date
              </h2>

              <div className="space-y-6">
                {/* Restaurant Selector */}
                <div>
                  <label className="block text-sm text-text-muted mb-2">
                    Restaurant *
                  </label>
                  <select
                    name="restaurantId"
                    value={formData.restaurantId}
                    onChange={handleInputChange}
                    className={`w-full bg-bg-primary border rounded-md px-4 py-3 text-text-primary focus:border-gold focus:ring-1 focus:ring-gold-light outline-none ${
                      errors.restaurantId ? 'border-error' : 'border-border'
                    }`}
                  >
                    <option value="">Select a restaurant...</option>
                    {isLoadingRestaurants ? (
                      <option>Loading...</option>
                    ) : (
                      restaurants.map((restaurant) => (
                        <option key={restaurant._id} value={restaurant._id}>
                          {restaurant.name} - {restaurant.category}
                        </option>
                      ))
                    )}
                  </select>
                  {errors.restaurantId && (
                    <p className="mt-1 text-sm text-error">{errors.restaurantId}</p>
                  )}
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-sm text-text-muted mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={minDate}
                    max={maxDate}
                    className={`w-full bg-bg-primary border rounded-md px-4 py-3 text-text-primary focus:border-gold focus:ring-1 focus:ring-gold-light outline-none ${
                      errors.date ? 'border-error' : 'border-border'
                    }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-error">{errors.date}</p>
                  )}
                </div>

                {/* Time Slot Selection */}
                <div>
                  <label className="block text-sm text-text-muted mb-2">
                    Time Slot *
                  </label>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-text-muted mb-2">Lunch (11:00 AM - 1:30 PM)</p>
                      <div className="flex flex-wrap gap-2">
                        {lunchSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, timeSlot: slot }))}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              formData.timeSlot === slot
                                ? 'bg-gold text-bg-primary'
                                : 'bg-bg-primary text-text-muted border border-border hover:border-gold'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-2">Dinner (6:00 PM - 9:00 PM)</p>
                      <div className="flex flex-wrap gap-2">
                        {dinnerSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, timeSlot: slot }))}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                              formData.timeSlot === slot
                                ? 'bg-gold text-bg-primary'
                                : 'bg-bg-primary text-text-muted border border-border hover:border-gold'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  {errors.timeSlot && (
                    <p className="mt-1 text-sm text-error">{errors.timeSlot}</p>
                  )}
                </div>

                {/* Guest Count */}
                <div>
                  <label className="block text-sm text-text-muted mb-2">
                    Number of Guests
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => handleGuestCount(-1)}
                      className="w-12 h-12 bg-bg-primary border border-border rounded-md flex items-center justify-center text-text-primary hover:border-gold transition-colors"
                    >
                      -
                    </button>
                    <div className="flex items-center gap-2">
                      <Users className="text-gold" size={20} />
                      <span className="text-xl font-semibold text-text-primary w-8 text-center">
                        {formData.guestCount}
                      </span>
                      <span className="text-text-muted">guests</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGuestCount(1)}
                      className="w-12 h-12 bg-bg-primary border border-border rounded-md flex items-center justify-center text-text-primary hover:border-gold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Table */}
          {step === 2 && (
            <div className="bg-bg-secondary border border-border rounded-lg p-8">
              <h2 className="text-2xl font-serif font-bold text-text-primary mb-6">
                Select Your Table
              </h2>

              {/* Selection Summary */}
              <div className="bg-bg-primary border border-border rounded-md p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-text-muted">Restaurant:</span>
                    <p className="text-text-primary font-medium">
                      {selectedRestaurant?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-muted">Date:</span>
                    <p className="text-text-primary">
                      {format(new Date(formData.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <span className="text-text-muted">Time:</span>
                    <p className="text-text-primary">{formData.timeSlot}</p>
                  </div>
                  <div>
                    <span className="text-text-muted">Guests:</span>
                    <p className="text-text-primary">{formData.guestCount}</p>
                  </div>
                </div>
              </div>

              {/* Available Tables */}
              {isLoadingTables ? (
                <div className="flex justify-center py-12">
                  <Spinner size="md" />
                </div>
              ) : tables.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="mx-auto text-gold mb-4" size={48} />
                  <h3 className="text-xl font-serif font-bold text-text-primary mb-2">
                    No tables available
                  </h3>
                  <p className="text-text-muted mb-4">
                    Try a different time or date.
                  </p>
                  <button
                    onClick={handleBack}
                    className="text-gold hover:text-gold-hover font-medium"
                  >
                    Go back and change selection
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {tables.map((table) => (
                      <button
                        key={table._id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tableId: table._id }))}
                        className={`p-4 border rounded-md text-left transition-all ${
                          formData.tableId === table._id
                            ? 'border-gold bg-gold-light'
                            : 'border-border bg-bg-primary hover:border-gold'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-text-primary">
                            Table {table.tableNumber}
                          </span>
                          {formData.tableId === table._id && (
                            <Check className="text-gold" size={18} />
                          )}
                        </div>
                        <p className="text-sm text-text-muted">
                          {table.capacity} guests
                        </p>
                      </button>
                    ))}
                  </div>
                  {errors.tableId && (
                    <p className="text-sm text-error">{errors.tableId}</p>
                  )}
                </>
              )}

              {/* Special Requests */}
              <div className="mt-6">
                <label className="block text-sm text-text-muted mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any special occasion? Dietary requirements? Seating preferences?"
                  className="w-full bg-bg-primary border border-border rounded-md px-4 py-3 text-text-primary placeholder-text-muted focus:border-gold focus:ring-1 focus:ring-gold-light outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="bg-bg-secondary border border-border rounded-lg p-8">
              <h2 className="text-2xl font-serif font-bold text-text-primary mb-6">
                Confirm Your Reservation
              </h2>

              {/* Summary Card */}
              <div className="bg-bg-primary border border-border rounded-lg p-6 mb-6">
                <h3 className="text-lg font-serif font-bold text-gold mb-4">
                  Reservation Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Restaurant:</span>
                    <span className="text-text-primary font-semibold text-lg">
                      {selectedRestaurant?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Date:</span>
                    <span className="text-text-primary">
                      {format(new Date(formData.date), 'EEEE, MMMM d yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Time:</span>
                    <span className="text-text-primary">{formData.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Guests:</span>
                    <span className="text-text-primary">
                      {formData.guestCount} people
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Table:</span>
                    <span className="text-text-primary">
                      Table {selectedTable?.tableNumber} ({selectedTable?.capacity} seats)
                    </span>
                  </div>
                  {formData.notes && (
                    <div className="pt-4 border-t border-border">
                      <span className="text-text-muted">Notes:</span>
                      <p className="text-text-primary mt-1 italic">{formData.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="bg-gold-light border border-gold rounded-md p-4 mb-6">
                <p className="text-sm text-text-primary">
                  By confirming this reservation, you agree to our Terms of Service.
                  Please arrive on time. Reservations are held for 15 minutes past the booked time.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 text-text-primary hover:text-gold transition-colors"
              >
                <ChevronLeft size={20} />
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-gold text-bg-primary font-semibold rounded-md hover:bg-gold-hover transition-colors"
              >
                Next
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isCreating}
                className="flex items-center gap-2 px-8 py-3 bg-gold text-bg-primary font-semibold rounded-md hover:bg-gold-hover transition-colors disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <Spinner size="sm" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Confirm Reservation
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reservations;