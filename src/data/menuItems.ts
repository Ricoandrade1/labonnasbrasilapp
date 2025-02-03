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
  {
    id: "d1",
    name: "Diária 8€",
    description: "Buffet sem churrasco - 1 bebida - sobremesa e café",
    price: 8,
    category: "diaria",
    image: "/images/diario8.jpg",
    available: true
  },
  {
    id: "d2",
    name: "Diária 9€",
    description: "Buffet sem churrasco - 1 corte de maminha e chouriço - 1 bebida - sobremesa e café",
    price: 9,
    category: "diaria",
    image: "/images/diario9.jpg",
    available: true
  },
  {
    id: "d3",
    name: "Diária 10€",
    description: "Buffet sem churrasco - 1 corte de maminha e chouriço - 1 bebida - sobremesa e café",
    price: 10,
    category: "diaria",
    image: "/images/diario10.jpg",
    available: true
  },
  {
    id: "b1",
    name: "Água Mineral",
    description: "",
    price: 1.5,
    category: "bebida",
    image: "/images/agua.jpg",
    available: true
  },
  {
    id: "b2",
    name: "Refrigerante",
    description: "",
    price: 2,
    category: "bebida",
    image: "/images/refrigerante.jpg",
    available: true
  },
  {
    id: "b3",
    name: "Suco Natural",
    description: "",
    price: 2.5,
    category: "bebida",
    image: "/images/suco.jpg",
    available: true
  }
];

export const categories = [
  { id: "rodizio", name: "Rodízio", icon: "🥩" },
  { id: "diaria", name: "Pratos do Dia", icon: "🍽️" },
  { id: "bebida", name: "Bebidas", icon: "🥤" },
  { id: "sobremesa", name: "Sobremesas", icon: "🍰" }
];
