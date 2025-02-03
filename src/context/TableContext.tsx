import React, { createContext, useContext, useState, useEffect } from 'react';
import { TableOrder, OrderItem } from '../types';
import { getTables, updateTableStatus, onTablesChange, clearTables } from '../lib/firebase';

export type TableStatus = "available" | "occupied" | "closing";

interface Table {
  id: string;
  status: TableStatus;
  orders: TableOrder[];
  totalAmount: number;
  occupants?: number;
  timeSeated?: string;
  server?: string;
}

interface TableContextType {
  tables: Table[];
  addOrdersToTable: (tableId: string, orders: TableOrder[]) => void;
  updateOrderStatus: (tableId: string, orderId: string, status: TableOrder['status']) => void;
  clearTable: (tableId: string) => void;
  getTableOrders: (tableId: string) => OrderItem[];
  setAllTablesAvailable: () => void;
  forceUpdateTables: () => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [updateTables, setUpdateTables] = useState(0);

  useEffect(() => {
    const fetchTables = async () => {
      const initialTables = await getTables();
      setTables(initialTables);
    };

    fetchTables();

    const unsubscribe = onTablesChange((snapshot) => {
      setTables(snapshot);
    });

    return () => unsubscribe();
  }, []);


  const calculateTotalAmount = (orders: TableOrder[]) => {
    return orders.reduce((total, order) => total + order.total, 0);
  };

  const addOrdersToTable = async (tableId: string, newOrders: TableOrder[]) => {
    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id === tableId) {
          const updatedOrders = [...table.orders, ...newOrders];
          const newTotalAmount = calculateTotalAmount(updatedOrders);
          updateTableStatus(tableId, "occupied");
          return {
            ...table,
            status: "occupied",
            orders: updatedOrders,
            totalAmount: newTotalAmount
          };
        }
        return table;
      });
    });
  };

  const updateOrderStatus = async (tableId: string, orderId: string, newStatus: TableOrder['status']) => {
    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id === tableId) {
          const updatedOrders = table.orders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          );

          const allCompleted = updatedOrders.every(order => order.status === 'completed');
          const hasOrders = updatedOrders.length > 0;
          const newStatusValue = allCompleted || !hasOrders ? "available" : table.status;
          const newTotalAmount = allCompleted ? 0 : calculateTotalAmount(updatedOrders);

          updateTableStatus(tableId, newStatusValue);

          return {
            ...table,
            status: newStatusValue,
            orders: allCompleted ? [] : updatedOrders,
            totalAmount: newTotalAmount
          };
        }
        return table;
      });
    });
  };

  const clearTable = async (tableId: string) => {
     setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id === tableId) {
          updateTableStatus(tableId, "available");
          return {
            ...table,
            status: "available",
            orders: [],
            totalAmount: 0
          };
        }
        return table;
      });
    });
  };

  const getTableOrders = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    return table?.orders.flatMap(order => order.items) || [];
  };


  const setAllTablesAvailable = async () => {
    setTables(prevTables => {
      return prevTables.map(table => {
        updateTableStatus(table.id, "available");
        return {
          ...table,
          status: "available",
          orders: [],
          totalAmount: 0
        };
      });
    });
    await clearTables();
    setUpdateTables(prev => prev + 1);
  };

  const forceUpdateTables = () => {
    setUpdateTables(prev => prev + 1);
  };

  return (
    <TableContext.Provider value={{
      tables,
      addOrdersToTable,
      updateOrderStatus,
      clearTable,
      getTableOrders,
      setAllTablesAvailable,
      forceUpdateTables
    }}>
      {children}
    </TableContext.Provider>
  );
};

export const useTable = () => {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error('useTable must be used within a TableProvider');
  }
  return context;
};
