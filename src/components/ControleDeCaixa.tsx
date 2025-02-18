import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, setDoc, getDoc, orderBy, limit } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useTable } from '../context/TableContext';
import { useToast } from "@/hooks/use-toast";
import FinancialControlNew from './FinancialControlNew';

interface CaixaProps {
  caixaAberto: boolean;
  setCaixaAberto: (aberto: boolean) => void;
  onCaixaFechado?: () => void;
  setCaixaData?: (caixaData: any) => void;
  totalEntrada: number;
  setTotalEntrada: (totalEntrada: number) => void;
  totalSaida: number;
   setTotalSaida: (totalSaida: number) => void;
  totalCompra: number;
   setTotalCompra: (totalCompra: number) => void;
  saldoFinal: number;
   setSaldoFinal: (saldoFinal: number) => void;
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
  transactions: any[];
}

const ControleDeCaixa: React.FC<CaixaProps> = ({ caixaAberto, setCaixaAberto, onCaixaFechado }) => {
  const { user } = useAuth();
  const { tables } = useTable();
  const { toast } = useToast();
  const [valorFinal, setValorFinal] = useState<number>(0);
  const [valorInicial, setValorInicial] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caixaData, setCaixaData] = useState<CaixaData | null>(null);

  console.log("ControleDeCaixa - caixaAberto:", caixaAberto);
  console.log("ControleDeCaixa - caixaData:", caixaData);

  useEffect(() => {
  }, [caixaData]);

 useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user) {
          return;
        }

        // Get the last opened cash register
        const aberturadecaixaFechamentoCollection = collection(db, 'aberturadecaixa - fechamentodecaixa');
         const qAberto = query(
          aberturadecaixaFechamentoCollection,
          where('usuarioAbertura', '==', user.id),
          orderBy('horaAbertura', 'desc'),
          limit(1)
        );
        const querySnapshotAberto = await getDocs(qAberto);

        if (!querySnapshotAberto.empty) {
          // Caixa aberto
          const caixaDoc = querySnapshotAberto.docs[0];
          const caixaData = { id: caixaDoc.id, ...caixaDoc.data() } as CaixaData;
          setCaixaData(caixaData);
          setCaixaAberto(caixaData.status === 'aberto');
          console.log("Caixa encontrado com ID:", caixaDoc.id, "e status:", caixaData.status);
        } else {
          // Caixa fechado ou não encontrado
          setCaixaData(null);
          setCaixaAberto(false);
        }
      } catch (e: any) {
        setError('Erro ao verificar status do caixa: ' + e.message);
        console.error("Erro ao verificar status do caixa:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

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

      console.log("Valor Inicial antes de addDoc:", valorInicial);

      const horaAbertura = new Date().toLocaleTimeString();
      const docId = `abertura-${Date.now()}`; // Usar timestamp como ID do documento
      const aberturadecaixaFechamentoCollection = collection(db, 'aberturadecaixa - fechamentodecaixa');
      const docRef = doc(aberturadecaixaFechamentoCollection, docId);
      
        await setDoc(docRef, {
          dataAbertura: new Date().toLocaleDateString(),
          horaAbertura: horaAbertura,
          usuarioAbertura: user.id,
          valorInicial: valorInicial,
          status: 'aberto',
          transactions: [], // Inicializa a lista de transações
        });
        console.log("Caixa aberto com ID:", docId);
      

      setCaixaAberto(true);
      setCaixaData({
        id: docId,
        dataAbertura: new Date().toLocaleDateString(),
        horaAbertura: horaAbertura,
        usuarioAbertura: user.id,
        valorInicial: valorInicial,
        status: 'aberto',
        transactions: [],
      });
    } catch (e: any) {
      setError('Erro ao abrir caixa: ' + e.message);
      console.error("Erro ao abrir caixa:", e);
    }
  };

  const [caixaAberturaTransactionAdicionada, setCaixaAberturaTransactionAdicionada] = useState(false);

  // useEffect(() => {
  //   if (caixaAberto && user && !caixaAberturaTransactionAdicionada) {
  //     let transactionAdicionada = false;
  //     // Adicionar transação de abertura de caixa
  //     const addAberturaDeCaixaTransaction = async () => {
  //       if (!transactionAdicionada) {
  //         const transactionsCollection = collection(db, 'transactions');
  //         await addDoc(transactionsCollection, {
  //           type: 'Abertura de Caixa',
  //           description: 'Valor Inicial',
  //           amount: valorInicial,
  //           timestamp: new Date(),
  //         });
  //         console.log('Transação de abertura de caixa adicionada com sucesso!');
  //         transactionAdicionada = true;
  //         setCaixaAberturaTransactionAdicionada(true);
  //       }
  //     };
  //     addAberturaDeCaixaTransaction();
  //   }
  // }, [caixaAberto, user, valorInicial]);

  const handleFecharCaixa = async () => {
    setError(null);
    console.log("Tentando fechar o caixa com ID:", caixaData?.id); // Adicionado log
    try {
      const hasOpenTables = tables.some(table => table.status !== 'available');
      if (hasOpenTables) {
        toast({
          title: "Erro",
          description: "Não é possível fechar o caixa com mesas abertas.",
          variant: "destructive",
        });
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

      if (!caixaData?.id) {
        setError('Nenhum caixa aberto encontrado para este usuário.');
        return;
      }

      // Buscar os valores atuais de Total de Entradas, Saídas e Compras
      const financialControlCollection = collection(db, 'ControleFinanceiro');
      const entradasQuery = query(financialControlCollection, where('tipo', '==', 'entrada'));
      const saidasQuery = query(financialControlCollection, where('tipo', '==', 'saida'));
      const comprasQuery = query(financialControlCollection, where('tipo', '==', 'compra'));

      const [entradasSnapshot, saidasSnapshot, comprasSnapshot] = await Promise.all([
        getDocs(entradasQuery),
        getDocs(saidasQuery),
        getDocs(comprasQuery),
      ]);

      const totalEntrada = entradasSnapshot.docs.reduce((sum, doc) => sum + doc.data().valor, 0);
      const totalSaida = saidasSnapshot.docs.reduce((sum, doc) => sum + doc.data().valor, 0);
      const totalCompra = comprasSnapshot.docs.reduce((sum, doc) => sum + doc.data().valor, 0);
      const saldoFinal = totalEntrada - totalSaida - totalCompra;

      try {
        const horaFechamento = new Date().toLocaleTimeString();
        const docId = `fechamento-${Date.now()}`; // Usar timestamp como ID do documento
        const aberturadecaixaFechamentoCollection = collection(db, 'aberturadecaixa - fechamentodecaixa');
        await setDoc(doc(aberturadecaixaFechamentoCollection, docId), {
          dataAbertura: caixaData.dataAbertura,
          horaAbertura: caixaData.horaAbertura,
          usuarioAbertura: caixaData.usuarioAbertura,
          valorInicial: caixaData.valorInicial,
          dataFechamento: new Date().toLocaleDateString(),
          horaFechamento: horaFechamento,
          usuarioFechamento: user?.id,
          valorFinal: valorFinal,
          status: 'fechado',
          totalEntrada: totalEntrada,
          totalSaida: totalSaida,
          totalCompra: totalCompra,
          saldoFinal: saldoFinal,
        });

        console.log("Caixa fechado com ID:", docId);
      } catch (error: any) {
        setError('Erro ao fechar caixa: ' + error.message);
        console.error("Erro ao fechar caixa:", error);
        return;
      }

      setValorFinal(0);
      setCaixaAberto(false);
      setCaixaData(null);
      if (onCaixaFechado) {
        onCaixaFechado();
      }
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
        <FinancialControlNew setCaixaAberto={setCaixaAberto} caixaAberto={caixaAberto}/>
        {user && caixaAberto && caixaData ? (
          <div>
            <h2>Caixa Aberto</h2>
            <p>Data de Abertura: {caixaData.dataAbertura}</p>
            <p>Hora de Abertura: {caixaData.horaAbertura}</p>
            <p>Valor Inicial: {caixaData.valorInicial} €</p>
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
            {podeAbrirCaixa && <Button disabled={loading} onClick={handleFecharCaixa}>Fechar Caixa</Button>}
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
