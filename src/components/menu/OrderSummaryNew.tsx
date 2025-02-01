import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Trash2, User } from "lucide-react"
import { OrderItem, TableOrder } from "../../types"
import React from "react";

interface OrderSummaryProps {
  orderItems: OrderItem[]
  tableResponsible: string
  onTableResponsibleChange: (value: string) => void
  onRemoveItem: (itemId: string) => void
  onSubmit: () => void
  orderHistory: TableOrder[]
}

export const OrderSummaryNew = ({
  orderItems,
  tableResponsible,
  onTableResponsibleChange,
  onRemoveItem,
  onSubmit,
  orderHistory
}: OrderSummaryProps) => {
  console.log("OrderSummaryNew - orderItems", orderItems);
  const getTotalPrice = () => {
    console.log("OrderSummaryNew - getTotalPrice - orderItems", orderItems);
    if (!orderItems || orderItems === null || orderItems === undefined || orderItems.length === 0) {
      return 0;
    }
    const totalPrice = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    console.log("OrderSummaryNew - getTotalPrice - totalPrice", totalPrice);
    return totalPrice;
  }

  return (
    <div className="space-y-4">
      <Card className="sticky top-4 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-semibold">Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Responsável</label>
              <div className="flex items-center gap-2 bg-white rounded-lg border shadow-sm">
                <User className="h-4 w-4 ml-3 text-gray-500" />
                <Input
                  placeholder="Nome do responsável"
                  value={tableResponsible}
                  onChange={(e) => onTableResponsibleChange(e.target.value)}
                  className="border-0 focus-visible:ring-0"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-gray-700">Itens do Pedido</h3>
              <div key={orderItems.length}>
                {orderItems && orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                        className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="flex flex-col">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-gray-500">Qtd: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-green-600">€{getTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            <Button 
              onClick={onSubmit}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-6"
            >
              Enviar para Cozinha
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-semibold">Histórico de Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {orderHistory && orderHistory.map((order) => (
              <div key={order.id} className="space-y-2 border-b pb-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-gray-500">Qtd: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
