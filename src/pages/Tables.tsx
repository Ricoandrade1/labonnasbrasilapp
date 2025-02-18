import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { LogOut, Users, Clock, Coffee } from "lucide-react";
import { useTable } from "@/context/TableContext";
import { useEffect, useState } from "react";
import { TableStatus } from "@/context/TableContext";
import { db, collection, getDocs, getFirebaseOrderHistory, query, where } from "@/lib/api";
import { CardContent } from "@/components/ui/card";

interface Table {
  id: string | number;
  tableNumber: string;
  status: TableStatus;
  orders: any[];
  totalAmount: number;
  openingTime?: string;
}

const AlertMessage = () => (
  <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
    <Card className="w-full max-w-md">
      <CardContent className="bg-red-100 border border-red-500 text-red-700 p-4 rounded-md">
        <div className="flex items-center space-x-2">
          <span className="font-bold">🔔 ATENÇÃO! O CAIXA AINDA NÃO FOI ABERTO 🔔</span>
        </div>
        <p className="mt-2">
          💰 Para iniciar o atendimento, peça ao caixa ou ao gerente para abrir o caixa e informar o valor inicial de operação.
        </p>
        <div className="mt-4">
          <p>⚠️ IMPORTANTE:</p>
          <ul className="list-disc pl-5">
            <li>✅ Todos os registros devem ser feitos com máxima atenção.</li>
            <li>🚫 Nenhuma comanda pode ser cancelada sem a validação dos administradores.</li>
            <li>💳 Caso haja qualquer divergência financeira, os responsáveis serão notificados e deverão prestar esclarecimentos.</li>
          </ul>
        </div>
        <p className="mt-4">Aguarde a liberação do sistema para continuar os atendimentos.</p>
      </CardContent>
    </Card>
  </div>
);

const calculateAverageTime = (tables: Table[]): string => {
  const occupiedTables = tables.filter(t => t.status === "occupied");
  if (occupiedTables.length === 0) {
    return "-";
  }

  const totalTime = occupiedTables.reduce((acc, table) => {
    if (!table.openingTime) {
      return acc;
    }
    const openingTime = new Date(table.openingTime).getTime();
    const currentTime = Date.now();
    const diff = currentTime - openingTime;
    return acc + diff;
  }, 0);

  const averageTime = totalTime / occupiedTables.length;
  const minutes = Math.floor(averageTime / (60 * 1000));
  return `${minutes} min`;
};

