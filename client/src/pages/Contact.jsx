import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const Contact = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post('/contact', data);
      toast.success('Message sent! We\'ll be in touch soon.');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      label: 'Address',
      value: '123 Luxury Avenue, Fine City',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+1 (234) 567-890',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'reservations@dineway.com',
    },
    {
      icon: Clock,
      label: 'Hours',
      value: 'Open Daily: 11AM - 11PM',
    },
  ];

  const subjectOptions = [
    { value: '', label: 'Select a subject' },
    { value: 'General Inquiry', label: 'General Inquiry' },
    { value: 'Reservation Help', label: 'Reservation Help' },
    { value: 'Partnership', label: 'Partnership' },
    { value: 'Feedback', label: 'Feedback' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Page Header */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gold mb-4">
            Get In Touch
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Have a question or want to work together? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-12 px-4 bg-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-gold mb-8">
                Contact Information
              </h2>
              
              <div className="space-y-6 mb-12">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gold-light rounded-full flex items-center justify-center flex-shrink-0">
                      <item.icon className="text-gold" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-text-muted mb-1">{item.label}</p>
                      <p className="text-text-primary">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-lg font-serif font-bold text-text-primary mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-4">
                  {[
                    { icon: Instagram, label: 'Instagram' },
                    { icon: Facebook, label: 'Facebook' },
                    { icon: Twitter, label: 'Twitter/X' },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href="#"
                      className="w-12 h-12 bg-bg-primary border border-border rounded-full flex items-center justify-center text-text-muted hover:text-gold hover:border-gold transition-colors"
                      aria-label={social.label}
                    >
                      <social.icon size={20} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-serif font-bold text-gold mb-8">
                Send Us a Message
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm text-text-muted mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full bg-bg-primary border border-border rounded-md px-4 py-3 text-text-primary placeholder-text-muted focus:border-gold focus:ring-1 focus:ring-gold-light outline-none transition-colors"
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-error">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-text-muted mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: 'Please provide a valid email',
                      },
                    })}
                    className="w-full bg-bg-primary border border-border rounded-md px-4 py-3 text-text-primary placeholder-text-muted focus:border-gold focus:ring-1 focus:ring-gold-light outline-none transition-colors"
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-error">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-text-muted mb-2">
                    Subject *
                  </label>
                  <select
                    {...register('subject', { required: 'Please select a subject' })}
                    className="w-full bg-bg-primary border border-border rounded-md px-4 py-3 text-text-primary focus:border-gold focus:ring-1 focus:ring-gold-light outline-none transition-colors appearance-none"
                  >
                    {subjectOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-sm text-error">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-text-muted mb-2">
                    Message *
                  </label>
                  <textarea
                    {...register('message', {
                      required: 'Message is required',
                      minLength: {
                        value: 10,
                        message: 'Message must be at least 10 characters',
                      },
                    })}
                    rows={6}
                    className="w-full bg-bg-primary border border-border rounded-md px-4 py-3 text-text-primary placeholder-text-muted focus:border-gold focus:ring-1 focus:ring-gold-light outline-none transition-colors resize-none"
                    placeholder="How can we help you?"
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-error">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gold text-bg-primary font-semibold rounded-md hover:bg-gold-hover transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      Send Message
                      <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="py-12 px-4 bg-bg-primary">
        <div className="max-w-7xl mx-auto">
          <div className="bg-bg-secondary border border-border rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="mx-auto text-gold mb-4" size={48} />
              <p className="text-text-muted">Map coming soon</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;