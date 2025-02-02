import React from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import PaymentDialog from "./PaymentDialog";

interface OpenTable {
  id: string;
  tableNumber: string;
  total: number;
  status: "available" | "occupied";
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const PDVPanel = () => {
  const navigate = useNavigate();
  const [openTables, setOpenTables] = React.useState<OpenTable[]>([]);
  const [selectedTable, setSelectedTable] = React.useState<OpenTable | null>(null);
  const [orderHistory, setOrderHistory] = React.useState<OrderItem[]>([]);
  const [orderTotal, setOrderTotal] = React.useState<number>(0);
  const [paymentMethod, setPaymentMethod] = React.useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState<boolean>(false);


  const loadOpenTables = () => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const storedOpenTables = JSON.parse(localStorage.getItem("openTables") || "[]");
    console.log("openTables from localStorage:", storedOpenTables);

    const tablesWithOrders = storedOpenTables.map((openTable: { tableNumber: string, status: "occupied" | "available" }) => {
      const ordersForTable = storedOrders.filter((order: { tableId: string, status: string }) => order.tableId === openTable.tableNumber && order.status === "completed");
      const total = ordersForTable.reduce((sum: number, order: { total: number }) => sum + order.total, 0);
      return {
        id: openTable.tableNumber,
        tableNumber: openTable.tableNumber,
        total: total,
        status: openTable.status
      }
    });

    setOpenTables(tablesWithOrders.filter(table => table.status === "occupied"));
  };


  React.useEffect(() => {
    loadOpenTables();
  }, []);

  const handleTableSelect = (table: OpenTable) => {
    setSelectedTable(table);
    loadOrderHistory(table.tableNumber);
  };

  const loadOrderHistory = (tableNumber: string) => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const ordersForTable = storedOrders.filter(
      (order: { tableId: string; status: string; items: OrderItem[] }) =>
        order.tableId === tableNumber && order.status === "completed" && order.items // Ensure items exist
    );

    if (ordersForTable.length > 0) {
      // Assuming each order in ordersForTable has an 'items' array
      const allItems = ordersForTable.reduce((items, order) => {
        return items.concat(order.items);
      }, []);
      setOrderHistory(allItems);
      updateTotal(allItems);
    } else {
      setOrderHistory([]);
      setOrderTotal(0);
    }
  };


  const updateTotal = (currentOrderItems: OrderItem[]) => {
    const newTotal = currentOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setOrderTotal(newTotal);
  };

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentConfirm = () => {
    if (!selectedTable) return;

    // Simulate order completion
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updatedOrders = storedOrders.map((order: { tableId: string, status: string }) => {
      if (order.tableId === selectedTable.tableNumber && order.status === "completed") {
        return { ...order, status: "paid", paymentMethod: paymentMethod }; // Mark as paid
      }
      return order;
    });
    localStorage.setItem("orders", JSON.stringify(updatedOrders));

    // Update table status to available
    const storedOpenTables = JSON.parse(localStorage.getItem("openTables") || "[]");
    const updatedOpenTables = storedOpenTables.map((table: { tableNumber: string, status: string }) => {
      if (table.tableNumber === selectedTable.tableNumber) {
        return { ...table, status: "available" }; // Mark table as available
      }
      return table;
    });
    localStorage.setItem("openTables", JSON.stringify(updatedOpenTables));


    alert(`Pagamento confirmado por ${paymentMethod} para a Mesa ${selectedTable?.tableNumber} - Total: R$ ${orderTotal.toFixed(2)}`);
    setIsPaymentDialogOpen(false);
    setPaymentMethod(null);
    setSelectedTable(null);
    setOrderHistory([]);
    setOrderTotal(0);
    loadOpenTables(); // Refresh tables
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Painel Caixa - Mesas Ocupadas</CardTitle>
        <CardDescription>
          Selecione uma mesa para finalizar o pedido e receber o pagamento.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tables List */}
        <div className="col-span-1">
          <h3>Mesas Ocupadas</h3>
          <ScrollArea className="h-[500px] rounded-md border p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
              {openTables.map((table) => (
                <Button
                  key={table.id}
                  variant="outline"
                  className={`justify-start text-left ${selectedTable?.id === table.id ? "bg-blue-500 text-white" : ""}`}
                  onClick={() => handleTableSelect(table)}
                >
                  Mesa {table.tableNumber} - Total: R$ {table.total.toFixed(2)}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Order History Area */}
        <div className="col-span-1">
          <div className="mb-4 p-4 border rounded-md">
            <h3>Histórico de Pedido da Mesa</h3>
            <ScrollArea className="h-[300px] rounded-md border p-2 mb-2">
              {orderHistory.length === 0 ? (
                <p>Nenhum pedido para esta mesa.</p>
              ) : (
                <ul>
                  {orderHistory.map((item, index) => (
                    <li key={index} className="flex items-center justify-between mb-1">
                      <span>{item.name} x {item.quantity}</span>
                      <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </div>

          {/* Total Display */}
          <div className="p-4 border rounded-md">
            <h3>Total do Pedido: R$ {orderTotal.toFixed(2)}</h3>
          </div>
          {selectedTable && (
          <div className="mt-4">
             <Button variant="default" className="w-full" onClick={() => handlePaymentMethodSelect('Dinheiro')}>
                Dinheiro
              </Button>
              <Button variant="default" className="w-full mt-2" onClick={() => handlePaymentMethodSelect('MBWay')}>
                MBWay
              </Button>
              <Button variant="default" className="w-full mt-2" onClick={() => handlePaymentMethodSelect('MultiBanco')}>
                MultiBanco
              </Button>
          </div>
          )}
        </div>
        <PaymentDialog 
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          paymentMethod={paymentMethod}
          total={orderTotal}
          onConfirm={handlePaymentConfirm}
        />
      </CardContent>
    </Card>
  );
};

export default PDVPanel;
