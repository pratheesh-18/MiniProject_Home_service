import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, Clock, Users, Star, Headphones, CreditCard } from 'lucide-react';

const features = [
  {
    icon: Shield,
    key: 'verified',
    title: 'Verified Professionals',
    description: 'All providers are background-checked and skill-verified'
  },
  {
    icon: Clock,
    key: 'fast',
    title: 'Quick Response',
    description: 'Get connected with providers within minutes'
  },
  {
    icon: Users,
    key: 'community',
    title: 'Community Driven',
    description: 'Share bookings with neighbors and save costs'
  },
  {
    icon: Star,
    key: 'quality',
    title: 'Quality Guaranteed',
    description: 'Rated services with 100% satisfaction guarantee'
  },
  {
    icon: Headphones,
    key: 'support',
    title: '24/7 Support',
    description: 'Round the clock customer support for all issues'
  },
  {
    icon: CreditCard,
    key: 'payment',
    title: 'Secure Payments',
    description: 'Multiple payment options with secure transactions'
  }
];

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Why Choose HomeServ?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We make home services simple, reliable, and accessible for everyone
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-accent hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-xl accent-gradient flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* How it works steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <h3 className="text-2xl font-display font-bold text-foreground text-center mb-12">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Choose Service', desc: 'Select the service you need' },
              { step: 2, title: 'Find Provider', desc: 'Browse nearby verified providers' },
              { step: 3, title: 'Book & Track', desc: 'Schedule and track in real-time' },
              { step: 4, title: 'Rate & Review', desc: 'Share your experience' },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-border" />
                )}
                <div className="relative z-10 w-16 h-16 mx-auto rounded-full accent-gradient flex items-center justify-center text-2xl font-bold text-accent-foreground mb-4">
                  {item.step}
                </div>
                <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
