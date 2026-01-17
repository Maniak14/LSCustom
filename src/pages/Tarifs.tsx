import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Wrench, Paintbrush, Gauge, Car, Sparkles, Building2 } from 'lucide-react';

const pricingCategories = [
  {
    icon: Building2,
    title: 'Au garage',
    services: [
      { name: 'Réparation complète', price: '600$' },
      { name: 'Réparation moteur', price: '350$' },
      { name: 'Pneus', price: '150$ par pneu (Indisponible)' },
    ],
  },
  {
    icon: Wrench,
    title: 'Dépannage',
    services: [
      { name: 'Réparation complète', price: '700$' },
      { name: 'Réparation moteur', price: '450$' },
      { name: 'Pneus', price: '250$ par pneu (Indisponible)' },
    ],
  },
  // {
  //   icon: Paintbrush,
  //   title: 'Peinture',
  //   services: [
  //     { name: 'Couleur classique', price: 'Selon véhicule' },
  //     { name: 'Métallisée', price: 'Selon véhicule' },
  //     { name: 'Nacrée', price: 'Selon véhicule' },
  //     { name: 'Mate', price: 'Selon véhicule' },
  //     { name: 'Vinyles', price: 'Selon véhicule' },
  //   ],
  // },
  // {
  //   icon: Gauge,
  //   title: 'Performance',
  //   services: [
  //     { name: 'Moteur Niv.1', price: 'Selon véhicule' },
  //     { name: 'Moteur Niv.2', price: 'Selon véhicule' },
  //     { name: 'Moteur Niv.3', price: 'Selon véhicule' },
  //     { name: 'Turbo', price: 'Selon véhicule' },
  //     { name: 'Freins sport', price: 'Selon véhicule' },
  //     { name: 'Transmission', price: 'Selon véhicule' },
  //   ],
  // },
  // {
  //   icon: Car,
  //   title: 'Esthétique',
  //   services: [
  //     { name: 'Jantes standard', price: 'Selon véhicule' },
  //     { name: 'Jantes sport', price: 'Selon véhicule' },
  //     { name: 'Kit carrosserie', price: 'Selon véhicule' },
  //     { name: 'Spoiler', price: 'Selon véhicule' },
  //     { name: 'Vitres teintées', price: 'Selon véhicule' },
  //   ],
  // },
  // {
  //   icon: Sparkles,
  //   title: 'Options',
  //   services: [
  //     { name: 'Néons', price: 'Selon véhicule' },
  //     { name: 'Klaxon custom', price: 'Selon véhicule' },
  //     { name: 'Intérieur cuir', price: 'Selon véhicule' },
  //   ],
  // },
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {pricingCategories.map((category, index) => (
              <div
                key={category.title}
                className="pricing-card"
              >
                
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
              <span>Le prix des customisations varie selon le véhicule.</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tarifs;