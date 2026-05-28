import { useState } from 'react';
import { format } from 'date-fns';
import { User, Clock, Calendar, X } from 'lucide-react';
import { reservationAPI } from '../../services/api';
import Modal from './Modal';
import toast from 'react-hot-toast';

const ReservationCard = ({ reservation, onCancel }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await reservationAPI.cancel(reservation._id);
      toast.success('Reservation cancelled successfully');
      if (onCancel) onCancel();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel reservation');
    } finally {
      setIsCancelling(false);
      setIsModalOpen(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gold-light text-gold border-gold';
      case 'confirmed':
        return 'bg-success/20 text-success border-success';
      case 'cancelled':
        return 'bg-text-muted/20 text-text-muted border-text-muted';
      default:
        return 'bg-text-muted/20 text-text-muted border-text-muted';
    }
  };

  const formatDate = (date) => {
    return format(new Date(date), 'EEEE, MMMM d yyyy');
  };

  return (
    <>
      <div className="bg-card-bg border border-border rounded-md p-6 hover:border-gold transition-all duration-200 card-hover">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          {/* Main Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-text-primary font-serif">
                {reservation.restaurantId?.name || 'Restaurant'}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyles(
                  reservation.status
                )}`}
              >
                {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-text-muted">
                <Calendar size={16} />
                <span className="text-sm">{formatDate(reservation.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <Clock size={16} />
                <span className="text-sm">{reservation.timeSlot}</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <User size={16} />
                <span className="text-sm">{reservation.guestCount} guests</span>
              </div>
            </div>

            {reservation.notes && (
              <p className="text-sm text-text-muted italic border-l-2 border-gold pl-3">
                "{reservation.notes}"
              </p>
            )}
          </div>

          {/* Cancel Button */}
          {reservation.status === 'pending' && (
            <div className="flex items-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-sm text-error border border-error rounded-md hover:bg-error/10 transition-colors flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cancel Reservation"
      >
        <div className="space-y-4">
          <p className="text-text-muted">
            Are you sure you want to cancel your reservation at{' '}
            <span className="text-text-primary font-medium">
              {reservation.restaurantId?.name}
            </span>
            ?
          </p>
          <p className="text-sm text-text-muted">
            This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-text-muted hover:text-text-primary transition-colors"
            >
              Keep Reservation
            </button>
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="px-6 py-2 bg-error text-white rounded-md hover:bg-error/90 transition-colors disabled:opacity-50"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Reservation'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ReservationCard;