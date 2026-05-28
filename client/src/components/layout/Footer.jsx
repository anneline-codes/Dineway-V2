import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { newsletterAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsSubscribing(true);
    try {
      await newsletterAPI.subscribe(email);
      toast.success('Successfully subscribed to our newsletter!');
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to subscribe');
    } finally {
      setIsSubscribing(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-secondary border-t border-border">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <svg
                className="w-8 h-8 text-gold"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 18h16" />
                <path d="M4 14h16l-2-8H6z" />
                <path d="M12 6V4" />
                <circle cx="12" cy="3" r="1" fill="currentColor" />
              </svg>
              <span className="text-xl font-serif font-bold text-gold tracking-wide">
                DINEWAY
              </span>
            </Link>
            <p className="text-sm text-text-muted">
              Elevating your dining experience with seamless reservations and
              exceptional restaurant discoveries.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="p-2 bg-bg-tertiary rounded-full text-text-muted hover:text-gold hover:bg-gold-light transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="p-2 bg-bg-tertiary rounded-full text-text-muted hover:text-gold hover:bg-gold-light transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="p-2 bg-bg-tertiary rounded-full text-text-muted hover:text-gold hover:bg-gold-light transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-serif font-semibold text-text-primary mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-text-muted hover:text-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/overview" className="text-text-muted hover:text-gold transition-colors">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-text-muted hover:text-gold transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="text-text-muted hover:text-gold transition-colors">
                  Reservations
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-text-muted hover:text-gold transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-serif font-semibold text-text-primary mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-gold flex-shrink-0 mt-0.5" />
                <span className="text-text-muted">KN 4 Ave, Kigali, Rwanda</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-gold flex-shrink-0" />
                <a href="tel:+250788000000" className="text-text-muted hover:text-gold transition-colors">
                  +250 788 000 000
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-gold flex-shrink-0" />
                <a href="mailto:info@dineway.rw" className="text-text-muted hover:text-gold transition-colors">
                  info@dineway.rw
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-serif font-semibold text-text-primary mb-4">
              Stay Connected
            </h4>
            <p className="text-sm text-text-muted mb-4">
              Subscribe to our newsletter for the latest updates and exclusive offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-bg-tertiary border border-border rounded-md text-text-primary placeholder-text-muted focus:border-gold focus:ring-1 focus:ring-gold-light outline-none"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="w-full py-2 px-4 bg-gold text-bg-primary font-medium rounded-md hover:bg-gold-hover transition-colors disabled:opacity-50"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-text-muted">
              © {currentYear} Dineway. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-sm text-text-muted hover:text-gold transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-text-muted hover:text-gold transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;