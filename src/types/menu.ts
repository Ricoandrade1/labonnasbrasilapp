export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: "rodizio" | "diaria" | "bebida" | "sobremesa";
  image?: string;
  available: boolean;
}

export interface OrderItem extends MenuItem {
  quantity: number;
  modifications?: string[];
  timestamp: string;
}

export interface Order {
  id: string;
  tableId: string;
  serverId: string;
  serverName: string;
  items: OrderItem[];
  status: "active" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  total: number;
  notes?: string;
}