const Tables = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const tableContext = useTable();
  const { tables, setAllTablesAvailable, forceUpdateTables, setTables } = tableContext;
  const [loading, setLoading] = useState(true);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [caixaAberto, setCaixaAberto] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const verificarCaixaAberto = async () => {
      try {
        const caixasCollection = collection(db, 'aberturadecaixa');
        const q = query(caixasCollection, where('status', '==', 'aberto'));
        const querySnapshot = await getDocs(q);
        setCaixaAberto(!querySnapshot.empty);
      } catch (error) {
        console.error("Erro ao verificar status do caixa:", error);
        setCaixaAberto(false);
      }
    };

    verificarCaixaAberto();
  }, []);

  const fetchTables = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Mesas"));
      const activeOrdersQuery = query(collection(db, "Pedidos"), where("status", "!=", "completed"));
      const activeOrdersSnapshot = await getDocs(activeOrdersQuery);
      const activeOrdersData = activeOrdersSnapshot.docs.map(doc => doc.data());
      setActiveOrders(activeOrdersData);

      const tablesData = await Promise.all(querySnapshot.docs.map(async doc => {
const data = doc.data() as any;
          const tableData: Table = {
            id: doc.id,
            tableNumber: data.tableNumber || '',
            status: data.status || 'available' as TableStatus,
            totalAmount: data.totalAmount || 0,
            openingTime: data.openingTime || null,
            orders: [],
          };
          const orderHistory = await getFirebaseOrderHistory(doc.id);
          tableData.orders = orderHistory;
          
          return tableData;
        }));

        // Verificar e corrigir números de mesa duplicados
        const tableNumbers = new Set();
        tablesData.forEach((table, index) => {
          if (tableNumbers.has(table.tableNumber)) {
            table.tableNumber = `${table.tableNumber} (${index + 1})`;
          } else {
            tableNumbers.add(table.tableNumber);
          }
        });

        console.log("Tables.tsx - Fetched tables:", tablesData);
        console.log("Tables.tsx - Fetched tables length:", tablesData.length);
        setTables((prevTables) => tablesData);
      } catch (error) {
        console.error("Tables.tsx - Error fetching tables:", error);
      } finally {
        setLoading(false);
      }
    };

 useEffect(() => {
    console.log("Tables.tsx - useEffect triggered");
    console.log("Tables.tsx - user:", user);
    fetchTables();
  }, [setTables]);

  const getStatusConfig = (status: TableStatus) => {
    switch (status) {
      case "available":
        return {
          color: "bg-green-100 hover:bg-green-200",
          textColor: "text-green-700",
          borderColor: "border-green-200",
          label: "Disponível"
        };
      case "occupied":
        return {
          color: "bg-rose-100 hover:bg-rose-200",
          textColor: "text-rose-700",
          borderColor: "border-rose-200",
          label: "Ocupada"
        };
      case "closing":
        return {
          color: "bg-amber-100 hover:bg-amber-200",
          textColor: "text-amber-700",
          borderColor: "border-amber-200",
          label: "Fechando"
        };
      case "pending":
        return {
          color: "bg-blue-100 hover:bg-blue-200",
          textColor: "text-blue-700",
          borderColor: "border-blue-200",
          label: "Aguardando"
        };
      default:
        return {
          color: "bg-gray-100",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          label: "Desconhecido"
        };
    }
  };

  const handleTableClick = (tableId: string) => {
    console.log('Tables.tsx - handleTableClick function called with tableId:', tableId);
    navigate(`/menu?table=${tableId}`);
  };

  console.log("Tables.tsx - user?.role:", user?.role);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Labonnas Brasil</h1>
            <p className="text-sm text-gray-500">Visão Geral das Mesas</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {user ? (
                <span className="text-sm font-medium text-gray-700">{user?.name} - {user?.role ? (Array.isArray(user?.role) ? user?.role?.join(", ") : user?.role) : "Função não definida"}</span>
              ) : (
                <span className="text-sm font-medium text-gray-700">Carregando...</span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("onClick - Botão Sair clicado");
                logout();
                navigate("/login");
              }}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Alert Message */}
      {caixaAberto ? null : (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-50 z-40">
          <AlertMessage />
        </div>
      )}

      {/* Stats Overview */}
      <div className={`pt-24 pb-6 px-6 ${caixaAberto ? '' : 'pointer-events-none opacity-50'}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-full">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Mesas Ocupadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {tables.filter(table => table.status === "occupied").length} / {tables.length}
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tempo Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                {tables ? calculateAverageTime(tables) : "-"}
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-violet-100 rounded-full">
              <Coffee className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pedidos Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {tables && tables.reduce((totalActiveOrders, table) => {
                  const orders = table.orders || [];
                  const activeOrders = orders.filter(order => order.status !== 'completed');
                  return totalActiveOrders + activeOrders.length;
                }, 0)}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Tables Grid */}
      <div className={`px-6 pb-6 ${caixaAberto ? '' : 'pointer-events-none opacity-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {loading ? (
              <p>Carregando mesas...</p>
            ) : tables.length > 0 ? (
              tables
                .filter((table, index, self) =>
                  index === self.findIndex((t) => (
                    t.id === table.id
                  ))
                )
                .sort((a, b) => Number(a.tableNumber) - Number(b.tableNumber))
                .map((table) => {
                  const status = getStatusConfig(table.status);
                  return (
                    <button
                      key={table.id}
                      onClick={() => handleTableClick(String(table.id))}
                      className={`relative group p-4 rounded-lg border transition-all duration-200 ${status.color} ${status.borderColor} hover:shadow-md ${table.status === "occupied" ? "bg-rose-100 border-rose-200" : ""}`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className={`text-lg font-semibold ${status.textColor}`}>
                          Mesa {String(table.tableNumber)}
                        </span>
                        {table.status !== "available" && (
                          <>
                            {/* <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{table.occupants}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {table.timeSeated} • {table.server}
                            </div> */}
                          </>
                        )}
                        <span className={`text-xs font-medium ${status.textColor}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="absolute inset-0 border-2 border-[#518426] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </button>
                  );
                })
            ) : (
              <p>Nenhuma mesa encontrada.</p>
            )}
          </div>
        </div>
      </div>
      {/* <div className="flex justify-center space-x-4">
        <Button onClick={() => setAllTablesAvailable()}>Set All Tables Available</Button>
        <Button onClick={() => { localStorage.clear(); window.location.reload(); }}>Limpar Dados Locais</Button>
        <Button onClick={() => forceUpdateTables()}>Atualizar Mesas</Button>
      </div> */}
    </div>
  );
};

export default Tables;
