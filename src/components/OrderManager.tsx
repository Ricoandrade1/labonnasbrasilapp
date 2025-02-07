import React, { useState, useEffect, createContext, useContext } from 'react';
import { OrderItem } from '../types';
import { useToast } from '../hooks/use-toast';
import { toast } from 'react-toastify';
import supabase from '../lib/supabaseClient';

interface OrderManagerContextProps {
  currentOrders: OrderItem[];
  addItem: (item: OrderItem) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearOrders: () => Promise<void>;
  getTotalPrice: () => number;
}

const OrderManagerContext = createContext<OrderManagerContextProps | undefined>(undefined);

export const OrderManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }): React.ReactElement => {
  const [currentOrders, setCurrentOrders] = useState<OrderItem[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*');

        if (error) {
          throw error;
        }

        const parsedData = data ? data.map(item => {
          return {
            id: item.id,
            name: item.name,
            price: Number(item.price),
            category: item.category,
            description: item.description,
            includes: item.includes,
            daysAvailable: item.daysAvailable,
            reportEnabled: item.reportEnabled === true,
            editablePrice: item.editablePrice === true,
            quantity: Number(item.quantity)
          };
        }) : [];

        setCurrentOrders(parsedData || []);
      } catch (error: any) {
        toast.error(`Failed to fetch orders: ${error.message}`);
      }
    };

    fetchOrders();
  }, []);

const addItem = async (item: OrderItem) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([item]);

    if (error) {
      throw error;
    }

    setCurrentOrders(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: existingItem.quantity + 1 } : i).slice();
      } else {
        return prev.concat({ ...item, quantity: 1 });
      }
    });
    toast.success(`${item.name} added to order`);
  } catch (error: any) {
    toast.error(`Failed to add item: ${error.message}`);
  }
};

  const removeItem = async (itemId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .delete()
        .match({ id: itemId });

      if (error) {
        throw error;
      }

      setCurrentOrders(prev => {
        const updatedOrders = [...prev.filter(item => item.id !== itemId)];
        toast.error(`Item removed from order`);
        return updatedOrders;
      });
    } catch (error: any) {
      toast.error(`Failed to remove item: ${error.message}`);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ quantity })
        .match({ id: itemId });

      if (error) {
        throw error;
      }

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
    } catch (error: any) {
      toast.error(`Failed to update quantity: ${error.message}`);
    }
  };

  const clearOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .delete()
        .neq('id', null);

      if (error) {
        throw error;
      }

      setCurrentOrders([]);
    } catch (error: any) {
      toast.error(`Failed to clear orders: ${error.message}`);
    }
  };

const getTotalPrice = () => {
  return currentOrders.reduce((total, item) => total + (Number(item.price) * Number(item.quantity)), 0);
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
