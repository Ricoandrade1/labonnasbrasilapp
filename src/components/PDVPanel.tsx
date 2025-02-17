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
import FinancialControlNew from './FinancialControlNew';
import OrderTotal from './OrderTotal';

interface OpenTable {
  id: string;
  tableNumber: string;
  total: number;
  status: "available" | "occupied";
  products: string[];
  responsibleName: string;
  timestamp: string;
  mesaId: string;
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
  const [paymentMethod, setPaymentMethod] = React.useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState<boolean>(false);
  const [unsubscribeOrderHistory, setUnsubscribeOrderHistory] = React.useState<() => void | undefined>();
  const [orderTotal, setOrderTotal] = React.useState<number>(() => {
    const storedTotal = localStorage.getItem('orderTotal');
    return storedTotal ? parseFloat(storedTotal) : 0;
  });

  const calculateTotal = (items: OrderItem[]): number => {
    return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const loadTablesFromFirebase = async () => {
    try {
      const dbInstance = getFirestore();
      // Carregando mesas de 'Mesas' do Firebase
      const tablesCollection = collection(dbInstance, "Mesas");
      const unsubscribe = onSnapshot(tablesCollection, (tablesSnapshot) => {
        const firebaseTables = tablesSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              tableNumber: data.tableNumber, // Use tableNumber from firebase data
              status: data.status,
              total: data.total || 0,
              products: [], // Assuming products is an array
              responsibleName: '',
              timestamp: '',
              mesaId: doc.id, // Store the document id from "Mesas"
            } as OpenTable;
          })
          .filter((table) => table.status !== 'available' && /^\d+$/.test(table.tableNumber)) // Filter out invalid table IDs

        // Group tables by tableNumber
        const tablesMap = new Map<string, OpenTable[]>();
        firebaseTables.forEach(table => {
          const existingTablesForNumber = tablesMap.get(table.tableNumber) || [];
          existingTablesForNumber.push(table);
          tablesMap.set(table.tableNumber, existingTablesForNumber);
        });

        // Convert the map to an array of tables for setOpenTables
        const groupedTables = Array.from(tablesMap.values()).map(tables => {
          // Sort tables within each group by timestamp
          tables.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          return tables[0]; // Use the first table in each group for display
        }).sort((a, b) => parseInt(a.tableNumber) - parseInt(b.tableNumber)); // Sort by table number

        console.log("Firebase tables data before setOpenTables:", groupedTables);
        // Log firebaseTables data
        console.log("firebaseTables:", JSON.stringify(groupedTables, null, 2));
        setOpenTables(groupedTables);
        console.log("PDVPanel - loadTablesFromFirebase - setOpenTables:", groupedTables);
      }, (error) => {
        console.error("Erro ao ouvir atualizações do Firebase:", error);
        console.log("Firebase error details:", error);
      });
      console.log("loadTablesFromFirebase - openTables:", openTables);

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
    console.log("handleTableSelect - table:", table);
    setOrderHistoryFromFirebase(table.mesaId);
  };

  const setOrderHistoryFromFirebase = (mesaId: string) => {
    if (unsubscribeOrderHistory) {
      unsubscribeOrderHistory(); // Unsubscribe from previous listener
    }

    if (!mesaId) {
      setOrderHistory([]);
      setOrderTotal(0);
      return;
    }

    const dbInstance = getFirestore();
    const tablesCollection = collection(dbInstance, "Pedidos");
    const occupiedTablesQuery = query(tablesCollection, where("tableId", "==", mesaId));

    console.log("Query parameters:", mesaId);

    const unsubscribe = onSnapshot(occupiedTablesQuery, (querySnapshot) => {
      console.log("onSnapshot callback triggered for table:", mesaId);
      console.log("querySnapshot data:", querySnapshot.docs.map(doc => doc.data()));

      let orderItems: OrderItem[] = [];
      let calculatedTotal = 0;

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        console.log("Document data:", data);
        const items = data?.items as any[];
        if (items && Array.isArray(items)) {
          items.forEach(item => {
            orderItems.push({
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            });
          });
        }
        if (data?.total) {
          calculatedTotal += data.total;
        }
      });

      console.log("calculatedTotal:", calculatedTotal);
      console.log("orderItems array:", orderItems);
      setOrderHistory(orderItems);
      console.log("setOrderHistoryFromFirebase - orderHistory:", orderItems);
      localStorage.setItem('orderTotal', calculatedTotal.toString());
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

    // Chamar a função onConfirm do PaymentDialog
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
                  className={`relative group p-4 rounded-lg border transition-all duration-200 ${selectedTable?.tableNumber === table.tableNumber ? 'bg-blue-300 !bg-blue-300 border-blue-400 hover:bg-blue-400' : 'bg-rose-100 !bg-rose-100 border-rose-200 hover:bg-rose-200'} hover:shadow-md`}
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
          {selectedTable && (
          <div className="mt-4">
            <OrderTotal total={Number(orderTotal)} />
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
          tableId={selectedTable?.id} // Passa o tableId como prop
          mesaId={selectedTable?.mesaId}
          onConfirm={handlePaymentConfirm}
        />
        <FinancialControlNew />
      </CardContent>
    </Card>
  );
};

export default PDVPanel;
