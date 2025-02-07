import React, { createContext, useContext, useState, useEffect } from 'react'
import { TableOrder, OrderItem } from '../types'
import { useAuth, User } from './AuthContext'; // Importar useAuth e User
import getSupabaseTables from '../lib/getSupabaseTables'
import { clearFirebaseTables, addFirebaseOrder, onFirebaseTablesChange, updateFirebaseTable, updateFirebaseOrder, setFirebaseTableToOccupied, getFirebaseOrdersForTable, addFirebaseTable } from '../lib/api'

export type TableStatus = "available" | "occupied" | "pending" | "closing"

interface Table {
  id: number
  status: TableStatus
  // orders: TableOrder[]  // Removed orders
  // totalAmount: number // Removed totalAmount
  occupants?: number;
  timeSeated?: string;
  server?: string;
  orders: any[]; // Add orders property to Table interface
}

import { OrderStatus } from '../types';

interface TableContextType {
  tables: Table[]
  addOrdersToTable: (tableId: number, orders: TableOrder[], user: User | null, paymentMethod: string, source?: string) => void
  updateOrderStatus: (tableId: number, orderId: string, newStatus: OrderStatus) => void
  clearTable: (tableId: number) => void
  getTableOrders: (tableId: number) => OrderItem[]
  setAllTablesAvailable: () => void
  forceUpdateTables: () => void
  setTables: React.Dispatch<React.SetStateAction<Table[]>>
}

const TableContext = createContext<TableContextType | undefined>(undefined)

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<Table[]>([])

  const auth = useAuth(); // Get auth context
  const calculateTotalAmount = (orders: TableOrder[]) => {
    return orders.reduce((total, order) => total + order.total, 0)
  }

  const addOrdersToTable = async (tableId: number, newOrders: TableOrder[], user: User | null, paymentMethod: string, source?: string) => {
    // 1. Fetch current tables state
    const prevTables = tables; // Access the tables state directly

    // 2. Map over tables and update the specific table
    const updatedTables = prevTables.map(async table => {
      if (table.id === tableId) {
        const updatedOrders = [...table.orders, ...newOrders];

        // Chamar addSupabaseOrder para cada novo pedido
        for (const order of newOrders) {
          const tableOrder = {
            tableId: String(tableId),
            responsibleName: user?.name || 'Unknown User', // Usar nome do usuário logado ou 'Unknown User'
            items: order.items,
            total: parseFloat(order.total.toFixed(2)),
            timestamp: new Date().toISOString(),
            status: 'kitchen-pending', // Definir status como 'kitchen-pending' ao adicionar o pedido
            id: order.id, // Assuming order has an id
          } as TableOrder;
          await addSupabaseOrder(tableOrder, 'web');
        }

        setSupabaseTableToOccupied(tableId);
        return {
          ...table,
          status: "occupied" as TableStatus,
          orders: updatedOrders,
          totalAmount: calculateTotalAmount(updatedOrders)
        };
      }
      return table;
    });

    // 3. Await Promise.all to get resolved tables
    const resolvedTables = await Promise.all(updatedTables);

    // 4. Call setTables with resolvedTables
    setTables(resolvedTables);
  };

  const updateOrderStatus = (tableId: number, orderId: string, newStatus: OrderStatus) => {
    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id === tableId) {
          updateSupabaseOrder(orderId, newStatus);
          // The status of the table should not be directly updated based on the order status
          // The table status should be updated based on business logic, e.g. when all orders are completed, the table becomes available
          return {
            ...table,
            ...prevTables.find(table => table.id === tableId),
            // status: newStatus, // Remove this line
          }
        }
        return table
      })
    })
  }

  const clearTable = (tableId: number) => {
    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            status: "available",
            orders: [],
            totalAmount: 0
          }
        }
        return table
      })
    })
  }

  const getTableOrders = (tableId: number) => {
    const table = tables.find(t => t.id === tableId)
    return table?.orders.flatMap(order => order.items) || []
  }

  const [updateTables, setUpdateTables] = useState(0);

  const setAllTablesAvailable = () => {
    setTables(prevTables => {
      return prevTables.map(table => ({
        ...table,
        status: "available",
        orders: [],
        totalAmount: 0
      }))
    })
    clearSupabaseTables();
  }

  const forceUpdateTables = () => {
    setUpdateTables(prev => prev + 1);
  }

  useEffect(() => {
    const fetchTables = async () => {
      const tablesData = await getSupabaseTables();
      
      // Fetch orders for each table
      const tablesWithOrders = await Promise.all(
        tablesData.map(async (table) => {
          const orders = await getSupabaseOrdersForTable(table.id);
          return {
            ...table,
            orders: orders, // Add orders to the table object
          };
        })
      );
      setTables(tablesWithOrders); // Set tables with orders
    };

    fetchTables();

    return () => {};
  }, []);

  return (
    <TableContext.Provider value={{
      tables,
      addOrdersToTable,
      updateOrderStatus,
      clearTable,
      getTableOrders,
      setAllTablesAvailable,
      forceUpdateTables,
      setTables
    }}>
      {children}
    </TableContext.Provider>
  )
}

export const useTable = () => {
  const context = useContext(TableContext)
  if (context === undefined) {
    throw new Error('useTable must be used within a TableProvider')
  }
  return context;
}
