import React, { useState, useEffect, createContext, useContext } from 'react';
import { OrderItem } from '../types';
import { useToast } from '../hooks/use-toast';
import { toast } from 'react-toastify';

interface OrderManagerContextProps {
  currentOrders: OrderItem[];
  addItem: (item: OrderItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearOrders: () => void;
  getTotalPrice: () => number;
}

const OrderManagerContext = createContext<OrderManagerContextProps | undefined>(undefined);

export const OrderManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }): React.ReactElement => {
  const [currentOrders, setCurrentOrders] = useState<OrderItem[]>(() => {
    const storedOrders = localStorage.getItem('currentOrders');
    return storedOrders ? JSON.parse(storedOrders) : [];
  });

  useEffect(() => {
    localStorage.setItem('currentOrders', JSON.stringify(currentOrders));
  }, [currentOrders]);

  const addItem = (item: OrderItem) => {
    setCurrentOrders(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: existingItem.quantity + 1 } : i).slice();
      }
      return prev.concat({ ...item, quantity: 1 });
    });
    toast.success(`${item.name} added to order`);
  };

  const removeItem = (itemId: string) => {
    setCurrentOrders(prev => {
      const updatedOrders = [...prev.filter(item => item.id !== itemId)];
      toast.error(`Item removed from order`);
      return updatedOrders;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCurrentOrders(prev => {
      const updatedOrders = prev.map(item => {
          if (item.id === itemId) {
              return { ...item, quantity };
          }
          return item;
      });
      toast.success(`Item quantity updated`);
      return updatedOrders;
    });
  };

  const clearOrders = () => {
    setCurrentOrders([]);
  };

  const getTotalPrice = () => {
    return currentOrders.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const contextValue: OrderManagerContextProps = {
    currentOrders,
    addItem,
    removeItem,
    updateQuantity,
    clearOrders,
    getTotalPrice,
  };

  return (
    <OrderManagerContext.Provider value={contextValue}>
      {children}
    </OrderManagerContext.Provider>
  );
};

export const useOrderManager = () => {
  const context = useContext(OrderManagerContext);
  if (!context) {
    throw new Error('useOrderManager must be used within a OrderManagerProvider');
  }
  return context;
};

export default useOrderManager;
