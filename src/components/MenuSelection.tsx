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
import { addOrder } from "../lib/firebase";
import { OrderManagerProvider, useOrderManager } from "./OrderManager";

const MenuSelection = () => {
  const [searchParams] = useSearchParams();
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [tableSelected, setTableSelected] = useState(false);
  const [responsibleName, setResponsibleName] = useState("");
  const { currentOrders, addItem, removeItem, updateQuantity, clearOrders, getTotalPrice } = useOrderManager();

  useEffect(() => {
    const tableId = searchParams.get("table");
    if (tableId) {
      setTableNumber(Number(tableId));
      setTableSelected(true);
    }
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
  };

  const handleTableNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 50) {
      setTableNumber(value);
    } else {
      toast.error("Digite um número entre 1 e 50");
    }
  };

  const handleTableSelection = () => {
    if (!tableNumber) {
      toast.error("Selecione um número de mesa válido");
      return;
    }
    setTableSelected(true);
  };

  const handleSendToKitchen = async () => {
    if (tableNumber === null) {
      toast.error("Selecione o número da mesa");
      return;
    }

    if (!responsibleName) {
      toast.error("Por favor, insira o nome do responsável");
      return;
    }

    if (currentOrders.length === 0) {
      toast.error("Por favor, selecione pelo menos um item");
      return;
    }

    const tableOrder: TableOrder = {
      id: uuidv4(),
      tableId: tableNumber.toString(),
      responsibleName,
      items: currentOrders,
      timestamp: new Date().toISOString(),
      status: "pending",
      total: getTotalPrice(),
    };

    addOrder({
      tableId: tableOrder.tableId,
      products: tableOrder.items.map((item) => item.name),
      total: tableOrder.total,
      paymentMethod: "pending",
      timestamp: tableOrder.timestamp,
      responsibleName: tableOrder.responsibleName,
      status: "pending",
      source: "web",
    });

    console.log("Dados do pedido para o Firebase:", {
      tableId: tableOrder.tableId,
      products: tableOrder.items.map((item) => item.name),
      total: tableOrder.total,
      paymentMethod: "pending",
      timestamp: tableOrder.timestamp,
      responsibleName: tableOrder.responsibleName,
      status: "pending",
      source: "web",
    });

    console.log("Sending order to kitchen:", tableOrder);

    toast.success(`${currentOrders.length} itens enviados para a cozinha`);

    // Reset form
    clearOrders();
    setResponsibleName("");
    setTableSelected(false);
    setTableNumber(null);
  };

  const mockOrder: TableOrder = {
    id: "1",
    tableId: tableNumber?.toString() || "",
    responsibleName: "John Doe",
    items: [
      { id: "1", name: "Pizza", price: 25.0, quantity: 2, category: "rodizio" },
      { id: "2", name: "Soda", price: 5.0, quantity: 3, category: "bebida" },
    ],
    timestamp: new Date().toISOString(),
    status: "pending",
    total: 65.0,
  };

  return (
    <OrderManagerProvider>
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
        {!tableSelected ? (
          <div className="flex flex-col items-center max-w-md mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              Selecione a Mesa
            </h2>
            <Input
              type="number"
              min={1}
              max={50}
              placeholder="Número da mesa (1-50)"
              value={tableNumber ?? ""}
              onChange={handleTableNumberChange}
              className="mb-4 w-full"
            />
            <Input
              type="text"
              placeholder="Nome do responsável"
              value={responsibleName}
              onChange={(e) => setResponsibleName(e.target.value)}
              className="mb-4 w-full"
            />
            <Button
              onClick={handleTableSelection}
              disabled={!tableNumber || !responsibleName}
              className="bg-[#518426] hover:bg-[#518426]/90 w-full sm:w-auto"
            >
              Selecionar Mesa
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Mesa {tableNumber}
                </h2>
                <p className="text-gray-600">Responsável: {responsibleName}</p>
              </div>
              <Button
                onClick={handleSendToKitchen}
                disabled={currentOrders.length === 0}
                className="bg-[#518426] hover:bg-[#518426]/90"
              >
                Enviar para Cozinha
              </Button>
            </div>

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
                  orderItems={currentOrders}
                  tableResponsible={responsibleName}
                  onTableResponsibleChange={setResponsibleName}
                  onRemoveItem={removeItem}
                  onSubmit={handleSendToKitchen}
                  tableParam={tableNumber?.toString() || null}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </OrderManagerProvider>
  );
};

export default MenuSelection;
