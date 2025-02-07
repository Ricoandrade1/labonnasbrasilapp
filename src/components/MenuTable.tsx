import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { addSupabaseOrder, getSupabaseMenuItems } from '../lib/api'; // Import getSupabaseMenuItems
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import { MenuSection } from "./menu/MenuSection";
import OrderSummaryNew from "./menu/OrderSummaryNew";
import { MenuItem, TableOrder } from "../types";
import { v4 as uuidv4 } from "uuid";
import { OrderManagerProvider } from "./OrderManager";
import useOrderManager from "./OrderManager";
import { useTable } from '../context/TableContext'; // Corrected import path
import { useAuth } from '../context/AuthContext'; // Corrected import path
// import { menuItems } from "../data/menu"; // Remove menuItems import

const MenuTable = () => {
  console.log("MenuTableNew component rendered");
  const [searchParams] = useSearchParams();
  const { currentOrders, addItem, removeItem, updateQuantity, clearOrders, getTotalPrice } = useOrderManager();
  const [responsibleName, setResponsibleName] = useState("");
  const { addOrdersToTable, getTableOrders, updateOrderStatus, clearTable, tables: tableContextTables, setTables } = useTable(); // Added clearTable and tables from context
  const [orderHistory, setOrderHistory] = useState<TableOrder[]>([]);
  const { user } = useAuth(); // Get auth context and user
  const [menuItemsFromSupabase, setMenuItemsFromSupabase] = useState<MenuItem[]>([]); // State for menu items from Supabase

  useEffect(() => { // useEffect to fetch menu items from Supabase
    const fetchMenuItems = async () => {
      const items = await getSupabaseMenuItems();
      setMenuItemsFromSupabase(items);
    };
    fetchMenuItems();
  }, []); // Empty dependency array to run only on mount

  const handleResponsibleNameChange = (value: string) => {
    console.log("responsibleName changed to:", value);
    setResponsibleName(value);
  };

  const tableParam = searchParams.get("table") || searchParams.get("tablecaixa");

  useEffect(() => {
    const fetchOrderHistory = () => {
      if (tableParam) {
        const tableId = parseInt(tableParam, 10);
        if (!isNaN(tableId)) {
          const currentTable = tableContextTables.find(table => table.id === tableId);
          if (currentTable && currentTable.orders) { // Check if currentTable and currentTable.orders exist
            const tableOrders = currentTable.orders.map(order => ({
              id: order.id,
              tableId: tableParam,
              responsibleName: order.responsibleName,
              items: order.items,
              timestamp: order.timestamp,
              status: order.status,
              total: order.total,
            } as TableOrder));
            setOrderHistory(tableOrders);
          } else {
            setOrderHistory([]); // Set orderHistory to empty array if no orders found
          }
        }
      }
    };

    fetchOrderHistory();
  }, [searchParams, tableContextTables, currentOrders]); // Added currentOrders to dependency array

  console.log("MenuTableNew - useEffect - currentOrders", currentOrders);

  const getItemQuantity = (itemId: string) => {
    const item = currentOrders.find((order) => order.id === itemId);
    return item?.quantity || 0;
  };

  const handleQuantityChange = (item: MenuItem, change: number) => {
    if (change > 0) {
      const orderItem = {
        ...item,
        quantity: 1
      };
      addItem(orderItem);
    } else if (change < 0) {
      const existingItem = currentOrders.find(i => i.id === item.id);
      if (existingItem && existingItem.quantity > 1) {
        updateQuantity(item.id, existingItem.quantity - 1);
      } else {
        removeItem(item.id);
      }
    }
  };

  const handleSendToKitchen = async () => {
    console.log("handleSendToKitchen - responsibleName:", responsibleName); // 1. Log responsibleName at the beginning

    if (currentOrders.length === 0) {
      toast.error("Por favor, selecione pelo menos um item");
      return;
    }

    if (!responsibleName) {
      toast.error("Por favor, inclua o nome do responsável");
      return;
    }

    const tableOrder: TableOrder = {
      id: uuidv4(),
      tableId: tableParam || "1",
      responsibleName: responsibleName, // Responsible name should be here
      items: currentOrders,
      timestamp: new Date().toISOString(),
      status: "pending",
      total: getTotalPrice(),
      paymentMethod: 'cash',
      source: 'web',
    };

    console.log("tableOrder object:", tableOrder); // Log tableOrder object

    setOrderHistory(prev => [...prev, tableOrder]);

    addSupabaseOrder(tableOrder, tableOrder.source);

    // set table status to occupied
    setTables(prevTables => {
      const tableId = parseInt(tableOrder.tableId);
      return prevTables.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            status: "occupied",
          };
        }
        return table;
      });
    });

    toast.success(`${currentOrders.length} itens enviados para a cozinha`);
    // Reset form
    clearOrders();
    setResponsibleName("");
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <MenuSection
              title="Rodízios"
              items={menuItemsFromSupabase.filter(item => item.category === 'Rodízios')}
              getItemQuantity={getItemQuantity}
              onQuantityChange={handleQuantityChange}
            />
            <MenuSection
              title="Diárias"
              items={menuItemsFromSupabase.filter(item => item.category === 'Diárias')}
              getItemQuantity={getItemQuantity}
              onQuantityChange={handleQuantityChange}
            />
            <MenuSection
              title="Bebidas"
              items={menuItemsFromSupabase.filter(item => item.category === 'Bebidas')}
              getItemQuantity={getItemQuantity}
              onQuantityChange={handleQuantityChange}
            />
          </div>
          <div className="lg:col-span-1">
            <OrderSummaryNew
              key={currentOrders.length}
              orderItems={currentOrders}
              tableResponsible={responsibleName}
              onTableResponsibleChange={handleResponsibleNameChange}
              onRemoveItem={removeItem}
              onSubmit={handleSendToKitchen}
              tableParam={tableParam}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuTable;
