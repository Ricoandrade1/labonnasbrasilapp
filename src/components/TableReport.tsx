import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  timestamp: string
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'paid'
}

interface TableReportProps {
  tableId: number
  orders: OrderItem[]
  totalAmount: number
}

export const TableReport = ({ tableId, orders, totalAmount }: TableReportProps) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: OrderItem['status']) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50',
      preparing: 'text-blue-600 bg-blue-50',
      ready: 'text-green-600 bg-green-50',
      delivered: 'text-purple-600 bg-purple-50',
      paid: 'text-gray-600 bg-gray-50'
    }
    return colors[status]
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Mesa {tableId}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Total: €{totalAmount.toFixed(2)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div key={`${order.id}-${index}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1">
                    <div className="font-medium">{order.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Quantidade: {order.quantity} × €{order.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="text-sm text-muted-foreground">
                      {formatTime(order.timestamp)}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-medium text-right">
                  €{(order.quantity * order.price).toFixed(2)}
                </div>
                {index < orders.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
