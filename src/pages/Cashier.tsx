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
import PDVPanel from "@/components/PDVPanel";
import { addTable } from "@/lib/firebase";
import Caixa from "@/components/Caixa";
import { useTable } from "@/context/TableContext";
import { useState, useEffect, useCallback } from "react";
import { getTables } from "@/lib/firebase";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";


interface OpenTable {
  id: string;
  tableNumber: string;
  total: number;
  status: "available" | "occupied";
}

interface Transaction {
  metodo: string;
  valentia: number;
  descricao: string;
  timestamp?: Date;
}

const Cashier = () => {
  const navigate = useNavigate();
  const [openTables, setOpenTables] = React.useState<OpenTable[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [filter, setFilter] = React.useState<string>('Todos');
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [caixaData, setCaixaData] = useState<any>(null);
  const [totalEntrada, setTotalEntrada] = useState(0);
  const [totalSaida, setTotalSaida] = useState(0);
  const [totalCompra, setTotalCompra] = useState(0);
  const [saldoFinal, setSaldoFinal] = useState(0);

  const handleCaixaFechado = useCallback(() => {
    setCaixaAberto(false);
    setTransactions([]);
  }, []);

  const fetchTables = useCallback(async () => {
    const tables = await getTables();
    setOpenTables(tables);
  }, []);

  React.useEffect(() => {
    const fetchTransactions = async () => {
      if (!caixaData?.id) {
        setTransactions([]);
        return;
      }

      const pdvDocRef = doc(db, 'pdv', caixaData.id);
      const pdvDocSnapshot = await getDoc(pdvDocRef);

      if (pdvDocSnapshot.exists()) {
        const pdvData = pdvDocSnapshot.data() as { transactions: any[] };
        setTransactions(pdvData.transactions || []);
      } else {
        setTransactions([]);
      }
    };

    fetchTables();
    fetchTransactions();
  }, [caixaAberto, caixaData, fetchTables]);

  const filteredTransactions = filter === 'Todos'
    ? transactions
    : transactions.filter(transaction => transaction.metodo === filter);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PDVPanel />
      <div className="flex justify-between items-center mb-4">
      </div>
      <Caixa caixaAberto={caixaAberto} setCaixaAberto={setCaixaAberto} onCaixaFechado={handleCaixaFechado} setCaixaData={setCaixaData} totalEntrada={totalEntrada} setTotalEntrada={setTotalEntrada} totalSaida={totalSaida} setTotalSaida={setTotalSaida} totalCompra={totalCompra} setTotalCompra={setTotalCompra} saldoFinal={saldoFinal} setSaldoFinal={setSaldoFinal} />
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
            <div className="flex mb-4 space-x-2 flex-wrap">
              <Button variant={filter === 'Todos' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('Todos')}>
                Todos
              </Button>
              <Button variant={filter === 'Mbway' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('Mbway')}>
                Mbway
              </Button>
              <Button variant={filter === 'Multibanco' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('Multibanco')}>
                Multibanco
              </Button>
              <Button variant={filter === 'saida' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('saida')}>
                saida
              </Button>
              <Button variant={filter === 'entrada' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('entrada')}>
                entrada
              </Button>
              <Button variant={filter === 'compra' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('compra')}>
                compra
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Método</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valentia</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell>{transaction.metodo}</TableCell>
                    <TableCell className="break-words">{transaction.descricao.length > 30 ? transaction.descricao.substring(0, 30) + "..." : transaction.descricao}</TableCell>
                    <TableCell>€ {transaction.valentia.toFixed(2)}</TableCell>
                    <TableCell>{transaction.timestamp?.toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cashier;
