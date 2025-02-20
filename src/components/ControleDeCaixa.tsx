import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, setDoc, getDoc, orderBy, limit, onSnapshot, deleteDoc, writeBatch } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useTable } from '../context/TableContext';
import { useToast } from "@/hooks/use-toast";
import FinancialControlNew from './FinancialControlNew';
import { useCaixa } from '../context/CaixaContext';

interface CaixaProps {
  onCaixaFechado?: () => void;
  setCaixaData?: (caixaData: any) => void;
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

const ControleDeCaixa: React.FC<CaixaProps> = ({ onCaixaFechado }) => {
  const { user } = useAuth();
  const { tables } = useTable();
  const { toast } = useToast();
  const { caixaAberto, setCaixaAberto } = useCaixa();
  const [valorFinal, setValorFinal] = useState<number>(0);
  const [valorInicial, setValorInicial] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caixaDataPersistida, setCaixaData] = useState<CaixaData | null>(null);
  const [caixaIdPersistido, setCaixaIdPersistido] = useState<string | null>(null);
  const [totalEntrada, setTotalEntrada] = useState<number>(0);
  const [totalSaida, setTotalSaida] = useState<number>(0);
  const [totalCompra, setTotalCompra] = useState<number>(0);
  const [saldoFinal, setSaldoFinal] = useState<number>(0);

const fetchTotalPdv = () => {
    try {
      const pdvCollection = collection(db, "pdvzero");
      const unsubscribe = onSnapshot(pdvCollection, (snapshot) => {
        let totalEntrada = 0;
        let totalSaida = 0;
        let totalCompra = 0;

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.tipo === 'entrada') {
            totalEntrada += data.valor || 0;
          } else if (data.tipo === 'saida') {
            totalSaida += data.valor || 0;
          } else if (data.tipo === 'compra') {
            totalCompra += data.valor || 0;
          } else if (data.tipo === 'inicio') {
			totalEntrada += data.valor || 0;
		  }
        });

        setTotalEntrada(totalEntrada);
        setTotalSaida(totalSaida);
        setTotalCompra(totalCompra);
        calculateSaldoFinal();
      });
      return unsubscribe;
    } catch (error) {
      console.error("Erro ao buscar os valores do PDV:", error);
    }
  };

  const clearPdvZeroCollection = async () => {
    try {
      const pdvZeroCollection = collection(db, "pdvzero");
      const querySnapshot = await getDocs(pdvZeroCollection);

      // Delete documents in batches
      const batchSize = 500; // Define the batch size
      let batch = writeBatch(db);
      let count = 0;

	  for (const doc of querySnapshot.docs) {
        batch.delete(doc.ref);
        count++;

        if (count >= batchSize) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      }

      // Commit the final batch
      if (count > 0) {
        await batch.commit();
      }

      console.log("Coleção pdvzero limpa com sucesso!");
    } catch (error) {
      console.error("Erro ao limpar a coleção pdvzero:", error);
    }
  };

  const calculateSaldoFinal = () => {
    const saldo = totalEntrada - totalSaida - totalCompra;
    setSaldoFinal(saldo);
  };

  console.log("ControleDeCaixa - caixaAberto:", caixaAberto);
  console.log("ControleDeCaixa - caixaData:", caixaDataPersistida);

  useEffect(() => {
  }, [caixaDataPersistida]);

  useEffect(() => {
    const unsubscribePdv = fetchTotalPdv();
	const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user) {
          return;
        }

        // Get the persisted caixa ID from Firebase
        const userDocRef = doc(db, 'usuarios', user.id);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const persistedCaixaId = userData.caixaAberto;
          setCaixaIdPersistido(persistedCaixaId);

          // Get caixaAberto and caixaData from sessionStorage
          let storedCaixaAberto = sessionStorage.getItem('caixaAberto');
          let storedCaixaData = sessionStorage.getItem('caixaData');

          if (storedCaixaAberto) {
            setCaixaAberto(storedCaixaAberto === 'true');
          }

          if (storedCaixaData) {
            try {
              setCaixaData(JSON.parse(storedCaixaData));
            } catch (error) {
              console.error("Erro ao analisar caixaData do sessionStorage:", error);
              sessionStorage.removeItem('caixaData');
            }
          } 

          if (persistedCaixaId) {
              const aberturadecaixaFechamentoCollection = collection(db, 'aberturadecaixa - fechamentodecaixa');
              const caixaDocRef = doc(aberturadecaixaFechamentoCollection, persistedCaixaId);
              const caixaDocSnap = await getDoc(caixaDocRef);

              if (caixaDocSnap.exists()) {
                const caixaData = { id: caixaDocSnap.id, ...caixaDocSnap.data() } as CaixaData;
                setCaixaData(caixaData);
                setCaixaAberto(caixaData.status === 'aberto');
                console.log("Caixa encontrado com ID:", caixaDocSnap.id, "e status:", caixaData.status);
              } else {
                setCaixaData(null);
                setCaixaAberto(false);
              }
          } else {
            setCaixaData(null);
            setCaixaAberto(false);
          }
        } else {
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
	return () => {
		unsubscribePdv();
	}
  }, [user, totalEntrada, totalSaida, totalCompra]);

  useEffect(() => {
    calculateSaldoFinal();
  }, [totalEntrada, totalSaida, totalCompra]);

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
      const dataAbertura = new Date().toLocaleDateString();
      const usuarioAbertura = user.id;
      const docId = `abertura-${Date.now()}`; // Usar timestamp como ID do documento
      const aberturadecaixaFechamentoCollection = collection(db, 'aberturadecaixa - fechamentodecaixa');
      const docRef = doc(aberturadecaixaFechamentoCollection, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Documento já existe, atualizar o status para 'aberto'
        await updateDoc(docRef, {
          status: 'aberto',
          valorInicial: valorInicial,
        });
        console.log("Caixa reaberto com ID:", docId);
      } else {
        // Documento não existe, criar um novo
        await setDoc(docRef, {
          dataAbertura,
          horaAbertura,
          usuarioAbertura,
          valorInicial: valorInicial,
          status: 'aberto',
          transactions: [], // Inicializa a lista de transações
        });
        console.log("Caixa aberto com ID:", docId);

        // Gravar na coleção /aberturadecaixa
        const aberturadecaixaCollection = collection(db, 'aberturadecaixa');
        await setDoc(doc(aberturadecaixaCollection, docId), {
          dataAbertura,
          horaAbertura,
          usuarioAbertura,
          valorInicial: valorInicial,
          status: 'aberto',
          transactions: [],
        });
        console.log("Informações gravadas na coleção /aberturadecaixa com ID:", docId);

        // Adicionar transação à coleção ControleFinanceiro
        const controleFinanceiroCollection = collection(db, 'ControleFinanceiro');
        await addDoc(controleFinanceiroCollection, {
          tipo: 'inicio',
          valor: valorInicial,
          descricao: 'Abertura de caixa',
          data: dataAbertura,
        });
        console.log("Transação de abertura de caixa gravada na coleção /ControleFinanceiro com ID:", docId);

		// Adicionar informações de abertura do caixa na coleção pdvzero
		const pdvZeroCollection = collection(db, "pdvzero");
		await addDoc(pdvZeroCollection, {
			tipo: 'abertura',
			valor: valorInicial,
			descricao: 'Abertura de caixa',
			data: dataAbertura,
			horaAbertura: horaAbertura,
			usuarioAbertura: user.id,
		});
		console.log("Informações de abertura de caixa gravadas na coleção /pdvzero com ID:", docId);
      }


      const caixaData = {
        id: docId,
        dataAbertura,
        horaAbertura,
        usuarioAbertura: user.id,
        valorInicial: valorInicial,
        status: 'aberto' as 'aberto',
        transactions: [],
      };
      setCaixaData(caixaData);
      setCaixaAberto(true); // Atualiza o estado do caixa no contexto
      console.log("ControleDeCaixa - setCaixaAberto(true)");
      sessionStorage.setItem('caixaAberto', 'true');
      sessionStorage.setItem('caixaData', JSON.stringify(caixaData));

      // Persist caixa ID to Firebase
      const userDocRef = doc(db, 'usuarios', user.id);
      await setDoc(userDocRef, { caixaAberto: docId }, { merge: true });
    } catch (e: any) {
      setError('Erro ao abrir caixa: ' + e.message);
      console.error("Erro ao abrir caixa:", e);
    }
  };

  const [caixaAberturaTransactionAdicionada, setCaixaAberturaTransactionAdicionada] = useState(false);

  const handleFecharCaixa = async () => {
    setError(null);
    console.log("Tentando fechar o caixa com ID:", caixaDataPersistida?.id); // Adicionado log
    setTotalEntrada(0);
    setTotalSaida(0);
    setTotalCompra(0);
    setSaldoFinal(0);

    let hasOpenTables = false;
    try {
      hasOpenTables = tables.some(table => table.status !== 'available');
      if (hasOpenTables) {
        toast({
          title: "Erro",
          description: "Não é possível fechar o caixa com mesas abertas.",
          variant: "destructive",
        });
        return;
      }

      setTotalEntrada(0);
      setTotalSaida(0);
      setTotalCompra(0);
      setSaldoFinal(0);

      if (!valorFinal) {
        setError('Valor final é obrigatório.');
        return;
      }

      if (user?.role !== 'Caixa' && user?.role !== 'gerente' && user?.role !== 'adm') {
        setError('Apenas usuários com a função de Caixa, gerente ou adm podem fechar o caixa.');
        return;
      }

      if (!caixaDataPersistida?.id) {
        setError('Nenhum caixa aberto encontrado para este usuário.');
        return;
      }

      // Buscar os valores atuais de Total de Entradas, Saídas e Compras
      const financialControlCollection = collection(db, 'ControleFinanceiro');
      const entradasQuery = query(financialControlCollection, where('tipo', '==', 'entrada'));
      const saidasQuery = query(financialControlCollection, where('tipo', '==', 'saida'));
      const comprasQuery = query(collection(db, 'ControleFinanceiro'), where('tipo', '==', 'compra'));

      const [entradasSnapshot, saidasSnapshot, comprasSnapshot] = await Promise.all([
        getDocs(entradasQuery),
        getDocs(saidasQuery),
        getDocs(comprasQuery),
      ]);

      const totalEntrada = entradasSnapshot.docs.reduce((sum, doc) => sum + doc.data().valor, 0);
      const totalSaida = saidasSnapshot.docs.reduce((sum, doc) => sum + doc.data().valor, 0);
      const totalCompra = comprasSnapshot.docs.reduce((sum, doc) => sum + doc.data().valor, 0);
      const saldoFinal = totalEntrada - totalSaida - totalCompra;

      setTotalEntrada(0);
      setTotalSaida(0);
      setTotalCompra(0);
      setSaldoFinal(0);

      setTotalEntrada(0);
      setTotalSaida(0);
      try {
        const horaFechamento = new Date().toLocaleTimeString();
        const dataAbertura = caixaDataPersistida?.dataAbertura || "";
        const usuarioAbertura = user?.id || "";
        const valorInicialCaixa = caixaDataPersistida?.valorInicial || 0;
        const horaAberturaCaixa = caixaDataPersistida?.horaAbertura || "";

        const docId = `fechamento-${Date.now()}`; // Usar timestamp como ID do documento
        const aberturadecaixaFechamentoCollection = collection(db, 'aberturadecaixa - fechamentodecaixa');
        await setDoc(doc(aberturadecaixaFechamentoCollection, docId), {
          dataAbertura: dataAbertura,
          horaAbertura: horaAberturaCaixa,
          usuarioAbertura: usuarioAbertura,
          valorInicial: valorInicialCaixa,
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

        setTotalEntrada(0);
        setTotalSaida(0);
        setTotalCompra(0);
        setSaldoFinal(0);

        console.log("Caixa fechado com ID:", docId);
      } catch (error: any) {
        setError('Erro ao fechar caixa: ' + error.message);
        console.error("Erro ao fechar caixa:", error);
        return;
      }

      setValorFinal(0);
      setCaixaAberto(false); // Atualiza o estado do caixa no contexto
      console.log("ControleDeCaixa - setCaixaAberto(false)");
      sessionStorage.removeItem('caixaAberto');
      sessionStorage.removeItem('caixaData');
      setCaixaData(null);
      if (onCaixaFechado) {
        onCaixaFechado();
      }

      // Remove persisted caixa ID from Firebase
      const userDocRef = doc(db, 'usuarios', user.id);
      await setDoc(userDocRef, { caixaAberto: null }, { merge: true });

      const horaFechamento = new Date().toLocaleTimeString();
      const docId = `fechamento-${Date.now()}`; // Usar timestamp como ID do documento

      // Gravar na coleção /fechamentodecaixa
      const fechamentodecaixaCollection = collection(db, 'fechamentodecaixa');
      await setDoc(doc(fechamentodecaixaCollection, docId), {
        dataAbertura: caixaDataPersistida?.dataAbertura || '',
        horaAbertura: horaFechamento,
        usuarioAbertura: user.id,
        valorInicial: caixaDataPersistida?.valorInicial || 0,
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
      console.log("Informações gravadas na coleção /fechamentodecaixa com ID:", docId);
    } catch (e: any) {
      setError('Erro ao fechar caixa: ' + e.message);
      console.error("Erro ao fechar caixa:", e);
    } finally {
		if (!hasOpenTables) {
			await clearPdvZeroCollection();
		}
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
        <FinancialControlNew
          setCaixaAberto={setCaixaAberto}
          caixaAberto={caixaAberto}
          valorInicial={caixaDataPersistida?.valorInicial || 0}
          totalEntrada={totalEntrada}
          totalSaida={totalSaida}
          totalCompra={totalCompra}
          saldoFinal={saldoFinal}
        />
        {user && caixaAberto && caixaDataPersistida ? (
          <div>
            <h2>Caixa Aberto</h2>
            <p>Data de Abertura: {caixaDataPersistida.dataAbertura}</p>
            <p>Hora de Abertura: {caixaDataPersistida.horaAbertura}</p>
            <p>Valor Inicial: {caixaDataPersistida.valorInicial} €</p>
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
