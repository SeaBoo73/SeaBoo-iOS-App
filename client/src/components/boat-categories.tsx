import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import jetskiImage from "@assets/WhatsApp Image 2025-06-15 at 23.38.19_1752875703213.jpeg";
import gommoneImage from "@assets/gommone senza patente_1752875806367.webp";
import barcheSenzaPatenteImage from "@assets/OIP (1)_1752921317486.webp";
import catamaranoImage from "@assets/catamarano ludovica_1752876117442.jpg";
import charterImage from "@assets/WhatsApp Image 2025-06-12 at 20.22.10_1752876155096.jpeg";
import sailboatImage from "@assets/barca a vela ludovica_1752876195081.jpg";
import houseboatImage from "@assets/OIP_1752919948843.webp";
import guletImage from "@assets/gulet-romance-3-cabin-luxury-gulet-for-charter-3-1024x683_1752919948842.jpg";
import kayakImage from "@assets/caiacco_1753599016775.jpg";
import motorboatImage from "@assets/R (1)_1752920495156.jpg";
// import yachtImage from "@assets/WhatsApp Image 2025-06-15 at 23.37.00 (1)_1752875876213.jpeg";

const categories = [
  {
    id: "gommone",
    name: "Gommoni",
    description: "Imbarcazioni pneumatiche versatili e sicure",
    image: gommoneImage,
    count: 45
  },
  {
    id: "barche-senza-patente",
    name: "Barche senza patente",
    description: "Facili da guidare, perfette per principianti",
    image: barcheSenzaPatenteImage,
    count: 34
  },
  {
    id: "jetski",
    name: "Moto d'acqua",
    description: "Adrenalina e velocità sull'acqua",
    image: jetskiImage,
    count: 28
  },
  {
    id: "motorboat",
    name: "Barche a motore",
    description: "Velocità e comfort per esplorare la costa",
    image: motorboatImage,
    count: 38
  },
  {
    id: "sailboat",
    name: "Barche a vela",
    description: "L'esperienza autentica della navigazione",
    image: sailboatImage,
    count: 32
  },
  {
    id: "catamarano",
    name: "Catamarani",
    description: "Spazio e stabilità per gruppi numerosi",
    image: catamaranoImage,
    count: 15
  },
  {
    id: "charter",
    name: "Charter",
    description: "Esperienza completa con skipper professionista",
    image: charterImage,
    count: 12
  },
  {
    id: "houseboat",
    name: "Houseboat",
    description: "La tua casa galleggiante per vacanze uniche",
    image: houseboatImage,
    count: 8
  },
  {
    id: "gulet",
    name: "Gulet",
    description: "Eleganza tradizionale per crociere di lusso",
    image: guletImage,
    count: 6
  },
  {
    id: "yacht",
    name: "Yacht",
    description: "Lusso e comfort per esperienze indimenticabili",
    image: "/attached_assets/WhatsApp Image 2025-06-15 at 23.37.00 (1)_1752875876213.jpeg",
    count: 18
  },
  {
    id: "kayak",
    name: "Caiacco",
    description: "Tradizione e autenticità per esplorare coste e calette",
    image: kayakImage,
    count: 22
  }
];

interface BoatCategoriesProps {
  onCategorySelect?: (category: string) => void;
  selectedCategory?: string;
}

export function BoatCategories({ onCategorySelect, selectedCategory }: BoatCategoriesProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Esplora per categoria</h2>
          <p className="text-lg text-gray-600">Trova l'imbarcazione perfetta per la tua avventura</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className={`overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                selectedCategory === category.id ? "ring-2 ring-ocean-blue shadow-lg" : ""
              }`}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => onCategorySelect?.(category.id)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-300" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                  <span className="text-sm font-medium text-gray-900">{category.count}</span>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                
                <Button
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className={`w-full transition-all duration-300 ${
                    hoveredCategory === category.id || selectedCategory === category.id
                      ? "bg-ocean-blue hover:bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {selectedCategory === category.id ? "Selezionata" : "Esplora"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedCategory && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => onCategorySelect?.("")}
              className="border-ocean-blue text-ocean-blue hover:bg-ocean-blue hover:text-white"
            >
              Mostra tutte le categorie
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}