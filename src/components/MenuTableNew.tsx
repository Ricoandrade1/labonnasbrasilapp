import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { addFirebaseOrder, getFirebaseMenuItems } from '../lib/api';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import { MenuSection } from "./menu/MenuSection";
import OrderSummaryNew from "./menu/OrderSummaryNew";
import { MenuItem, TableOrder } from "../types";
import { v4 as uuidv4 } from "uuid";
import { OrderManagerProvider } from "./OrderManager";
import useOrderManager from "./OrderManager";
import { useTable } from '../context/TableContext';
import { useAuth } from '../context/AuthContext';
// import { menuItems } from "../data/menu";

const MenuTableNew = () => {
  console.log("MenuTableNew component rendered");
  const location = useLocation();
  const { currentOrders, addItem, removeItem, updateQuantity, clearOrders, getTotalPrice } = useOrderManager();
  const [responsibleName, setResponsibleName] = useState("");
  const { addOrdersToTable, getTableOrders, updateOrderStatus, clearTable, tables: tableContextTables, setTables } = useTable();
  const [orderHistory, setOrderHistory] = useState<TableOrder[]>([]);
  const { user } = useAuth();
  const [menuItemsFromSupabase, setMenuItemsFromSupabase] = useState<MenuItem[]>([]);

  useEffect(() => {
    console.log("MenuTableNew - location.search:", location.search);
    console.log("MenuTableNew - tableContextTables:", tableContextTables);
    console.log("MenuTableNew - currentOrders:", currentOrders);
    const fetchMenuItems = async () => {
      const items = await getFirebaseMenuItems();
      setMenuItemsFromSupabase(items);
    };
    fetchMenuItems();
  }, []);

  const handleResponsibleNameChange = (value: string) => {
    console.log("responsibleName changed to:", value);
    setResponsibleName(value);
  };

  const tableParam = new URLSearchParams(location.search).get("table") || new URLSearchParams(location.search).get("tablecaixa");

  useEffect(() => {
    const fetchOrderHistory = () => {
      console.log("MenuTableNew - fetchOrderHistory - called");
      if (tableParam) {
        const tableId = parseInt(tableParam, 10);
        if (!isNaN(tableId)) {
          const currentTable = tableContextTables.find(table => table.id === tableId);
          if (currentTable && currentTable.orders) {
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
            console.log("MenuTableNew - fetchOrderHistory - tableOrders:", tableOrders);
          } else {
            setOrderHistory([]);
            console.log("MenuTableNew - fetchOrderHistory - orderHistory: []");
          }
        }
      }
    };

    fetchOrderHistory();
  }, [location.search, tableContextTables, currentOrders]);

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
    console.log("handleSendToKitchen - responsibleName:", responsibleName);

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
      responsibleName: responsibleName,
      items: currentOrders,
      timestamp: new Date().toISOString(),
      status: "pending",
      total: getTotalPrice(),
      paymentMethod: 'cash',
      source: 'web',
    };

    setOrderHistory(prev => [...prev, tableOrder]);

    addFirebaseOrder(tableOrder, tableOrder.source);

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
              orderHistory={orderHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuTableNew;
