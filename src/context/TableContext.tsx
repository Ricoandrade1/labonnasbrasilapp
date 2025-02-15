import React, { createContext, useContext, useState, useEffect } from 'react';
import { TableOrder, OrderItem } from '../types';
import { useAuth, User } from './AuthContext';
import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "@/lib/firebase";

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'closing' | 'pending';

interface Table {
  id: string | number;
  tableNumber: string;
  status: TableStatus;
  orders: TableOrder[];
  totalAmount: number;
}

import { OrderStatus } from '../types';

interface TableContextType {
  tables: Table[];
  updateOrderStatus: (tableId: string, orderId: string, newStatus: OrderStatus) => void;
  clearTable: (tableId: string) => void;
  getTableOrders: (tableId: string) => OrderItem[];
  setAllTablesAvailable: () => void;
  forceUpdateTables: () => void;
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const auth = useAuth();

  const calculateTotalAmount = (orders: TableOrder[]) => {
    return orders.reduce((total, order) => total + order.total, 0);
  };

  const updateOrderStatus = async (tableId: string, orderId: string, newStatus: OrderStatus) => {
    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id === tableId) {
          // Find the order and update its status
          const updatedOrders = table.orders.map(order => {
            if (order.id === orderId) {
              return { ...order, status: newStatus };
            }
            return order;
          });

          // Update the order status in Firestore
          const orderRef = doc(db, "Pedidos", orderId);
          updateDoc(orderRef, { status: newStatus })
            .then(() => console.log("Document successfully updated!"))
            .catch((error) => console.error("Error updating document: ", error));

          return {
            ...table,
            orders: updatedOrders,
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
      return prevTables.map(table => ({
        ...table,
        status: "available",
        orders: [],
        totalAmount: 0
      }));
    });

    // Clear all tables in Firestore
    const querySnapshot = await getDocs(collection(db, "Mesas"));
    querySnapshot.forEach(async (document) => {
      await deleteDoc(doc(db, "Mesas", document.id));
    });
  };

  const forceUpdateTables = () => {
    // This function is not needed anymore
  };

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Mesas"));
        const tablesData: Table[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            tableNumber: data.tableNumber || '',
            status: data.status || 'available',
            orders: data.orders || [],
            totalAmount: data.totalAmount || 0,
          } as Table;
        });
        setTables(tablesData);
      } catch (error) {
        console.error("Error fetching tables:", error);
      }
    };

    fetchTables();
  }, []);

  return (
    <TableContext.Provider value={{
      tables,
      updateOrderStatus,
      clearTable,
      getTableOrders,
      setAllTablesAvailable,
      forceUpdateTables,
      setTables
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
