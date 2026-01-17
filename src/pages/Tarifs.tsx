import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Wrench, Paintbrush, Gauge, Car, Sparkles, Shield } from 'lucide-react';

const pricingCategories = [
  {
    icon: Wrench,
    title: 'Réparations',
    services: [
      { name: 'Réparation légère', price: '500$' },
      { name: 'Réparation moyenne', price: '1 500$' },
      { name: 'Réparation majeure', price: '3 000$' },
      { name: 'Carrosserie complète', price: '5 000$' },
    ],
  },
  {
    icon: Paintbrush,
    title: 'Peinture',
    services: [
      { name: 'Couleur classique', price: '800$' },
      { name: 'Métallisée', price: '1 500$' },
      { name: 'Nacrée', price: '2 500$' },
      { name: 'Mate', price: '2 000$' },
      { name: 'Vinyles', price: 'Devis' },
    ],
  },
  {
    icon: Gauge,
    title: 'Performance',
    featured: true,
    services: [
      { name: 'Moteur Niv.1', price: '5 000$' },
      { name: 'Moteur Niv.2', price: '10 000$' },
      { name: 'Moteur Niv.3', price: '18 000$' },
      { name: 'Turbo', price: '15 000$' },
      { name: 'Freins sport', price: '3 500$' },
      { name: 'Transmission', price: '8 000$' },
    ],
  },
  {
    icon: Car,
    title: 'Esthétique',
    services: [
      { name: 'Jantes standard', price: '1 200$' },
      { name: 'Jantes sport', price: '3 000$' },
      { name: 'Kit carrosserie', price: '8 000$' },
      { name: 'Spoiler', price: '2 500$' },
      { name: 'Vitres teintées', price: '1 000$' },
    ],
  },
  {
    icon: Sparkles,
    title: 'Options',
    services: [
      { name: 'Néons', price: '2 000$' },
      { name: 'Klaxon custom', price: '500$' },
      { name: 'Plaque perso', price: '1 500$' },
      { name: 'Intérieur cuir', price: '5 000$' },
    ],
  },
  {
    icon: Shield,
    title: 'Forfaits',
    featured: true,
    services: [
      { name: 'Pack Entretien', price: '2 500$' },
      { name: 'Pack Sport', price: '25 000$' },
      { name: 'Pack Luxe', price: '50 000$' },
      { name: 'Révision', price: '4 000$' },
    ],
  },
];

const Tarifs: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4 animate-fade-up">
              Tarifs
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight animate-fade-up-1">
              Nos services
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto animate-fade-up-2">
              Prix principaux · Devis personnalisé au garage
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingCategories.map((category, index) => (
              <div
                key={category.title}
                className={`pricing-card ${category.featured ? 'ring-2 ring-primary/20' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {category.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      Populaire
                    </span>
                  </div>
                )}
                
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <category.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">
                    {category.title}
                  </h2>
                </div>

                {/* Services List */}
                <ul className="space-y-3">
                  {category.services.map((service) => (
                    <li
                      key={service.name}
                      className="flex justify-between items-center py-2 border-b border-border/50 last:border-0"
                    >
                      <span className="text-sm text-muted-foreground">{service.name}</span>
                      <span className="text-sm font-medium text-foreground">
                        {service.price}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-muted text-sm text-muted-foreground">
              <span>💡</span>
              <span>Les prix varient selon le véhicule.</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tarifs;