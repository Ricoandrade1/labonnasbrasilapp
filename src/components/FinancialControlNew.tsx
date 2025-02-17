import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';
import { db } from "../lib/firebase";
import { collection, addDoc, onSnapshot } from "firebase/firestore";

interface Transaction {
  id: string;
  type: 'entrada' | 'saida' | 'compra' | 'inicio' | 'fim';
  amount: number;
  description: string;
  date: string;
}

const FinancialControlNew = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [type, setType] = useState<Transaction['type']>('entrada');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [totalEntrada, setTotalEntrada] = useState(0);
  const [totalSaida, setTotalSaida] = useState(0);
  const [totalCompra, setTotalCompra] = useState(0);
  const [saldoFinal, setSaldoFinal] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!db) {
        console.error("Firebase não inicializado!");
        return;
      }

      try {
        const controleFinanceiroCollection = collection(db, 'ControleFinanceiro');
        const transactionsCollection = collection(db, 'transactions');

        const unsubscribeControleFinanceiro = onSnapshot(controleFinanceiroCollection, (snapshot) => {
          const controleFinanceiroList = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log("FinancialControlNew - ControleFinanceiro doc data:", data);
            return {
              id: doc.id,
              type: data.tipo || 'entrada',
              amount: data.valor || 0,
              description: data.descricao || '',
              date: data.data ? new Date(data.data).toISOString() : new Date().toISOString(),
            } as Transaction;
          });

          const unsubscribeTransactions = onSnapshot(transactionsCollection, (snapshot) => {
            const transactionList = snapshot.docs.map(doc => {
              const data = doc.data();
              console.log("FinancialControlNew - transactions doc data:", data);
              return {
                id: doc.id,
                type: data.type || 'entrada',
                amount: data.amount || 0,
                description: data.description || '',
                date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
              } as Transaction;
            });

            setTransactions([...controleFinanceiroList, ...transactionList]);
          });

          return () => {
            unsubscribeControleFinanceiro();
            unsubscribeTransactions();
          };
        });
      } catch (error) {
        console.error("Erro ao buscar transações:", error);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    const calculateTotals = () => {
      const entrada = transactions
        .filter((transaction) => transaction.type === 'entrada')
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const saida = transactions
        .filter((transaction) => transaction.type === 'saida')
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const compra = transactions
        .filter((transaction) => transaction.type === 'compra')
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      setTotalEntrada(entrada);
      setTotalSaida(saida);
      setTotalCompra(compra);
      setSaldoFinal(entrada - saida - compra);

      console.log("FinancialControlNew - entrada:", entrada);
      console.log("FinancialControlNew - saida:", saida);
      console.log("FinancialControlNew - compra:", compra);
    };

    console.log("FinancialControlNew - transactions:", transactions);
    calculateTotals();
  }, [transactions]);

  const handleAddTransaction = async () => {
    if (!db) {
      console.error("Firebase não inicializado!");
      return;
    }

    const newTransaction: Transaction = {
      id: '',
      type,
      amount,
      description,
      date: new Date().toISOString(),
    };

    try {
      const transactionsCollection = collection(db, 'transactions');
      await addDoc(transactionsCollection, {
        amount: amount,
        date: new Date().toISOString(),
        description: description,
        type: type,
      });
      setAmount(0);
      setDescription('');
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (startDate && new Date(transaction.date) < startDate) {
      return false;
    }
    if (endDate && new Date(transaction.date) > endDate) {
      return false;
    }
    return true;
  });

  const today = new Date().toISOString().split('T')[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Controle Financeiro</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="type">Tipo</Label>
            <div className="flex flex-wrap gap-2">
              <Button variant={type === 'entrada' ? 'default' : 'outline'} onClick={() => setType('entrada')}>Entrada</Button>
              <Button variant={type === 'saida' ? 'default' : 'outline'} onClick={() => setType('saida')}>Saída</Button>
              <Button variant={type === 'compra' ? 'default' : 'outline'} onClick={() => setType('compra')}>Compra</Button>
              <Button variant={type === 'inicio' ? 'default' : 'outline'} onClick={() => setType('inicio')}>Início</Button>
              <Button variant={type === 'fim' ? 'default' : 'outline'} onClick={() => setType('fim')}>Fim</Button>
            </div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="amount">Valor</Label>
            <Input type="number" id="amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full" />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full" />
          </div>
          <Button onClick={handleAddTransaction} className="w-full">Adicionar Transação</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="startDate">Data de Início:</Label>
            <Input
              type="date"
              id="startDate"
              defaultValue={today}
              className="w-full"
              disabled
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-emerald-100">
            <CardHeader>
              <CardTitle>Total de Entradas</CardTitle>
            </CardHeader>
            <CardContent>{totalEntrada}</CardContent>
          </Card>
          <Card className="bg-rose-100">
            <CardHeader>
              <CardTitle>Total de Saídas</CardTitle>
            </CardHeader>
            <CardContent>{totalSaida}</CardContent>
          </Card>
          <Card className="bg-blue-100">
            <CardHeader>
              <CardTitle>Total de Compras</CardTitle>
            </CardHeader>
            <CardContent>{totalCompra}</CardContent>
          </Card>
          <Card className="bg-violet-100">
            <CardHeader>
              <CardTitle>Saldo Final</CardTitle>
            </CardHeader>
            <CardContent>{saldoFinal}</CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialControlNew;
