import React, { createContext, useContext, useState, useEffect } from 'react'
import { TableOrder, OrderItem } from '../types'
import { clearTables, addOrder } from '../lib/firebase';
import { useAuth, AuthContextType, User } from './AuthContext'; // Importar useAuth e User

export type TableStatus = "available" | "occupied" | "closing"

interface Table {
  id: number
  status: TableStatus
  orders: TableOrder[]
  totalAmount: number
  occupants?: number;
  timeSeated?: string;
  server?: string;
}

interface TableContextType {
  tables: Table[]
  addOrdersToTable: (tableId: number, orders: TableOrder[], user: User | null) => void
  updateOrderStatus: (tableId: number, orderId: string, status: TableOrder['status']) => void
  clearTable: (tableId: number) => void
  getTableOrders: (tableId: number) => OrderItem[]
  setAllTablesAvailable: () => void
  forceUpdateTables: () => void
}

const TableContext = createContext<TableContextType | undefined>(undefined)

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tables, setTables] = useState<Table[]>(() => {
    // Initialize tables with localStorage data if available
    const savedTables = localStorage.getItem('tables')
    if (savedTables) {
      return JSON.parse(savedTables)
    }
    return Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      status: "available",
      orders: [],
      totalAmount: 0
    }))
  })

  // Persist tables state to localStorage
  useEffect(() => {
    localStorage.setItem('tables', JSON.stringify(tables))
  }, [tables])

  const auth = useAuth(); // Get auth context
  const calculateTotalAmount = (orders: TableOrder[]) => {
    return orders.reduce((total, order) => total + order.total, 0)
  }

  const addOrdersToTable = (tableId: number, newOrders: TableOrder[], user: User | null) => {

    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id === tableId) {
          const updatedOrders = [...table.orders, ...newOrders];
          
          // Chamar addOrder para cada novo pedido
          newOrders.forEach(async (order) => {
            const products = order.items.map(item => item.id); // Extrair product IDs
            await addOrder({
              tableId: String(tableId), // tableId precisa ser string para addOrder
              products: products,
              total: order.total,
              paymentMethod: 'cash', // ⚠️ Valor padrão - precisa ser investigado
              timestamp: new Date().toISOString(),
              responsibleName: user?.name || 'Unknown User', // Usar nome do usuário logado ou 'Unknown User'
              status: 'pending',
              source: 'web',
            });
          });

          return {
            ...table,
            status: "occupied",
            orders: updatedOrders,
            totalAmount: calculateTotalAmount(updatedOrders)
          };
        }
        return table;
      });
    });
  };

  const updateOrderStatus = (tableId: number, orderId: string, newStatus: TableOrder['status']) => {
    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id === tableId) {
          const updatedOrders = table.orders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
          
          // Check if all orders are completed
          const allCompleted = updatedOrders.every(order => order.status === 'completed')
          
          // Check if there are any orders at all
          const hasOrders = updatedOrders.length > 0;

          return {
            ...table,
            status: allCompleted || !hasOrders ? "available" : table.status,
            orders: allCompleted ? [] : updatedOrders,
            totalAmount: allCompleted ? 0 : calculateTotalAmount(updatedOrders)
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

  const setAllTablesAvailable = async () => {
    setTables(prevTables => {
      return prevTables.map(table => ({
        ...table,
        status: "available",
        orders: [],
        totalAmount: 0
      }))
    })
    await clearTables();
    setUpdateTables(prev => prev + 1);
  }

  const forceUpdateTables = () => {
    setUpdateTables(prev => prev + 1);
  }

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
  )
}

export const useTable = () => {
  const context = useContext(TableContext)
  if (context === undefined) {
    throw new Error('useTable must be used within a TableProvider')
  }
  return context
}
