import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface OrderTotalProps {
  total: number;
}

const OrderTotal: React.FC<OrderTotalProps> = ({ total }) => {
  console.log("OrderTotal - total:", total);
  return (
    <div className="p-4 border rounded-md">
      <h3>Total do Pedido: € {total.toFixed(2)}</h3>
    </div>
  );
};

export default OrderTotal;
