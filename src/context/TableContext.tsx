import React, { createContext, useContext, useState, useEffect } from 'react'
import { TableOrder, OrderItem } from '../types'
import { useAuth, User } from './AuthContext'; // Importar useAuth e User
import getSupabaseTables from "@/lib/getSupabaseTables";
import { clearSupabaseTables, addSupabaseOrder, onSupabaseTablesChange, updateSupabaseTable, updateSupabaseOrder, setSupabaseTableToOccupied } from "@/lib/api";

export type TableStatus = "available" | "occupied" | "pending" | "closing"

interface Table {
  id: number
  status: TableStatus
  orders: TableOrder[]
  totalAmount: number
  occupants?: number;
  timeSeated?: string;
  server?: string;
}

import { OrderStatus } from '../types';

interface TableContextType {
  tables: Table[]
  addOrdersToTable: (tableId: number, orders: TableOrder[], user: User | null, paymentMethod: string) => void
  updateOrderStatus: (tableId: number, orderId: string, newStatus: OrderStatus) => void
  clearTable: (tableId: number) => void
  getTableOrders: (tableId: number) => OrderItem[]
  setAllTablesAvailable: () => void
  forceUpdateTables: () => void
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
}

const TableContext = createContext<TableContextType | undefined>(undefined)

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<Table[]>([])

  const auth = useAuth(); // Get auth context
  const calculateTotalAmount = (orders: TableOrder[]) => {
    return orders.reduce((total, order) => total + order.total, 0)
  }

  const addOrdersToTable = async (tableId: number, newOrders: TableOrder[], user: User | null, paymentMethod: string) => {
    setTables(prevTables => {
      const updatedTables = prevTables.map(async table => {
        if (table.id === tableId) {
          const updatedOrders = [...table.orders, ...newOrders];

          // Chamar addSupabaseOrder para cada novo pedido
          for (const order of newOrders) {
            for (const item of order.items) {
              const products = order.items.map(item => item.id); // Extrair product IDs
              await addSupabaseOrder(item, {
                tableId: String(tableId), // tableId precisa ser string para addOrder
                products: JSON.stringify(products),
                total: parseFloat(order.total.toFixed(2)),
                paymentMethod: paymentMethod,
                timestamp: new Date().toISOString(),
                responsibleName: user?.name || 'Unknown User', // Usar nome do usuário logado ou 'Unknown User'
                status: 'pending',
                source: 'web',
              });
            }
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
      Promise.all(updatedTables).then(resolvedTables => {
        setTables(resolvedTables);
      });
    });
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
      setTables(tablesData);
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
  return context
}
