import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { serviceCategories } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';

export function ServiceCategories() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setSelectedService } = useAppStore();

  const handleServiceClick = (serviceId: string) => {
    setSelectedService(serviceId);
    navigate('/search');
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            {t('services.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('services.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {serviceCategories.map((service, index) => (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleServiceClick(service.id)}
              className={`group p-6 rounded-2xl border-2 ${service.borderColor} ${service.bgColor} hover:shadow-lg transition-all duration-300`}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h3 className={`font-semibold ${service.textColor} mb-2`}>
                {t(`services.${service.id}`)}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {t(`services.${service.id}Desc`)}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
