import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCaixa } from '../context/CaixaContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";

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
  const [type, setType] = useState<'entrada' | 'saida' | 'compra' | 'inicio' | 'fim'>('entrada');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const { setTotalEntrada: setTotalEntradaContext, setTotalSaida: setTotalSaidaContext, setTotalCompra: setTotalCompraContext, setSaldoFinal: setSaldoFinalContext } = useCaixa();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAddTransaction = async () => {
    // Implementar a lógica para adicionar a transação
    console.log("Adicionar transação:", { type, amount, description });
    try {
      if (!db) {
        console.error("Firebase não inicializado!");
        return;
      }

      const pdvZeroCollection = collection(db, 'pdvzero');
      await addDoc(pdvZeroCollection, {
        valor: amount,
        data: new Date().toLocaleDateString(),
        descricao: description,
        tipo: type,
		usuarioAbertura: user.id,
		horaAbertura: new Date().toLocaleTimeString(),
      });

      setAmount(0);
      setDescription('');
	  toast({
          title: "Sucesso",
          description: "Transação adicionada com sucesso.",
        });
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
	  toast({
          title: "Erro",
          description: "Erro ao adicionar transação.",
          variant: "destructive",
        });
    }
  };

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
            </div>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="amount">Valor</Label>
            <Input type="number" id="amount" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full" />
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full" required disabled={!caixaAberto}/>
          </div>
          <Button onClick={handleAddTransaction} className="w-full" disabled={!description || !caixaAberto}>Adicionar Transação</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="startDate">Data de Início:</Label>
            <Input
              type="date"
              id="startDate"
              className="w-full"
              disabled
              value={new Date().toISOString().split('T')[0]}
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
