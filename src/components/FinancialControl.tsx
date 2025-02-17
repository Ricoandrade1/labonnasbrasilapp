import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Transaction {
  id: number;
  type: 'entrada' | 'saida' | 'compra' | 'inicio' | 'fim';
  amount: number;
  description: string;
  date: Date;
}

const FinancialControl = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [type, setType] = useState<Transaction['type']>('entrada');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleAddTransaction = () => {
    const newTransaction: Transaction = {
      id: transactions.length + 1,
      type,
      amount,
      description,
      date: new Date(),
    };
    setTransactions([...transactions, newTransaction]);
    setAmount(0);
    setDescription('');
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (startDate && transaction.date < startDate) {
      return false;
    }
    if (endDate && transaction.date > endDate) {
      return false;
    }
    return true;
  });

  const totalEntrada = filteredTransactions
    .filter((transaction) => transaction.type === 'entrada')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalSaida = filteredTransactions
    .filter((transaction) => transaction.type === 'saida')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalCompra = filteredTransactions
    .filter((transaction) => transaction.type === 'compra')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const saldoFinal = totalEntrada - totalSaida - totalCompra;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Controle Financeiro</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="type">Tipo</Label>
          <Select onValueChange={(value) => setType(value as Transaction['type'])}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="saida">Saída</SelectItem>
              <SelectItem value="compra">Compra</SelectItem>
              <SelectItem value="inicio">Início de Caixa</SelectItem>
              <SelectItem value="fim">Fim de Caixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="amount">Valor</Label>
          <Input type="number" id="amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full"/>
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="description">Descrição</Label>
          <Input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full"/>
        </div>
        <Button onClick={handleAddTransaction} className="w-full">Adicionar Transação</Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="startDate">Data de Início:</Label>
            <Input
              type="date"
              id="startDate"
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="endDate">Data de Fim:</Label>
            <Input
              type="date"
              id="endDate"
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <h3>Transações:</h3>
          <ul>
            {filteredTransactions.map((transaction) => (
              <li key={transaction.id}>
                {transaction.type} - {transaction.description} - {transaction.amount} - {transaction.date.toLocaleDateString()}
              </li>
            ))}
          </ul>

          <h3>Total de Entradas: {totalEntrada}</h3>
          <h3>Total de Saídas: {totalSaida}</h3>
          <h3>Total de Compras: {totalCompra}</h3>
          <h3>Saldo Final: {saldoFinal}</h3>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialControl;
