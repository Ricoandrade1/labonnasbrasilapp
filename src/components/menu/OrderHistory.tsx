import React from 'react';
import { TableOrder } from '../../types';

interface OrderHistoryProps {
  orders: TableOrder[];
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders }) => {
  return (
    <Card className="mt-4 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader className="border-b">
        <CardTitle className="text-xl font-semibold">Histórico de Pedidos</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {orders.length > 0 ? (
          <ul>
            {orders.map((order) => (
              <li key={order.id}>
                Responsável: {order.responsibleName}
                <ul>
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.name} - {item.quantity} x {item.price}
                    </li>
                  ))}
                </ul>
                Total: {order.total}
              </li>
            ))}
            <li>
              <strong>Total Geral: {orders.reduce((acc, order) => acc + order.total, 0)}</strong>
            </li>
          </ul>
        ) : (
          <p>Nenhum pedido no histórico.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderHistory;
