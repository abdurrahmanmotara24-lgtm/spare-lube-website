export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  sizes: string[];
  image: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  image?: string;
}

// Brand logos
import shellLogo from "@/assets/brands/shell.png";
import castrolLogo from "@/assets/brands/castrol.jpeg";
import blixemLogo from "@/assets/brands/blixem.png";
import engenLogo from "@/assets/brands/engen.jpeg";
import fuchsLogo from "@/assets/brands/fuchs.png";
import motolubeLogo from "@/assets/brands/motolube.jpg";
import winnersLogo from "@/assets/brands/winners.jpg";
import valvolineLogo from "@/assets/brands/valvoline.png";
import g4Logo from "@/assets/brands/g4.png";
import bmwLogo from "@/assets/brands/bmw.jpeg";
import plexusLogo from "@/assets/brands/plexus.png";

export const brands: Brand[] = [
  { id: "shell", name: "Shell", logo: "🐚", image: shellLogo },
  { id: "castrol", name: "Castrol", logo: "🛢️", image: castrolLogo },
  { id: "engen", name: "Engen", logo: "⛽", image: engenLogo },
  { id: "fuchs", name: "Fuchs", logo: "🔶", image: fuchsLogo },
  { id: "valvoline", name: "Valvoline", logo: "⚙️", image: valvolineLogo },
  { id: "motolube", name: "MOTOLUBE", logo: "🔧", image: motolubeLogo },
  { id: "winners", name: "Winners", logo: "🏆", image: winnersLogo },
  { id: "blixem", name: "Blixem", logo: "⚡", image: blixemLogo },
  { id: "g4", name: "G4 Lubricants", logo: "🏭", image: g4Logo },
  { id: "bmw", name: "BMW", logo: "🚗", image: bmwLogo },
  { id: "plexus", name: "Plexus", logo: "❄️", image: plexusLogo },
];

export const categories = [
  "Engine Oils",
  "Antifreeze",
  "Brake Fluid",
  "Additives",
  "Transmission & Gear Oils",
  "Grease",
  "Hand Cleaners",
  "Degreasers",
  "Fine Gel",
  "Dishwashing Liquid",
];

// All products cleared — ready for admin uploads
export const products: Product[] = [];
