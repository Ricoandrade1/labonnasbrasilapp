import React from "react"
import PaymentDialog from "./PaymentDialog"
import { TableOrder, PaymentInfo } from "../types"

const mockOrder: TableOrder = {
  tableId: 1,
  items: [
    { id: "1", name: "Pizza", quantity: 2, price: 25.0 },
    { id: "2", name: "Soda", quantity: 3, price: 5.0 },
  ],
  total: 65.0,
}

const handlePayment = async (order: TableOrder, method: PaymentInfo["method"]) => {
  // Simulate payment processing
  return new Promise((resolve) => setTimeout(resolve, 1000))
}

const PaymentDialogDemo = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Payment Dialog Demo</h1>
      <PaymentDialog order={mockOrder} handlePayment={handlePayment} />
    </div>
  )
}

export default PaymentDialogDemo
