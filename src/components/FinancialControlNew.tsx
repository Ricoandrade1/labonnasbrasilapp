import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parse, isValid, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { db } from "../lib/firebase";
import { collection, addDoc, onSnapshot, getDocs, query, where, Timestamp } from "firebase/firestore";
import { useCaixa } from '../context/CaixaContext';

interface Transaction {
  id: string;
  type: 'entrada' | 'saida' | 'compra' | 'inicio' | 'fim';
  amount: number;
  description: string;
  date: string;
}

interface FinancialControlNewProps {
  caixaAberto: boolean;
  valorInicial: number;
  totalEntrada: number;
  totalSaida: number;
  totalCompra: number;
  saldoFinal: number;
  setCaixaAberto: (caixaAberto: boolean) => void;
}

const FinancialControlNew: React.FC<FinancialControlNewProps> = ({ setCaixaAberto, caixaAberto, valorInicial, totalEntrada, totalSaida, totalCompra, saldoFinal }) => {
  const { setTotalEntrada, setTotalSaida, setTotalCompra, setSaldoFinal } = useCaixa();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [type, setType] = useState<Transaction['type']>('entrada');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!db) {
        console.error("Firebase não inicializado!");
        return;
      }

      try {
        const controleFinanceiroCollection = collection(db, 'ControleFinanceiro');

        // Fetch initial transactions
        const querySnapshot = await getDocs(controleFinanceiroCollection);
        const initialTransactions = querySnapshot.docs.map(doc => {
          const data = doc.data();
          let date = data.data;
          if (typeof date === 'string') {
            const parsedDate = parse(date, 'dd/MM/yyyy', new Date(), { locale: ptBR });
            if (isValid(parsedDate)) {
              date = parsedDate.toISOString();
            } else {
              console.warn("Data inválida encontrada:", data.data);
              date = new Date().toISOString();
            }
          } else {
            date = new Date().toISOString();
          }
          return {
            id: doc.id,
            type: data.tipo || 'entrada',
            amount: data.valor || 0,
            description: data.descricao || '',
            date: date,
          } as Transaction;
        });
        setTransactions(initialTransactions);

        // Set up real-time updates
        const unsubscribeControleFinanceiro = onSnapshot(controleFinanceiroCollection, (snapshot) => {
          const controleFinanceiroList = snapshot.docs.map(doc => {
            const data = doc.data();
            let date = data.data;
            if (typeof date === 'string') {
              const parsedDate = parse(date, 'dd/MM/yyyy', new Date(), { locale: ptBR });
              if (isValid(parsedDate)) {
                date = parsedDate.toISOString();
              } else {
                console.warn("Data inválida encontrada:", data.data);
                date = new Date().toISOString();
              }
            } else {
              date = new Date().toISOString();
            }
            return {
              id: doc.id,
              type: data.tipo || 'entrada',
              amount: data.valor || 0,
              description: data.descricao || '',
              date: date,
            } as Transaction;
          });

          setTransactions(controleFinanceiroList);

          return () => {
            unsubscribeControleFinanceiro();
          };
        });
      } catch (error) {
        console.error("Erro ao buscar transações:", error);
      }
    };

    fetchFinancialData();
  }, [caixaAberto]);

  useEffect(() => {
    const calculateTotals = () => {
      let entrada = valorInicial || 0;
      let saida = 0;
      let compra = 0;

      transactions.forEach((transaction) => {
        if (transaction.type === 'entrada') {
          entrada += transaction.amount;
        } else if (transaction.type === 'saida') {
          saida += transaction.amount;
        } else if (transaction.type === 'compra') {
          compra += transaction.amount;
        }
      });

      setTotalEntrada(entrada);
      setTotalSaida(saida);
      setTotalCompra(compra);
      setSaldoFinal(entrada - saida - compra);
    };

    calculateTotals();
  }, [transactions, valorInicial]);

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
      const transactionsCollection = collection(db, 'ControleFinanceiro');
      await addDoc(transactionsCollection, {
        valor: amount,
        data: new Date().toISOString(),
        descricao: description,
        tipo: type,
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
            <Input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full" required />
          </div>
          <Button onClick={handleAddTransaction} className="w-full" disabled={!description}>Adicionar Transação</Button>
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
