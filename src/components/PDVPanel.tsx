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
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { menuItems } from "@/data/menuItems";

interface OpenTable {
  id: string;
  tableNumber: string;
  total: number;
  status: "available" | "occupied";
  products: string[];
  responsibleName: string;
  timestamp: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
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


  const loadTablesFromFirebase = async () => {
    try {
      const dbInstance = getFirestore();
      // Carregando mesas de 'statusdemesa' do Firebase
      const tablesCollection = collection(dbInstance, "statusdemesa");
      const occupiedTablesQuery = query(tablesCollection, where("status", "==", "ocupado"));
      const tablesSnapshot = await getDocs(occupiedTablesQuery);
      console.log("Tables snapshot:", tablesSnapshot);
      console.log("Tables snapshot docs:", tablesSnapshot.docs);
      const firebaseTables = tablesSnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("Firebase Document data:", JSON.stringify(data, null, 2)); // Console log para inspecionar os dados
        return {
          id: doc.id,
          tableNumber: data.tableId, // Use tableId from firebase data
          status: data.status,
          total: data.total,
          products: data.products, // Assuming products is an array
          responsibleName: data.responsibleName,
          timestamp: data.timestamp,
        } as OpenTable;
      });
      console.log("Firebase tables data before setOpenTables:", firebaseTables);
      setOpenTables(firebaseTables);
      console.log("Open tables state:", openTables); // Verificando o estado após atualização
    } catch (error) {
      console.error("Erro ao carregar mesas ocupadas do Firebase:", error);
      console.log("Firebase error details:", error);
      // Lidar com o erro adequadamente
    }
  };

  React.useEffect(() => {
    loadTablesFromFirebase();
  }, []);

  const handleTableSelect = (table: OpenTable) => {
    setSelectedTable(table);
    setOrderHistoryFromFirebase(table);
  };

 const setOrderHistoryFromFirebase = (table: OpenTable) => {
    const orderItems = table.products.map(productName => {
      console.log("Processing product:", productName);
      const menuItem = menuItems.find(item => item.name.trim() === productName.trim());
      if (menuItem) {
        console.log("Found menu item:", menuItem.name, "Price:", menuItem.price);
        return {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1
        };
      } else {
        console.log("Menu item not found for product:", productName);
        console.log("Product name from Firebase:", productName);
        return { name: productName, price: 0, quantity: 1 }; // Fallback if item not found
      }
    });
    console.log("Order items:", orderItems);
    setOrderHistory(orderItems as any || []);
    if (orderItems.some(item => item.price === 0)) {
      console.error("Alguns preços dos itens do pedido estão a 0!");
    }
    // Recalculate total based on order items prices
    const calculatedTotal = orderItems.reduce((sum, item) => sum + (item.price || 0), 0);
    setOrderTotal(calculatedTotal);
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
    loadTablesFromFirebase(); // Refresh tables
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {openTables.map((table) => (
                <Card
                  key={table.id}
                  className={`relative group p-4 rounded-lg border transition-all duration-200 bg-rose-100 !bg-rose-100 border-rose-200 hover:bg-rose-200 hover:shadow-md`}
                  onClick={() => handleTableSelect(table)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <CardHeader>
                      <CardTitle className="text-rose-700 text-lg font-semibold">Mesa {table.tableNumber}</CardTitle>
                    </CardHeader>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Order History Area */}
        <div className="col-span-1">
          <div className="mb-4 p-4 border rounded-md">
            <h3>Histórico de Pedido da Mesa</h3>
            <ScrollArea className="h-[300px] rounded-md border p-2 mb-2">
              {selectedTable && orderHistory.length > 0 ? (
                <ul>
                  {orderHistory.map((item: MenuItem | { name: string, price: number }, index) => (
                    <li key={index} className="mb-1">
                      <span>{item.name} (€{item.price.toFixed(2)})</span>
                    </li>
                  ))}
                </ul>
              ) : selectedTable ? (
                <p>Nenhum pedido para esta mesa</p>
              ) : (
                <p>Selecione uma mesa para ver o pedido.</p>
              )}
            </ScrollArea>
          </div>

          {/* Total Display */}
          <div className="p-4 border rounded-md">
            <h3>Total do Pedido: € {orderTotal.toFixed(2)}</h3>
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
