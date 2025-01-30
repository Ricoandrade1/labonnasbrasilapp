import React, { createContext, useContext, useState, useEffect } from 'react'

import { TableOrder, OrderItem } from '../types'

type TableStatus = "available" | "occupied" | "closing"

interface Table {
  id: number
  status: TableStatus
  orders: TableOrder[]
  totalAmount: number
}

interface TableContextType {
  tables: Table[]
  addOrdersToTable: (tableId: number, orders: TableOrder[]) => void
  updateOrderStatus: (tableId: number, orderId: string, status: TableOrder['status']) => void
  clearTable: (tableId: number) => void
  getTableOrders: (tableId: number) => OrderItem[]
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

  const calculateTotalAmount = (orders: TableOrder[]) => {
    return orders.reduce((total, order) => total + order.total, 0)
  }

  const addOrdersToTable = (tableId: number, newOrders: TableOrder[]) => {
    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id === tableId) {
          const updatedOrders = [...table.orders, ...newOrders]
          return {
            ...table,
            status: "occupied",
            orders: updatedOrders,
            totalAmount: calculateTotalAmount(updatedOrders)
          }
        }
        return table
      })
    })
  }

  const updateOrderStatus = (tableId: number, orderId: string, newStatus: TableOrder['status']) => {
    setTables(prevTables => {
      return prevTables.map(table => {
        if (table.id === tableId) {
          const updatedOrders = table.orders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          )
          
          // Check if all orders are completed
          const allCompleted = updatedOrders.every(order => order.status === 'completed')
          
          return {
            ...table,
            status: allCompleted ? "available" : table.status,
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

  return (
    <TableContext.Provider value={{
      tables,
      addOrdersToTable,
      updateOrderStatus,
      clearTable,
      getTableOrders
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
