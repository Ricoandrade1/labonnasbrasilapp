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
import { collection, getDocs, getFirestore, query, where, onSnapshot } from "firebase/firestore";
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
  id?: string; // Make id optional
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
  const [unsubscribeOrderHistory, setUnsubscribeOrderHistory] = React.useState<() => void | undefined>();


  const loadTablesFromFirebase = async () => {
    try {
      const dbInstance = getFirestore();
      // Carregando mesas de 'statusdemesa' do Firebase
      const tablesCollection = collection(dbInstance, "statusdemesa");
      const occupiedTablesQuery = query(tablesCollection);
      const unsubscribe = onSnapshot(occupiedTablesQuery, (tablesSnapshot) => {
        const firebaseTables = tablesSnapshot.docs.map((doc) => {
          const data = doc.data();
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
        // Log firebaseTables data
        console.log("firebaseTables:", JSON.stringify(firebaseTables, null, 2));
        // Use a Map to group tables by tableNumber
        const tablesMap = new Map<string, OpenTable[]>();
        firebaseTables.forEach(table => {
          const existingTablesForNumber = tablesMap.get(table.tableNumber) || [];
          existingTablesForNumber.push(table);
          tablesMap.set(table.tableNumber, existingTablesForNumber);
        });

        // Convert the map to an array of tables for setOpenTables
        const groupedTables = Array.from(tablesMap.values()).map(tables => tables[0]); // Use the first table in each group for display
        console.log("groupedTables:", JSON.stringify(groupedTables, null, 2));
        setOpenTables(groupedTables);
        console.log("PDVPanel - loadTablesFromFirebase - setOpenTables:", groupedTables);
      }, (error) => {
        console.error("Erro ao ouvir atualizações do Firebase:", error);
        console.log("Firebase error details:", error);
      });

      // Cleanup listener on unmount
      return () => unsubscribe();
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
    setOrderHistoryFromFirebase(table.tableNumber);
  };

  const setOrderHistoryFromFirebase = (tableNumber: string) => {
    if (unsubscribeOrderHistory) {
      unsubscribeOrderHistory(); // Unsubscribe from previous listener
    }

    if (!tableNumber) {
      setOrderHistory([]);
      setOrderTotal(0);
      return;
    }

    const dbInstance = getFirestore();
    const tablesCollection = collection(dbInstance, "statusdemesa");
    const occupiedTablesQuery = query(tablesCollection, where("tableId", "==", tableNumber));

    const unsubscribe = onSnapshot(occupiedTablesQuery, (querySnapshot) => {
      console.log("onSnapshot callback triggered for table:", tableNumber); // LOG 1: onSnapshot triggered
      console.log("querySnapshot data:", querySnapshot); // LOG 2: querySnapshot data

      let allProducts: string[] = [];
      let total = 0;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const products = data.products as string[];
        if (products && Array.isArray(products)) {
          allProducts = allProducts.concat(products);
        }
      });

      console.log("allProducts array:", allProducts); // LOG 3: allProducts array

      const productCounts: { [name: string]: number } = {};
      allProducts.forEach(productName => {
        productCounts[productName] = (productCounts[productName] || 0) + 1;
      });

      const orderItems: OrderItem[] = Object.entries(productCounts).map(([productName, quantity]) => {
        const menuItem = menuItems.find(item =>
          item.name.trim().toLowerCase() === productName.trim().toLowerCase()
        );
        return {
          name: productName,
          price: menuItem ? menuItem.price : 0,
          quantity: quantity,
        };
      });
      console.log("orderItems array:", orderItems); // LOG 4: orderItems array
      setOrderHistory(orderItems);
      // Recalculate total based on quantity
      const calculatedTotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      console.log("calculatedTotal:", calculatedTotal); // LOG 5: calculatedTotal
       setOrderTotal(calculatedTotal);
    }, (error) => {
      console.error("Erro ao ouvir atualizações do Firebase:", error);
    });
    setUnsubscribeOrderHistory(() => unsubscribe);
  };

  React.useEffect(() => {
    return () => {
      if (unsubscribeOrderHistory) {
        unsubscribeOrderHistory(); // Unsubscribe when component unmounts
      }
    };
  }, [unsubscribeOrderHistory]);

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentConfirm = () => {
    if (!selectedTable) return;

    // Simulate order completion
    // (Payment confirmation logic remains the same)
    alert(`Pagamento confirmado por ${paymentMethod} para a Mesa ${selectedTable?.tableNumber} - Total: €${orderTotal.toFixed(2)}`);
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
                  {orderHistory.map((item: OrderItem, index) => (
                    <li key={index} className="mb-1">
                      <span>{item.name} (x{item.quantity}) - €{(item.price * item.quantity).toFixed(2)}</span>
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
