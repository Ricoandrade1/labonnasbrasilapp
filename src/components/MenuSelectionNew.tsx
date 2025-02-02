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
  const [searchParams] = useSearchParams();
  const { currentOrders, addItem, removeItem, updateQuantity, clearOrders, getTotalPrice } = useOrderManager();
  const [tables, setTables] = useState<any[]>([]);
  const [_, setUpdate] = useState(0);
  const [responsibleName, setResponsibleName] = useState("");
  const { addOrdersToTable, getTableOrders, updateOrderStatus } = useTable();
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
        const orders = getTableOrders(parseInt(tableParam));
        console.log("MenuSelectionNew - fetchOrderHistory - orders", orders);
        const tableOrders = orders.map(order => ({
          id: uuidv4(),
          tableId: tableParam,
          responsibleName: "",
          items: [order],
          timestamp: new Date().toISOString(),
          status: "completed",
          total: order.price * order.quantity,
        } as TableOrder));
        setOrderHistory(tableOrders);
      }
    };

    fetchTables();
    fetchOrderHistory();
  }, [searchParams]);

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
    window.location.reload();
  };

  const handleSendToKitchen = async () => {
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
    };

    addOrdersToTable(parseInt(tableOrder.tableId), [tableOrder]);

    addOrder({
      tableId: tableOrder.tableId,
      products: tableOrder.items.map((item) => item.name),
      total: tableOrder.total,
      paymentMethod: "pending",
      timestamp: tableOrder.timestamp,
      responsibleName: tableOrder.responsibleName,
      status: "ocupado",
      source: tableParam?.includes("tablecaixa") ? "Caixa" : "Mesa",
    });

    // Update table status in firebase
    updateOrderStatus(parseInt(tableOrder.tableId), "", "pending");

    console.log("Sending order to kitchen:", tableOrder);

    toast.success(`${currentOrders.length} itens enviados para a cozinha`);

    window.location.href = window.location.href;
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
                key={`${currentOrders.length}-${orderHistory.length}`}
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
