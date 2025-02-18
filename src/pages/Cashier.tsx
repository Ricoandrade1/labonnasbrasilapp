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
import { useState, useEffect } from "react";
import { getTables } from "@/lib/firebase";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";


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

  React.useEffect(() => {
    const fetchTables = async () => {
      const tables = await getTables();
      setOpenTables(tables);
    };

    const fetchTransactions = async () => {
      const transactionsData: Transaction[] = [];

      // Fetch from 'transactions' collection
      const transactionsCollection = collection(db, 'transactions');
      const transactionsSnapshot = await getDocs(transactionsCollection);
      transactionsSnapshot.forEach(doc => {
        const data = doc.data();
        transactionsData.push({
          metodo: data.type || 'N/A',
          valentia: data.amount || 0,
          descricao: data.description || data.tipo || 'N/A',
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
        });
      });

      // Fetch from 'ControleFinanceiro' collection
      const controleFinanceiroCollection = collection(db, 'ControleFinanceiro');
      const controleFinanceiroSnapshot = await getDocs(controleFinanceiroCollection);
      controleFinanceiroSnapshot.forEach(doc => {
        const data = doc.data();
        transactionsData.push({
          metodo: data.tipo || 'N/A',
          valentia: data.valor || 0,
          descricao: data.descricao || data.tipo || 'N/A',
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
        });
      });

      // Fetch from 'aberturadecaixa' collection
      const aberturaDeCaixaCollection = collection(db, 'aberturadecaixa');
      const aberturaDeCaixaSnapshot = await getDocs(aberturaDeCaixaCollection);
      aberturaDeCaixaSnapshot.forEach(doc => {
        const data = doc.data();
        console.log("Abertura de Caixa data:", data); // Adicionado para debug
        transactionsData.push({
          metodo: 'Abertura de Caixa',
          valentia: data.valorInicial || 0,
          descricao: 'Abertura de caixa',
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
        });
      });

      // Fetch from 'fechamentodecaixa' collection
      const fechamentoDeCaixaCollection = collection(db, 'fechamentodecaixa');
      const fechamentoDeCaixaSnapshot = await getDocs(fechamentoDeCaixaCollection);
      fechamentoDeCaixaSnapshot.forEach(doc => {
        const data = doc.data();
        transactionsData.push({
          metodo: 'Fechamento de Caixa',
          valentia: data.valorFechamento || 0,
          descricao: 'Fechamento de caixa',
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date(),
        });
      });


      // Sort transactions by timestamp
      transactionsData.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB.getTime() - dateA.getTime(); // Sort in descending order (newest first)
      });

      setTransactions(transactionsData);
    };

    fetchTables();
    fetchTransactions();
    setCaixaAberto(caixaAberto); // Adicionado para forçar a atualização
  }, [caixaAberto]);

  const filteredTransactions = filter === 'Todos'
    ? transactions
    : transactions.filter(transaction => transaction.metodo === filter);

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
        await addTable(newTable);
        navigate(`/tablecaixa`);
      }}>Abrir Mesa</Button>
      <Caixa caixaAberto={caixaAberto} setCaixaAberto={setCaixaAberto} />
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
