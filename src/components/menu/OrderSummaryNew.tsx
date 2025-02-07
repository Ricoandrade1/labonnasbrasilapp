import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Trash2, User } from "lucide-react";
import { MenuItem, OrderItem, TableOrder } from "../../types";
import React, { useState, useEffect } from "react";
import { menuItems } from "../../data/menu";
import { useTable } from "@/context/TableContext";
import { useSearchParams } from "react-router-dom";
import supabase from "@/lib/supabaseClient";

interface OrderSummaryProps {
  orderItems: OrderItem[];
  tableResponsible: string;
  onTableResponsibleChange: (value: string) => void;
  onRemoveItem: (itemId: string) => void;
  onSubmit: () => void;
  tableParam: string | null;
}

const OrderSummaryNew = ({
  orderItems,
  tableResponsible,
  onTableResponsibleChange,
  onRemoveItem,
  onSubmit,
  tableParam
}: OrderSummaryProps) => {
  console.log("OrderSummaryNew component rendered");
  const [responsibleNames, setResponsibleNames] = useState<string[]>([]);
  const [orderHistory, setOrderHistory] = useState<TableOrder[]>([]);
  const { tables: tableContextTables } = useTable();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setResponsibleNames(tableResponsible ? [tableResponsible] : []);
  }, [tableResponsible]);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (tableParam) {
        const tableId = parseInt(tableParam, 10);
        if (!isNaN(tableId)) {
          const currentTable = tableContextTables.find(table => table.id === tableId);
          if (currentTable) {
            // Fetch order history from Supabase
            const { data: orders, error } = await supabase
              .from('orders')
              .select('*')
              .eq('tableid', tableId);

            if (error) {
              console.error("Error fetching order history:", error);
              return;
            }

            const tableOrders = orders.map(order => ({
              id: order.id,
              tableId: tableParam,
              responsibleName: order.responsibleName,
              items: order.items,
              timestamp: order.timestamp,
              status: order.status,
              total: order.total,
            } as TableOrder));
            setOrderHistory(tableOrders || []);
          }
        }
      }
    };

    fetchOrderHistory();
  }, [searchParams, tableContextTables, tableParam]);

  const getTotalPrice = () => {
    if (!orderItems || orderItems === null || orderItems === undefined || orderItems.length === 0) {
      return 0;
    }
    const totalPrice = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    return totalPrice;
  };

  console.log("OrderSummaryNew - getTotalPrice - orderItems", orderItems);

  const calculateOrderTotal = (items: OrderItem[] | undefined) => {
    if (!items || items === null || items === undefined || !Array.isArray(items) || items.length === 0) {
      return 0;
    }
    return items.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  };

  const grandTotal = orderHistory.reduce((total, order) => total + calculateOrderTotal(order?.items || []), 0);

  return (
    <>
      <div className="space-y-4">
        <Card className="mt-4 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-xl font-semibold">Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Responsável</label>
                <div className="flex items-center gap-2 bg-white rounded-lg border shadow-sm">
                  <User className="h-4 w-4 ml-3 text-gray-500" />
                  <Input
                    placeholder="Nome do responsável"
                    value={tableResponsible}
                    onChange={(e) => onTableResponsibleChange(e.target.value)}
                    className="border-0 focus-visible:ring-0" />
                </div>
                {responsibleNames.includes("N/A") && tableResponsible === "" && (
                  <p className="text-sm text-red-500">Por favor, inclua o nome do responsável</p>
                )}
                {tableResponsible && (
                  <p className="text-sm text-gray-500">Responsável: {tableResponsible}</p>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-sm text-gray-700">Itens do Pedido</h3>
                <div key={orderItems.length} >
                  {orderItems && orderItems.map((item) => (
                    <div key={`${item.id}-${item.quantity}`} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                      {/* Busca os dados do item do menu usando o ID */}
                      {(() => {
                        let menuItem: MenuItem | undefined;
                        for (const category in menuItems) {
                          menuItem = menuItems[category].find((menuItem) => menuItem.id === item.id);
                          if (menuItem) break;
                        }

                        if (!menuItem) {
                          return <div>Item não encontrado no menu</div>;
                        }

                        return (
                          <>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveItem(item.id)}
                                className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <div className="flex flex-col">
                                <span className="font-medium">{menuItem.name}</span>
                                <span className="text-sm text-gray-500">Qtd: {item.quantity}</span>
                              </div>
                            </div>
                            <span className="font-medium">€{(menuItem.price * item.quantity).toFixed(2)}</span>
                          </>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                onClick={() => {
                  if (!tableResponsible) {
                    alert("Por favor, introduza o nome do responsável antes de enviar o pedido.");
                    return;
                  }
                  onSubmit();
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-6"
              >
                Enviar para Cozinha
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-8 border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-xl font-semibold">Histórico de Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="border-b pb-2">
              {orderHistory && orderHistory.map((order) => (
                <div key={order.id} className="space-y-2 pb-2">
                  <p className="text-sm text-gray-600">Responsável: {order.responsibleName || "Não especificado"}</p>
                  {order.items && order.items.map((item) => {
                    let menuItem: MenuItem | undefined;
                    for (const category in menuItems) {
                      menuItem = menuItems[category]?.find((menuItem) => menuItem.id === item.id);
                      if (menuItem) break;
                    }

                    if (!menuItem) {
                      return <div>Item não encontrado no menu</div>;
                    }
                    return (
                      <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                        <div className="flex flex-col">
                          <span className="font-medium">{menuItem.name}</span>
                          <span className="text-sm text-gray-500">Qtd: {item.quantity}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="pt-2">
              <p className="text-sm font-semibold text-gray-700">Total Geral: €{orderHistory.length > 0 ? grandTotal.toFixed(2) : "0,00"}</p>
            </div>
          </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default OrderSummaryNew;
