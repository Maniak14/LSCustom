import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Wrench, Paintbrush, Gauge, Car, Sparkles, Shield } from 'lucide-react';

const pricingCategories = [
  {
    icon: Wrench,
    title: 'Réparations',
    color: 'primary',
    services: [
      { name: 'Réparation légère', price: '500$' },
      { name: 'Réparation moyenne', price: '1 500$' },
      { name: 'Réparation majeure', price: '3 000$' },
      { name: 'Carrosserie complète', price: '5 000$' },
    ],
  },
  {
    icon: Paintbrush,
    title: 'Peinture & Finitions',
    color: 'accent',
    services: [
      { name: 'Couleur classique', price: '800$' },
      { name: 'Couleur métallisée', price: '1 500$' },
      { name: 'Peinture nacrée', price: '2 500$' },
      { name: 'Peinture mate', price: '2 000$' },
      { name: 'Vinyles / Stickers', price: 'Sur devis' },
    ],
  },
  {
    icon: Gauge,
    title: 'Performances',
    color: 'primary',
    services: [
      { name: 'Amélioration moteur Niv.1', price: '5 000$' },
      { name: 'Amélioration moteur Niv.2', price: '10 000$' },
      { name: 'Amélioration moteur Niv.3', price: '18 000$' },
      { name: 'Turbo', price: '15 000$' },
      { name: 'Freins sport', price: '3 500$' },
      { name: 'Transmission sport', price: '8 000$' },
    ],
  },
  {
    icon: Car,
    title: 'Esthétique',
    color: 'accent',
    services: [
      { name: 'Jantes standard', price: '1 200$' },
      { name: 'Jantes sport', price: '3 000$' },
      { name: 'Kit carrosserie', price: '8 000$' },
      { name: 'Spoiler / Aileron', price: '2 500$' },
      { name: 'Vitres teintées', price: '1 000$' },
    ],
  },
  {
    icon: Sparkles,
    title: 'Options Premium',
    color: 'primary',
    services: [
      { name: 'Néons', price: '2 000$' },
      { name: 'Klaxon personnalisé', price: '500$' },
      { name: 'Plaque personnalisée', price: '1 500$' },
      { name: 'Intérieur cuir', price: '5 000$' },
    ],
  },
  {
    icon: Shield,
    title: 'Forfaits',
    color: 'accent',
    services: [
      { name: 'Pack Entretien', price: '2 500$' },
      { name: 'Pack Sport', price: '25 000$' },
      { name: 'Pack Luxe Complet', price: '50 000$' },
      { name: 'Révision complète', price: '4 000$' },
    ],
  },
];

const Tarifs: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 animate-fade-in-up">
              Nos <span className="text-gradient-gold">Tarifs</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto animate-fade-in-up-delay-1">
              Prix RP indicatifs - Devis personnalisé disponible en jeu
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingCategories.map((category, index) => (
              <div
                key={category.title}
                className="pricing-card animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    category.color === 'accent' ? 'bg-accent/20' : 'bg-primary/20'
                  }`}>
                    <category.icon className={`w-6 h-6 ${
                      category.color === 'accent' ? 'text-accent' : 'text-primary'
                    }`} />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    {category.title}
                  </h2>
                </div>

                {/* Services List */}
                <ul className="space-y-3">
                  {category.services.map((service) => (
                    <li
                      key={service.name}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-muted-foreground">{service.name}</span>
                      <span className={`font-display font-semibold ${
                        category.color === 'accent' ? 'text-accent' : 'text-primary'
                      }`}>
                        {service.price}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground bg-secondary/50 inline-block px-6 py-3 rounded-lg">
              💡 Les prix peuvent varier selon le véhicule et les options choisies. 
              Contactez-nous en jeu pour un devis précis.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Tarifs;
