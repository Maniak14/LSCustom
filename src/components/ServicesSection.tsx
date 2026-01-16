import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Paintbrush, Gauge, Car, Phone } from 'lucide-react';

const services = [
  {
    icon: Wrench,
    title: 'Réparations',
    description: 'Mécanique générale, carrosserie et dépannage rapide.',
  },
  {
    icon: Paintbrush,
    title: 'Peinture & Custom',
    description: 'Couleurs sur mesure, vinyls et finitions premium.',
  },
  {
    icon: Gauge,
    title: 'Performances',
    description: 'Moteur, freins, suspensions et turbo.',
  },
  {
    icon: Car,
    title: 'Tuning Esthétique',
    description: 'Kits carrosserie, jantes et éclairage.',
  },
];

const ServicesSection: React.FC = () => {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Nos <span className="text-gradient-blue">Services</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Une gamme complète de prestations pour votre véhicule
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="service-card group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                <service.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2 text-foreground">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/tarifs"
            className="btn-gold px-8 py-4 rounded-lg text-center"
          >
            Voir les Tarifs
          </Link>
          <a
            href="#contact"
            className="btn-blue px-8 py-4 rounded-lg text-center flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Nous Contacter
          </a>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
