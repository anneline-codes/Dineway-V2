import { useState, useEffect, useRef } from 'react';
import { Award, Heart, Users, Sparkles, ChevronRight } from 'lucide-react';
import TornEdge from '../components/ui/TornEdge';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    { value: '500+', label: 'Partner Restaurants' },
    { value: '50K+', label: 'Happy Guests' },
    { value: '12', label: 'Cities' },
    { value: '5', label: 'Years of Excellence' },
  ];

  const values = [
    {
      icon: Award,
      title: 'Quality First',
      description: 'Only the finest culinary experiences',
    },
    {
      icon: Heart,
      title: 'True Hospitality',
      description: 'Every guest is family',
    },
    {
      icon: Sparkles,
      title: 'Constant Innovation',
      description: 'Always raising the bar',
    },
  ];

  const team = [
    { name: 'Sarah Mitchell', role: 'Founder & CEO', initials: 'SM' },
    { name: 'James Chen', role: 'Head of Operations', initials: 'JC' },
    { name: 'Maria Santos', role: 'Culinary Director', initials: 'MS' },
    { name: 'David Park', role: 'Technology Lead', initials: 'DP' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center bg-bg-primary">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1920&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-black/70" />
        </div>
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-gold mb-6">
            Crafting Unforgettable<br />Dining Experiences
          </h1>
          <p className="text-xl text-text-primary max-w-2xl mx-auto">
            At Dineway, we believe every meal is an opportunity to create lasting memories.
            We connect passionate diners with exceptional restaurants.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-4 bg-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-serif font-bold text-gold mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-text-muted leading-relaxed">
                <p>
                  Founded in 2021, Dineway was born from a simple idea: make exceptional dining
                  accessible to everyone. We saw too many incredible restaurants struggling to
                  reach their audience, and too many diners missing out on extraordinary experiences.
                </p>
                <p>
                  Today, we partner with over 500 restaurants across 12 cities, helping them
                  manage reservations, showcase their menus, and connect with food lovers who
                  appreciate quality and ambiance.
                </p>
                <p>
                  Our platform isn't just about booking tables – it's about creating moments
                  that matter. Whether it's a romantic dinner, a business lunch, or a family
                  celebration, we're here to make every occasion special.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
                alt="Restaurant ambiance"
                className="w-full h-96 object-cover rounded-lg"
              />
              <div className="absolute -bottom-6 -right-6 bg-gold text-bg-primary p-6 rounded-lg hidden md:block">
                <p className="text-3xl font-serif font-bold">500+</p>
                <p className="text-sm">Partner Restaurants</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        ref={statsRef}
        className="py-20 px-4 bg-bg-primary"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center"
              >
                <p className={`text-5xl md:text-6xl font-serif font-bold text-gold mb-2 transition-all duration-1000 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                  {stat.value}
                </p>
                <p className="text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TornEdge color="var(--bg-secondary)" />

      {/* Our Values Section */}
      <section className="py-20 px-4 bg-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-gold mb-4">
              Our Values
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-bg-primary border border-border rounded-lg p-8 text-center hover:border-gold transition-all duration-300 group"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gold-light rounded-full flex items-center justify-center group-hover:bg-gold transition-colors">
                  <value.icon className="text-gold group-hover:text-bg-primary" size={28} />
                </div>
                <h3 className="text-xl font-serif font-bold text-text-primary mb-3">
                  {value.title}
                </h3>
                <p className="text-text-muted">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-bg-primary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-gold mb-4">
              The People Behind Dineway
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Meet the team dedicated to revolutionizing your dining experience
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gold flex items-center justify-center">
                  <span className="text-2xl font-bold text-bg-primary">
                    {member.initials}
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold text-text-primary mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-text-muted">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-bg-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-serif font-bold text-gold mb-8">
            Our Mission
          </h2>
          <div className="space-y-6 text-lg text-text-muted leading-relaxed">
            <p>
              We're on a mission to transform the way people discover and experience restaurants.
              By bridging the gap between exceptional culinary establishments and discerning diners,
              we create opportunities for memorable moments.
            </p>
            <p>
              Every feature we build, every restaurant we onboard, and every reservation we facilitate
              is guided by our commitment to quality, convenience, and creating genuine connections
              between people and great food.
            </p>
          </div>
          <div className="mt-12">
            <a
              href="/overview"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-bg-primary font-semibold rounded-md hover:bg-gold-hover transition-all transform hover:scale-105"
            >
              Explore Our Restaurants
              <ChevronRight size={20} />
            </a>
          </div>
        </div>
      </section>

      <TornEdge color="var(--bg-primary)" flip />
    </div>
  );
};

export default About;