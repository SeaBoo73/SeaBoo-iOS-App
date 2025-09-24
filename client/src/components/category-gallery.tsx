import { Link } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Boat } from "@shared/schema";
import gommoneImage from "@assets/gommone senza patente_1752875806367.webp";
import jetskiImage from "@assets/WhatsApp Image 2025-06-15 at 23.38.19_1752875703213.jpeg";
import barcheSenzaPatenteImage from "@assets/OIP (1)_1752921317486.webp";
import catamaranoImage from "@assets/catamarano ludovica_1752876117442.jpg";
import charterImage from "@assets/WhatsApp Image 2025-06-12 at 20.22.10_1752876155096.jpeg";
import sailboatImage from "@assets/barca a vela ludovica_1752876195081.jpg";
import houseboatImage from "@assets/OIP_1752919948843.webp";
import motorboatImage from "@assets/R (1)_1752920495156.jpg";

const categoryMapping = [
  {
    id: "gommone",
    name: "Gommoni",
    description: "Imbarcazioni pneumatiche versatili e sicure",
    image: gommoneImage,
  },
  {
    id: "barche-senza-patente",
    name: "Barche senza patente",
    description: "Facili da guidare, perfette per principianti",
    image: barcheSenzaPatenteImage,
  },
  {
    id: "yacht",
    name: "Yacht",
    description: "Lusso e comfort per una navigazione esclusiva",
    image: motorboatImage,
  },
  {
    id: "sailboat",
    name: "Barche a vela",
    description: "L'esperienza autentica della navigazione",
    image: sailboatImage,
  },
  // Categorie senza corrispondenza nel DB - mantenute per completezza UI
  {
    id: "jetski",
    name: "Moto d'acqua", 
    description: "Adrenalina e velocità sull'acqua",
    image: jetskiImage,
  },
  {
    id: "catamarano",
    name: "Catamarani",
    description: "Spazio e stabilità per gruppi numerosi",
    image: catamaranoImage,
  },
  {
    id: "charter",
    name: "Charter",
    description: "Esperienza completa con skipper professionista",
    image: charterImage,
  },
  {
    id: "houseboat",
    name: "Houseboat",
    description: "La tua casa galleggiante per vacanze uniche",
    image: houseboatImage,
  },
  {
    id: "motorboat",
    name: "Barche a motore",
    description: "Velocità e comfort per esplorare la costa", 
    image: motorboatImage,
  },
];

// Versione mobile con tutte le categorie - nomi compatti per mobile
const mobileCategoryMapping = categoryMapping.map(cat => ({
  ...cat,
  name: cat.id === "barche-senza-patente" ? "Senza patente" : 
        cat.id === "motorboat" ? "Barche motore" :
        cat.id === "houseboat" ? "Casa galleggiante" :
        cat.id === "jetski" ? "Moto d'acqua" :
        cat.name,
  description: cat.id === "gommone" ? "Imbarcazioni versatili" :
               cat.id === "barche-senza-patente" ? "Facili da guidare" :
               cat.id === "yacht" ? "Lusso e comfort" :
               cat.id === "sailboat" ? "Navigazione autentica" :
               cat.id === "jetski" ? "Adrenalina in acqua" :
               cat.id === "catamarano" ? "Spazio e stabilità" :
               cat.id === "charter" ? "Con skipper" :
               cat.id === "houseboat" ? "Casa galleggiante" :
               cat.id === "motorboat" ? "Velocità e comfort" :
               cat.description
}));

// Charter giornalieri semplici
const charterGiornalieri = [
  {
    id: "charter-costa",
    name: "Charter Costa",
    description: "Esplora la costa con skipper",
    price: "€180/giorno",
    image: charterImage,
  },
  {
    id: "charter-isole",
    name: "Tour delle Isole", 
    description: "Gita alle isole vicine",
    price: "€240/giorno",
    image: catamaranoImage,
  }
];

export function CategoryGallery() {
  const { data, isLoading } = useQuery<{ boats: Boat[] }>({
    queryKey: ["/api/boats"],
  });
  
  const boats = data?.boats || [];



  // Calcola i contatori reali per ogni categoria
  const getCategoryCount = (categoryId: string) => {
    return boats.filter(boat => boat.type === categoryId).length;
  };

  // Crea le categorie con i contatori dinamici
  const categories = categoryMapping.map(cat => ({
    ...cat,
    count: getCategoryCount(cat.id)
  })); // Mostra tutte le categorie, anche quelle senza barche

  return (
    <>
      {/* Versione Desktop - Layout Completo */}
      <section className="py-16 bg-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Esplora per categoria</h2>
            <p className="text-lg text-gray-600">Trova l'imbarcazione perfetta per la tua avventura</p>
            <div className="mt-6">
              <Button asChild size="lg" className="bg-gradient-to-r from-ocean-blue to-deep-navy">
                <Link href="/categories">
                  Vedi Tutte le Categorie
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl aspect-square mb-3">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity"></div>
                  

                </div>
                
                <h3 className="font-semibold text-gray-900 group-hover:text-ocean-blue transition-colors mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300"
                  asChild
                >
                  <Link href={`/search?boatTypes=${category.id}`}>
                    Esplora
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Versione Mobile - Layout Semplificato */}
      <section className="py-8 bg-white md:hidden">
        <div className="px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Prenota la tua barca</h2>
            <p className="text-gray-600">Scegli tra le nostre imbarcazioni</p>
          </div>

          {/* Tipi di Imbarcazione Mobile - Tutte le 9 categorie */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {mobileCategoryMapping.map((category) => (
              <Link key={category.id} href={`/search?boatTypes=${category.id}`}>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <div className="relative h-24">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  </div>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-900 text-xs leading-tight">{category.name}</h3>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{category.description}</p>
                    <Button 
                      size="sm" 
                      className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-xs py-1"
                    >
                      Prenota
                    </Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Charter Giornalieri Mobile */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Charter Giornalieri</h3>
            <div className="space-y-4">
              {charterGiornalieri.map((charter) => (
                <Link key={charter.id} href="/search?boatTypes=charter">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4 flex items-center space-x-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <img
                        src={charter.image}
                        alt={charter.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{charter.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{charter.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-bold text-blue-500">{charter.price}</span>
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-xs px-3">
                          Prenota
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
