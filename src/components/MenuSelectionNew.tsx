import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import { MenuSection } from "./menu/MenuSection";
import OrderSummaryNew from "./menu/OrderSummaryNew";
import { menuItems } from "../data/menu";
import { MenuItem, TableOrder } from "../types";
import { v4 as uuidv4 } from "uuid";
import { OrderManagerProvider } from "./OrderManager";
import useOrderManager from "./OrderManager";
import { useTable } from '../context/TableContext'; // Corrected import path
import { useAuth } from '../context/AuthContext'; // Corrected import path
import { addOrderToFirebase, updateTableStatusInFirebase, getFirebaseOrderHistory, closeTableAndRegisterPayment } from "@/lib/api";
import OrderHistory from "./menu/OrderHistory";

const MenuSelectionNew = () => {
  console.log("MenuSelectionNew component rendered");
  const [searchParams] = useSearchParams();
  const { currentOrders, addItem, removeItem, updateQuantity, clearOrders, getTotalPrice } = useOrderManager();
  const [responsibleName, setResponsibleName] = useState("");
  const { getTableOrders, updateOrderStatus, clearTable, tables: tableContextTables, setTables } = useTable(); // Added clearTable and tables from context
  const [orderHistory, setOrderHistory] = useState<TableOrder[]>([]);
  const { user } = useAuth(); // Get auth context and user

  const handleCloseTable = async () => {
    const tableId = tableParam || "1";
    const totalAmount = getTotalPrice();
    await closeTableAndRegisterPayment(tableId, totalAmount);
  };

  const handleResponsibleNameChange = (value: string) => {
    console.log("responsibleName changed to:", value);
    setResponsibleName(value);
  };

  const tableParam = searchParams.get("table") || searchParams.get("tablecaixa");

  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (tableParam) {
        const tableId = tableParam;
        const orderHistory = await getFirebaseOrderHistory(tableId);
        setOrderHistory(orderHistory);
      }
    };

    fetchOrderHistory();
  }, [searchParams]);

  console.log("MenuSelectionNew - useEffect - currentOrders", currentOrders);

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

    const productIds = currentOrders.map(item => item.id);

    const tableId = tableParam || "1";
    if (!/^\d+$/.test(tableId)) {
      toast.error("ID da mesa inválido. Por favor, use um número inteiro.");
      return;
    }

    const tableOrder: TableOrder = {
      id: uuidv4(),
      tableId: tableId,
      responsibleName: responsibleName, // Responsible name should be here
      items: currentOrders,
      timestamp: new Date().toISOString(),
      status: "pending",
      total: getTotalPrice(),
    };

    const tableOrderWithProducts: any = {
      ...tableOrder,
      products: JSON.stringify(productIds),
    };

    setOrderHistory(prev => [...prev, tableOrderWithProducts]);

    const orderId = await addOrderToFirebase(tableOrder.tableId, tableOrderWithProducts, user, 'cash');

    if (orderId) {
      console.log("MenuSelectionNew - handleSendToKitchen - Order added to Firebase with ID:", orderId);
    } else {
      console.error("MenuSelectionNew - handleSendToKitchen - Error adding order to Firebase");
    }

    // Update table status in firebase
    updateTableStatusInFirebase(tableOrder.tableId, "occupied");

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
              tableParam={tableParam}
            />
            <OrderHistory orders={orderHistory} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuSelectionNew;
