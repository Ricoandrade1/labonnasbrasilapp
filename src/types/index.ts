export type UserRole = "owner" | "manager" | "cashier" | "waiter"

export interface User {
  id: string
  name: string
  role: UserRole
  email: string
}

export interface PaymentInfo {
  amount: number
  method: "cash" | "credit" | "debit" | "pix"
  status: "pending" | "completed" | "cancelled"
  timestamp: string
  cashierId: string
}

export interface DeletionRequest {
  orderId: string
  requestedBy: string
  reason: string
  status: "pending" | "approved" | "rejected"
  timestamp: string
  respondedBy?: string
  responseTimestamp?: string
}

export interface MenuItem {
  id: string
  name: string
  price: number
  category: "rodizio" | "diaria" | "bebida"
  description?: string
  includes?: string[]
  daysAvailable?: string[]
  reportEnabled?: boolean
  editablePrice?: boolean
}

export interface OrderItem extends MenuItem {
  quantity: number
}

export interface TableOrder {
  id: string
  tableId: string
  responsibleName: string
  items: OrderItem[]
  timestamp: string
  status: "pending" | "completed" | "cancelled"
  payment?: PaymentInfo
  deletionRequest?: DeletionRequest
  total: number
  notes?: string
}
