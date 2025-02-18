import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

interface CaixaProps {
  caixaAberto: boolean;
  setCaixaAberto: (aberto: boolean) => void;
}

interface CaixaData {
  id?: string;
  dataAbertura: string;
  horaAbertura: string;
  usuarioAbertura: string;
  valorInicial: number; // Valor inicial obrigatório
  dataFechamento?: string;
  horaFechamento?: string;
  usuarioFechamento?: string;
  valorFinal?: number;
  status: 'aberto' | 'fechado';
}

const ControleDeCaixa: React.FC<CaixaProps> = ({ caixaAberto, setCaixaAberto }) => {
  const { user } = useAuth();
  const [valorFinal, setValorFinal] = useState<number>(0);
  const [valorInicial, setValorInicial] = useState<number>(
    Number(localStorage.getItem('valorInicial')) || 0
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caixaData, setCaixaData] = useState<CaixaData | null>(null);

  useEffect(() => {
    const verificarCaixaAberto = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user) {
          return;
        }
        const caixasCollection = collection(db, 'aberturadecaixa');
        const q = query(caixasCollection, where('status', '==', 'aberto'), where('usuarioAbertura', '==', user.id));
        const querySnapshot = await getDocs(q);
        setCaixaAberto(!querySnapshot.empty);

        if (!querySnapshot.empty) {
          const caixaDoc = querySnapshot.docs[0];
          setCaixaData({ id: caixaDoc.id, ...caixaDoc.data() } as CaixaData);
        } else {
          setCaixaData(null);
        }
      } catch (e: any) {
        setError('Erro ao verificar status do caixa: ' + e.message);
        console.error("Erro ao verificar status do caixa:", e);
      } finally {
        setLoading(false);
      }
    };

    verificarCaixaAberto();
  }, [user, setCaixaAberto]);

  const handleAbrirCaixa = async (valorInicial: number) => {
    setError(null);
    try {
      if (!user) {
        setError('Usuário não autenticado.');
        return;
      }

      if (user.role !== 'Caixa' && user.role !== 'gerente' && user.role !== 'adm') {
        setError('Apenas usuários com a função de Caixa, gerente ou adm podem abrir o caixa.');
        return;
      }

      if (!valorInicial) {
        setError('Valor inicial é obrigatório.');
        return;
      }

      console.log("Valor Inicial antes de addDoc:", valorInicial); // Adicionado para debug

      const caixasCollection = collection(db, 'aberturadecaixa');
      const docRef = await addDoc(caixasCollection, {
        dataAbertura: new Date().toLocaleDateString(),
        horaAbertura: new Date().toLocaleTimeString(),
        usuarioAbertura: user.id,
        valorInicial: valorInicial,
        status: 'aberto',
      });

      // Adicionar transação de abertura de caixa
      const transactionsCollection = collection(db, 'transactions');
      await addDoc(transactionsCollection, {
        type: 'Abertura de Caixa',
        description: 'Valor Inicial',
        amount: valorInicial,
        timestamp: new Date(),
      });
      console.log('Transação de abertura de caixa adicionada com sucesso!');
      setCaixaAberto(true);
      setCaixaData({
        id: docRef.id,
        dataAbertura: new Date().toLocaleDateString(),
        horaAbertura: new Date().toLocaleTimeString(),
        usuarioAbertura: user.id,
        valorInicial: valorInicial,
        status: 'aberto',
      });
    } catch (e: any) {
      setError('Erro ao abrir caixa: ' + e.message);
      console.error("Erro ao abrir caixa:", e);
    }
  };

  const handleFecharCaixa = async () => {
    setError(null);
    try {
      if (!valorFinal) {
        setError('Valor final é obrigatório.');
        return;
      }

      if (user.role !== 'Caixa' && user.role !== 'gerente' && user.role !== 'adm') {
        setError('Apenas usuários com a função de Caixa, gerente ou adm podem fechar o caixa.');
        return;
      }

      if (!caixaData?.id) {
        setError('Nenhum caixa aberto encontrado para este usuário.');
        return;
      }

      const caixaDocRef = doc(db, 'aberturadecaixa', caixaData.id);

      await updateDoc(caixaDocRef, {
        dataFechamento: new Date().toLocaleDateString(),
        horaFechamento: new Date().toLocaleTimeString(),
        usuarioFechamento: user?.id,
        valorFinal: valorFinal,
        status: 'fechado',
      });

      // Adicionar transação de fechamento de caixa
      const transactionsCollection = collection(db, 'transactions');
      await addDoc(transactionsCollection, {
        type: 'Fechamento de Caixa',
        description: 'Valor Final',
        amount: valorFinal,
        timestamp: new Date(),
      });
      console.log('Transação de fechamento de caixa adicionada com sucesso!');

      setValorFinal(0);
      setCaixaAberto(false);
      setCaixaData(null);
    } catch (e: any) {
      setError('Erro ao fechar caixa: ' + e.message);
      console.error("Erro ao fechar caixa:", e);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  if (!user) {
    return <div>Usuário não autenticado.</div>;
  }

  const podeAbrirCaixa = user && (user.role === 'Caixa' || user.role === 'gerente' || user.role === 'adm');

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Controle de Caixa
        </CardTitle>
        <CardTitle>
          {user?.name?.replace(/\s*\(.*?\)\s*/g, '')}
        </CardTitle>
        <CardDescription>
          {user?.role}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {user && caixaAberto ? (
          <div>
            <h2>Caixa Aberto</h2>
            <p>Data de Abertura: {caixaData?.dataAbertura}</p>
            <p>Hora de Abertura: {caixaData?.horaAbertura}</p>
            <p>Valor Inicial: {caixaData?.valorInicial} €</p>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="valorFinal">Valor Final</Label>
              <Input
                type="number"
                id="valorFinal"
                placeholder="Digite o valor final do caixa"
                value={valorFinal}
                onChange={(e) => setValorFinal(Number(e.target.value))}
              />
            </div>
            {podeAbrirCaixa && <Button onClick={handleFecharCaixa}>Fechar Caixa</Button>}
          </div>
        ) : (
          <div>
            <h2>Caixa Fechado</h2>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="valorInicial">Valor Inicial (€)</Label>
              <Input
                type="number"
                id="valorInicial"
                placeholder="Digite o valor inicial do caixa (€)"
                value={valorInicial}
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  setValorInicial(newValue);
                  localStorage.setItem('valorInicial', String(newValue));
                }}
              />
            </div>
            {podeAbrirCaixa && <Button onClick={() => handleAbrirCaixa(valorInicial)}>Abrir Caixa</Button>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ControleDeCaixa;
