import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Users, Clock, Coffee } from "lucide-react";

type TableStatus = "available" | "occupied" | "closing";

interface Table {
  id: number;
  status: TableStatus;
  occupants?: number;
  timeSeated?: string;
  server?: string;
}

const TableCaixa = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tables] = useState<Table[]>(
    Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      status: "available",
      occupants: Math.floor(Math.random() * 6) + 1,
      timeSeated: "19:30",
      server: "João",
    }))
  );

  const getStatusConfig = (status: TableStatus) => {
    switch (status) {
      case "available":
        return {
          color: "bg-emerald-100 hover:bg-emerald-200",
          textColor: "text-emerald-700",
          borderColor: "border-emerald-200",
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
      default:
        return {
          color: "bg-gray-100",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
          label: "Desconhecido"
        };
    }
  };

  const handleTableClick = (tableId: number) => {
    navigate(`/menu?table=${tableId}`);
  };

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
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => logout()}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="pt-24 pb-6 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-full">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Mesas Ocupadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {tables.filter(t => t.status === "occupied").length} / {tables.length}
              </p>
            </div>
          </Card>
          
          <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tempo Médio</p>
              <p className="text-2xl font-bold text-gray-900">45 min</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="p-3 bg-violet-100 rounded-full">
              <Coffee className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pedidos Ativos</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {tables.map((table) => {
              const status = getStatusConfig(table.status);
              return (
                <button
                  key={table.id}
                  onClick={() => handleTableClick(table.id)}
                  className={`relative group p-4 rounded-lg border transition-all duration-200 ${status.color} ${status.borderColor} hover:shadow-md`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className={`text-lg font-semibold ${status.textColor}`}>
                      Mesa {table.id}
                    </span>
                    {table.status !== "available" && (
                      <>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{table.occupants}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {table.timeSeated} • {table.server}
                        </div>
                      </>
                    )}
                    <span className={`text-xs font-medium ${status.textColor}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="absolute inset-0 border-2 border-[#518426] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableCaixa;
