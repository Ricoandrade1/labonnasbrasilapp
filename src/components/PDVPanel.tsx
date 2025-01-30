import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

interface OpenTable {
  id: string;
  tableNumber: string;
  total: number;
  status: "available" | "occupied";
}

  const PDVPanel = () => {
    const navigate = useNavigate();
    const [openTables, setOpenTables] = React.useState<OpenTable[]>([]);

    React.useEffect(() => {
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

      setOpenTables(tablesWithOrders);
    }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Painel Caixa</CardTitle>
        <CardDescription>
          Selecione os produtos para o pedido.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {openTables.map((table) => (
            <Card key={table.id} className={`mb-2 border rounded-lg transition-all duration-200 ${table.status === "available" ? "bg-emerald-100 border-emerald-200 text-emerald-700 hover:bg-emerald-200" : table.status === "occupied" ? "bg-rose-100 border-rose-200 text-rose-700 hover:bg-rose-200" : "bg-amber-100 border-amber-200 text-amber-700 hover:bg-amber-200"}`}>
              <CardHeader className="p-2">
                <CardTitle className="text-sm">Mesa {table.tableNumber}</CardTitle>
                <CardDescription className="text-xs">Total: R$ {table.total.toFixed(2)}</CardDescription>
              </CardHeader>
              <CardContent className="p-2">
                <Button size="sm" onClick={() => navigate(`/menu?tablecaixa=${table.tableNumber}`)}>Pagar</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PDVPanel;
