import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

interface CaixaData {
  id?: string;
  dataAbertura: string;
  horaAbertura: string;
  usuarioAbertura: string;
  valorInicial: number;
  dataFechamento?: string;
  horaFechamento?: string;
  usuarioFechamento?: string;
  valorFinal?: number;
  status: 'aberto' | 'fechado';
}

const ControleDeCaixa = () => {
  const { user } = useAuth();
  const [caixaAberto, setCaixaAberto] = useState<CaixaData | null>(null);
  const [valorFinal, setValorFinal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verificarCaixaAberto = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user) {
          return;
        }
        const caixasCollection = collection(db, 'aberturadeciaxa - fechamentodecaixa');
        const q = query(caixasCollection, where('status', '==', 'aberto'), where('usuarioAbertura', '==', user.id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const caixaData = querySnapshot.docs[0].data() as CaixaData;
          setCaixaAberto({ id: querySnapshot.docs[0].id, ...caixaData });
        } else {
          setCaixaAberto(null);
        }
      } catch (e: any) {
        setError('Erro ao verificar status do caixa: ' + e.message);
        console.error("Erro ao verificar status do caixa:", e);
      } finally {
        setLoading(false);
      }
    };

    verificarCaixaAberto();
  }, [user]);

  const handleAbrirCaixa = async () => {
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

      const caixasCollection = collection(db, 'aberturadeciaxa - fechamentodecaixa');
      await addDoc(caixasCollection, {
        dataAbertura: new Date().toLocaleDateString(),
        horaAbertura: new Date().toLocaleTimeString(),
        usuarioAbertura: user.id,
        valorInicial: 0, // Valor inicial fixo para simplificar
        status: 'aberto',
      });
      setCaixaAberto({
        dataAbertura: new Date().toLocaleDateString(),
        horaAbertura: new Date().toLocaleTimeString(),
        usuarioAbertura: user.id,
        valorInicial: 0,
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
      if (!caixaAberto?.id) {
        setError('Nenhum caixa aberto encontrado.');
        return;
      }

      if (!valorFinal) {
        setError('Valor final é obrigatório.');
        return;
      }

      if (user.role !== 'Caixa' && user.role !== 'gerente' && user.role !== 'adm') {
        setError('Apenas usuários com a função de Caixa, gerente ou adm podem fechar o caixa.');
        return;
      }

      const caixaDocRef = doc(db, 'aberturadeciaxa - fechamentodecaixa', caixaAberto.id);
      await updateDoc(caixaDocRef, {
        dataFechamento: new Date().toLocaleDateString(),
        horaFechamento: new Date().toLocaleTimeString(),
        usuarioFechamento: user?.id,
        valorFinal: valorFinal,
        status: 'fechado',
      });
      setValorFinal(0);
      setCaixaAberto(null);
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
            <p>Data de Abertura: {caixaAberto.dataAbertura}</p>
            <p>Hora de Abertura: {caixaAberto.horaAbertura}</p>
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
            {podeAbrirCaixa && <Button onClick={handleAbrirCaixa}>Abrir Caixa</Button>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ControleDeCaixa;
