import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useNavigate } from "react-router-dom";
import PDVPanel from "../components/PDVPanel"; // Corrected import path
import { addFirebaseTable } from "../lib/api";

interface OpenTable {
  id: string;
  tableNumber: string;
  total: number;
  status: "available" | "occupied";
}

const Cashier = () => {
  const navigate = useNavigate();
  const [openTables, setOpenTables] = React.useState<OpenTable[]>([
    { id: "1", tableNumber: "1", total: 150.00, status: "occupied" },
    { id: "2", tableNumber: "2", total: 200.00, status: "occupied" },
    { id: "3", tableNumber: "3", total: 75.00, status: "available" },
  ]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PDVPanel />
      <div className="flex justify-between items-center mb-4">
      </div>
      <Button onClick={async () => {
        const newTable = {
          tableNumber: String(openTables.length + 1),
          status: "occupied",
        };
        await addFirebaseTable(newTable);
        navigate(`/tablecaixa`);
      }}>Abrir Mesa</Button>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Disponibilidade de Mesa</CardTitle>
            <CardDescription>Status das mesas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={openTables.reduce(
                    (acc, table) => {
                      if (table.status === "available") {
                        acc[0].value += 1;
                      } else {
                        acc[1].value += 1;
                      }
                      return acc;
                    },
                    [
                      { name: "Disponível", value: 0 },
                      { name: "Ocupada", value: 0 },
                    ]
                  )}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  <Cell key="available" fill="#0088FE" />
                  <Cell key="occupied" fill="#FFBB28" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Últimas Transações</CardTitle>
            <CardDescription>Histórico recente de pagamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end mb-4">
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="credit">Cartão de Crédito</SelectItem>
                  <SelectItem value="debit">Cartão de Débito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mesa</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Mesa 1</TableCell>
                  <TableCell>Dinheiro</TableCell>
                  <TableCell>R$ 100,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Mesa 2</TableCell>
                  <TableCell>Crédito</TableCell>
                  <TableCell>R$ 200,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Mesa 3</TableCell>
                  <TableCell>Débito</TableCell>
                  <TableCell>R$ 150,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Mesa 4</TableCell>
                  <TableCell>PIX</TableCell>
                  <TableCell>R$ 50,00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cashier;
