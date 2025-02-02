import { MenuItem } from "@/types/menu";

export const menuItems: MenuItem[] = [
  {
    id: "r1",
    name: "Rodízio de Maminha",
    description: "Corte especial de maminha grelhada no ponto",
    price: 14,
    category: "rodizio",
    image: "/images/maminha.jpg",
    available: true
  },
  {
    id: "r2",
    name: "Rodízio de Picanha",
    description: "Picanha premium grelhada",
    price: 19,
    category: "rodizio",
    image: "/images/picanha.jpg",
    available: true
  },
  {
    id: "r3",
    name: "Especial Picanha",
    description: "Picanha especial grelhada",
    price: 15,
    category: "rodizio",
    image: "/images/picanha-especial.jpg", // Placeholder image path
    available: true
  },
  // Add more menu items...
];

export const categories = [
  { id: "rodizio", name: "Rodízio", icon: "🥩" },
  { id: "diaria", name: "Pratos do Dia", icon: "🍽️" },
  { id: "bebida", name: "Bebidas", icon: "🥤" },
  { id: "sobremesa", name: "Sobremesas", icon: "🍰" }
];
