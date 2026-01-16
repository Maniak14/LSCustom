import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Paintbrush, Gauge, Sparkles, ArrowUpRight } from 'lucide-react';

const services = [
  {
    icon: Wrench,
    title: 'Réparations',
    description: 'Mécanique et carrosserie. Diagnostic complet et intervention rapide.',
    price: 'À partir de 500$',
  },
  {
    icon: Paintbrush,
    title: 'Peinture',
    description: 'Couleurs classiques, métallisées, nacrées. Finitions sur mesure.',
    price: 'À partir de 800$',
  },
  {
    icon: Gauge,
    title: 'Performance',
    description: 'Moteur, transmission, freins. Optimisation complète de votre véhicule.',
    price: 'À partir de 3 500$',
  },
  {
    icon: Sparkles,
    title: 'Esthétique',
    description: 'Jantes, kits carrosserie, vitres teintées. Style unique garanti.',
    price: 'À partir de 1 000$',
  },
];

const ServicesSection: React.FC = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">
            Services
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance">
            Expertise & Qualité
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Des prestations professionnelles pour tous vos besoins automobiles
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="service-card group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <h3 className="text-xl font-semibold mb-2">
                {service.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link to="/tarifs" className="btn-accent">
            Voir tous les tarifs
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
