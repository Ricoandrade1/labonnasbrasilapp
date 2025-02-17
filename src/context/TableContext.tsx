import React, { createContext, useContext, useState, useEffect } from 'react';
import { TableOrder, OrderItem } from '../types';
import { useAuth, User } from './AuthContext';
import { db, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getFirestoreInstance } from "@/lib/firebase";
import { getFirestore, query, where, onSnapshot } from "firebase/firestore";

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'closing' | 'pending';

interface Table {
  id: string | number;
  tableNumber: string;
  status: TableStatus;
  orders: TableOrder[];
  totalAmount: number;
  occupants?: number;
  timeSeated?: string;
  server?: string;
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
  initialCashValue: number | null;
  setInitialCashValue: (value: number | null) => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [initialCashValue, setInitialCashValue] = useState<number | null>(null);
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

    // Atualiza o status de todos os pedidos relacionados à mesa para "completed"
    const dbInstance = getFirestore();
    const tablesCollection = collection(dbInstance, "Pedidos");
    const occupiedTablesQuery = query(tablesCollection, where("tableId", "==", tableId));
    const querySnapshot = await getDocs(occupiedTablesQuery);
    for (const document of querySnapshot.docs) {
      try {
        await updateDoc(doc(db, "Pedidos", document.id), { status: "completed" });
      } catch (error) {
        console.error("Error updating order status:", error);
      }
    }

    // Remove all orders related to the table from Firebase
    const occupiedTablesQuery2 = query(collection(db, "Pedidos"), where("tableId", "==", tableId));
    const querySnapshot2 = await getDocs(occupiedTablesQuery2);
    for (const document of querySnapshot2.docs) {
      try {
        const orderRef = doc(db, "Pedidos", document.id);
        await deleteDoc(orderRef);
      } catch (error) {
        console.error(`Error deleting order ${document.id}:`, error);
      }
    }

    // Update table status to "available" in Firebase
    try {
      await updateDoc(doc(db, "Mesas", tableId), { status: "available" });
      console.log(`Table ${tableId} status updated to available`);
    } catch (error) {
      console.error("Error updating table status:", error);
    }
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
      const fetchTables = () => {
        try {
          const unsubscribe = onSnapshot(collection(db, "Mesas"), (querySnapshot) => {
            const tablesData: Table[] = querySnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                tableNumber: data.tableNumber || '',
                status: data.status || 'available', // Get status from 'Mesas'
                orders: data.orders || [],
                totalAmount: data.totalAmount || 0,
              } as Table;
            });

            setTables(tablesData);
          });

          return () => {
            unsubscribe();
          };
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
      setTables,
      initialCashValue,
      setInitialCashValue,
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
