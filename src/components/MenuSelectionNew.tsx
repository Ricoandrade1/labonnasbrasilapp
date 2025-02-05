import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import { MenuSection } from "./menu/MenuSection";
import { OrderSummaryNew } from "./menu/OrderSummaryNew";
import { menuItems } from "../data/menu";
import { MenuItem, TableOrder } from "../types";
import { v4 as uuidv4 } from "uuid";
import { addOrder, getTables } from "../lib/firebase";
import { OrderManagerProvider,  } from "./OrderManager";
import  useOrderManager  from "./OrderManager";
import { useTable } from "@/context/TableContext";

const MenuSelectionNew = () => {
  console.log("MenuSelectionNew component rendered");
  const [searchParams] = useSearchParams();
  const { currentOrders, addItem, removeItem, updateQuantity, clearOrders, getTotalPrice } = useOrderManager();
  const [tables, setTables] = useState<any[]>([]);
  const [responsibleName, setResponsibleName] = useState("");
  const { addOrdersToTable, getTableOrders, updateOrderStatus, clearTable, tables: tableContextTables } = useTable(); // Added clearTable and tables from context
  const [orderHistory, setOrderHistory] = useState<TableOrder[]>([]);

  const handleResponsibleNameChange = (value: string) => {
    console.log("responsibleName changed to:", value);
    setResponsibleName(value);
  };

  const tableParam = searchParams.get("table") || searchParams.get("tablecaixa");

  useEffect(() => {
    const fetchTables = async () => {
      const tablesData = await getTables();
      console.log("MenuSelectionNew - fetchTables - tablesData", tablesData);
      setTables(tablesData);
    };

    const fetchOrderHistory = () => {
      if (tableParam) {
        const tableId = parseInt(tableParam);
        const currentTable = tableContextTables.find(table => table.id === tableId); // Get table from context
        if (currentTable && currentTable.status === "available") {
          setOrderHistory([]); // Clear history if table is available
    } else {
      const currentTable = tableContextTables.find(table => table.id === tableId);
      if (currentTable) {
        const tableOrders = currentTable.orders.map(order => ({
          id: order.id, // Use the order ID from the TableOrder
          tableId: tableParam,
          responsibleName: order.responsibleName, // Get responsibleName from TableOrder
          items: order.items, // Use items from TableOrder
          timestamp: order.timestamp,
          status: order.status,
          total: order.total,
        } as TableOrder));
        setOrderHistory(tableOrders);
      }
    }
  }
};

    fetchTables();
    fetchOrderHistory();
  }, [searchParams, tableContextTables]); // Added tableContextTables to dependency array

  console.log("MenuSelectionNew - useEffect - currentOrders", currentOrders);

  const getItemQuantity = (itemId: string) => {
    const item = currentOrders.find((order) => order.id === itemId);
    return item?.quantity || 0;
  };

  const handleQuantityChange = (item: MenuItem, change: number) => {
    if (change > 0) {
      addItem({...item, quantity: 1});
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
    };
    setOrderHistory(prev => [...prev, tableOrder]);

    addOrdersToTable(parseInt(tableOrder.tableId), [tableOrder]);
    addOrder({
      tableId: tableOrder.tableId,
      products: tableOrder.items.map((item) => item.name),
      total: tableOrder.total,
      paymentMethod: "pending",
      timestamp: tableOrder.timestamp,
      responsibleName: responsibleName,
      status: "ocupado",
      source: tableParam?.includes("tablecaixa") ? "Caixa" : "Mesa",
    });

    // Update table status in firebase
    updateOrderStatus(parseInt(tableOrder.tableId), "", "pending");

    toast.success(`${currentOrders.length} itens enviados para a cozinha`);
    // Reset form
    clearOrders();
    setResponsibleName("");
  };

  return (
    <OrderManagerProvider>
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-8">
              <MenuSection
                title="Rodízios"
                items={menuItems.rodizio}
                getItemQuantity={getItemQuantity}
                onQuantityChange={handleQuantityChange}
              />
              <MenuSection
                title="Diárias"
                items={menuItems.diaria}
                getItemQuantity={getItemQuantity}
                onQuantityChange={handleQuantityChange}
              />
              <MenuSection
                title="Bebidas"
                items={menuItems.bebidas}
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
                orderHistory={orderHistory}
                tableParam={tableParam}
              />
            </div>
          </div>
        </div>
      </div>
    </OrderManagerProvider>
  );
};

export default MenuSelectionNew;
