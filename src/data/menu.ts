import { MenuItem } from "../types"

export const menuItems: Record<string, MenuItem[]> = {
  rodizio: [
    {
      id: "rodizio-maminha",
      name: "Rodízio de Maminha",
      price: 14,
      category: "rodizio" as const,
      description: "Buffet livre - maminha, chourriço e frango - sobremesa livre",
      includes: ["Buffet livre", "Maminha", "Chourriço", "Frango", "Sobremesa livre"],
      reportEnabled: true,
      editablePrice: true
    },
    {
      id: "rodizio-picanha",
      name: "Rodízio de Picanha",
      price: 19,
      category: "rodizio" as const,
      description: "Buffet livre - picanha, maminha, chourriço e frango - sobremesa livre",
      includes: ["Buffet livre", "Picanha", "Maminha", "Chourriço", "Frango", "Sobremesa livre"],
      reportEnabled: true,
      editablePrice: true
    },
    {
      id: "especial-picanha",
      name: "Especial Picanha",
      price: 24,
      category: "rodizio" as const,
      description: "Buffet livre - picanha, maminha, chourriço e frango - sobremesa livre - bebida incluída",
      includes: ["Buffet livre", "Picanha", "Maminha", "Chourriço", "Frango", "Sobremesa livre", "Bebida incluída"],
      reportEnabled: true,
      editablePrice: true
    }
  ],
  diaria: [
    {
      id: "diaria-8",
      name: "Diária 8€",
      price: 8,
      category: "diaria" as const,
      description: "Buffet sem churrasco - 1 bebida - sobremesa e café",
      includes: ["Buffet sem churrasco", "1 Bebida", "Sobremesa", "Café"],
      daysAvailable: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
      reportEnabled: true,
      editablePrice: true
    },
    {
      id: "diaria-9",
      name: "Diária 9€",
      price: 9,
      category: "diaria" as const,
      description: "Buffet sem churrasco - 1 corte de maminha e chourriço - 1 bebida - sobremesa e café",
      includes: ["Buffet sem churrasco", "1 Corte de maminha", "Chourriço", "1 Bebida", "Sobremesa", "Café"],
      daysAvailable: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
      reportEnabled: true,
      editablePrice: true
    },
    {
      id: "diaria-10",
      name: "Diária 10€",
      price: 10,
      category: "diaria" as const,
      description: "Buffet sem churrasco - 1 corte de maminha e chourriço - 1 bebida - sobremesa e café",
      includes: ["Buffet sem churrasco", "1 Corte de maminha", "Chourriço", "1 Bebida", "Sobremesa", "Café"],
      daysAvailable: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
      reportEnabled: true,
      editablePrice: true
    }
  ],
  bebidas: [
    {
      id: "agua-mineral",
      name: "Água Mineral",
      price: 1.5,
      category: "bebida" as const,
      reportEnabled: true,
      editablePrice: true
    },
    {
      id: "refrigerante",
      name: "Refrigerante",
      price: 2,
      category: "bebida" as const,
      reportEnabled: true,
      editablePrice: true
    },
    {
      id: "suco-natural",
      name: "Suco Natural",
      price: 2.5,
      category: "bebida" as const,
      reportEnabled: true,
      editablePrice: true
    }
  ]
}
