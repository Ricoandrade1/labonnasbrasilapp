import { MenuItem } from "../types"

// Simulating an API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// In-memory storage
let menuItems: MenuItem[] = [
  { 
    id: "1", 
    name: "Rodízio de Maminha", 
    price: 14, 
    category: "rodizio",
    description: "Todos os dias - Buffet livre - maminha chourriço e frango - sobremesa livre"
  },
  { 
    id: "2", 
    name: "Rodízio de Picanha", 
    price: 19, 
    category: "rodizio",
    description: "Buffet livre - picanha - maminha chourriço e frango - sobremesa livre"
  },
  { 
    id: "3", 
    name: "Especial Picanha", 
    price: 26, 
    category: "rodizio",
    description: "Buffet livre - picanha - maminha chourriço e frango - sobremesa livre - bebida incluída"
  },
  { 
    id: "4", 
    name: "Diária", 
    price: 8, 
    category: "diaria",
    description: "Seg a Sex - buffet sem churrasco - 1 bebida - sobremesa e café"
  },
  { 
    id: "5", 
    name: "Diária", 
    price: 9, 
    category: "diaria",
    description: "Seg a Sex - buffet sem churrasco - 1 corte de maminha e chouriço - 1 bebida sobremesa e café"
  },
  { 
    id: "6", 
    name: "Diária", 
    price: 10, 
    category: "diaria",
    description: "Seg a Sex - buffet sem churrasco - 1 corte de maminha e chouriço - 1 bebida sobremesa e café"
  }
]

let bebidas: MenuItem[] = [
  { id: "b1", name: "Coca-Cola", price: 3, category: "bebida" },
  { id: "b2", name: "Água Mineral", price: 2, category: "bebida" },
  { id: "b3", name: "Cerveja", price: 4, category: "bebida" },
  { id: "b4", name: "Suco Natural", price: 3.5, category: "bebida" },
  { id: "b5", name: "Vinho Tinto", price: 15, category: "bebida" },
  { id: "b6", name: "Refrigerante", price: 3, category: "bebida" }
]

export const api = {
  getMenuItems: async () => {
    await delay(500) // Simulate network delay
    return [...menuItems]
  },

  getBebidas: async () => {
    await delay(500)
    return [...bebidas]
  },

  updateMenuItem: async (id: string, updates: Partial<MenuItem>) => {
    await delay(300)
    menuItems = menuItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    )
    return menuItems.find(item => item.id === id)
  },

  updateBebida: async (id: string, updates: Partial<MenuItem>) => {
    await delay(300)
    bebidas = bebidas.map(item => 
      item.id === id ? { ...item, ...updates } : item
    )
    return bebidas.find(item => item.id === id)
  }
}
