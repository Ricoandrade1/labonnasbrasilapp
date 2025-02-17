import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

const Caixa = () => {
  const { user } = useAuth();
  const [caixaAberto, setCaixaAberto] = useState<CaixaData | null>(null);
  const [valorInicial, setValorInicial] = useState<number>(0);
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

      if (!valorInicial) {
        setError('Valor inicial é obrigatório.');
        return;
      }

      const caixasCollection = collection(db, 'aberturadeciaxa - fechamentodecaixa');
      await addDoc(caixasCollection, {
        dataAbertura: new Date().toLocaleDateString(),
        horaAbertura: new Date().toLocaleTimeString(),
        usuarioAbertura: user.id,
        valorInicial: valorInicial,
        status: 'aberto',
      });
      setValorInicial(0);
      setCaixaAberto({
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
      if (!caixaAberto?.id) {
        setError('Nenhum caixa aberto encontrado.');
        return;
      }

      if (!valorFinal) {
        setError('Valor final é obrigatório.');
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

  const podeAbrirCaixa = user && (user.role === 'caixa' || user.role === 'manager' || user.role === 'owner');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Controle de Caixa</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {caixaAberto ? (
          <div>
            <h2>Caixa Aberto</h2>
            <p>Data de Abertura: {caixaAberto.dataAbertura}</p>
            <p>Hora de Abertura: {caixaAberto.horaAbertura}</p>
            <p>Valor Inicial: {caixaAberto.valorInicial}</p>
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
            <Button onClick={handleFecharCaixa}>Fechar Caixa</Button>
          </div>
        ) : (
          <div>
            <h2>Caixa Fechado</h2>
            {podeAbrirCaixa ? (
              <>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="valorInicial">Valor Inicial</Label>
                  <Input
                    type="number"
                    id="valorInicial"
                    placeholder="Digite o valor inicial do caixa"
                    value={valorInicial}
                    onChange={(e) => setValorInicial(Number(e.target.value))}
                  />
                </div>
                <Button onClick={handleAbrirCaixa}>Abrir Caixa</Button>
              </>
            ) : (
              <p>Você não tem permissão para abrir o caixa.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Caixa;
