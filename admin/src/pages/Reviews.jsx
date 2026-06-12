import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reviews/restaurant-mine')
      .then(({ data }) => setReviews(data.data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-400 p-4">Loading reviews...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#E5E0D5] mb-6">Reviews</h1>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r._id} className="bg-[#1A1A1A] rounded-2xl p-5 border border-[#222]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#E5E0D5] font-medium">{r.clientId?.name || 'Anonymous'}</span>
              <span className="text-gold">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">{r.text}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              r.status === 'approved' ? 'bg-green-500/20 text-green-400' :
              r.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {r.status}
            </span>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-gray-400">No reviews yet.</p>}
      </div>
    </div>
  );
}
