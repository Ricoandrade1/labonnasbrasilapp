export interface MenuItem {
  id: string
  name: string
  price: number
  category: "rodizio" | "diaria" | "bebida"
  description?: string
}

export interface OrderItem extends MenuItem {
  quantity: number
}
