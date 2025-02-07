import React, { useEffect, useState } from 'react';
import { TableOrder, OrderStatus } from '../types';
import { onFirebaseOrdersChange, updateFirebaseOrder } from '../lib/api';
import { RealtimeChannel } from '@supabase/supabase-js';

const KitchenOrders = () => {
  const [kitchenOrders, setKitchenOrders] = useState<TableOrder[]>([]);
  const [subscription, setSubscription] = useState<(() => void) | null>(null);

  useEffect(() => {
    const sub = onFirebaseOrdersChange((payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const order: TableOrder = payload.new as TableOrder;
        if (order.status === 'kitchen-pending') {
          setKitchenOrders((prevOrders) => {
            const exists = prevOrders.find((o) => o.id === order.id);
            if (exists) {
              return prevOrders.map((o) => (o.id === order.id ? order : o));
            } else {
              return [...prevOrders, order];
            }
          });
        } else if (payload.eventType === 'UPDATE' && payload.new.status !== 'kitchen-pending') {
          setKitchenOrders((prevOrders) =>
            prevOrders.filter((o) => o.id !== payload.new.id)
          );
        }
      }
    });
    setSubscription(sub);

    return () => {
      if (subscription) {
        subscription(); // Chamando subscription() diretamente
      }
    };
  }, [subscription]);

  const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateFirebaseOrder(orderId, newStatus);
      // O estado será atualizado automaticamente via subscription
    } catch (error) {
      console.error("Erro ao atualizar status do pedido:", error);
      // TODO: Mostrar mensagem de erro para o usuário
    }
  };

  return (
    <div>
      <h2>Pedidos da Cozinha</h2>
      {kitchenOrders.map((order) => (
        <div key={order.id}>
          <h3>Pedido #{order.id} - Mesa {order.tableId}</h3>
          <p>Responsável: {order.responsibleName}</p>
          <ul>
            {order.items.map((item, index) => (
              <li key={index}>
                {item.quantity} x {item.name}
              </li>
            ))}
          </ul>
          <button onClick={() => handleOrderStatusChange(order.id, 'completed')}>
            Concluir Pedido
          </button>
        </div>
      ))}
    </div>
  );
};

export default KitchenOrders;
