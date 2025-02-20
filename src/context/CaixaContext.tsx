import React, { createContext, useState, useContext, useEffect } from 'react';
import { db, doc, getDoc, setDoc, collection, getDocs, onSnapshot } from '../lib/api';

interface CaixaContextProps {
  caixaAberto: boolean;
  setCaixaAberto: (aberto: boolean) => void;
  totalCaixa: number;
  setTotalEntrada: (totalEntrada: number) => void;
  setTotalSaida: (totalSaida: number) => void;
  setTotalCompra: (totalCompra: number) => void;
  setSaldoFinal: (saldoFinal: number) => void;
}

const CaixaContext = createContext<CaixaContextProps | undefined>(undefined);

export const CaixaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [totalCaixa, setTotalCaixa] = useState(0);
  const [totalEntrada, setTotalEntrada] = useState<number>(0);
  const [totalSaida, setTotalSaida] = useState<number>(0);
  const [totalCompra, setTotalCompra] = useState<number>(0);
  const [saldoFinal, setSaldoFinal] = useState<number>(0);

  const fetchTotalPdv = async () => {
    try {
      const pdvCollection = collection(db, "pdv");
      const pdvSnapshot = await getDocs(pdvCollection);
      let total = 0;
      pdvSnapshot.forEach((doc) => {
        const data = doc.data();
        total += data.total || 0;
      });
      setTotalCaixa(total);
    } catch (error) {
      console.error("Erro ao buscar os valores do PDV:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "Caixa", "estado"), async (doc) => {
      if (doc.exists()) {
        const aberto = doc.data().aberto || false;
        setCaixaAberto(aberto);
      } else {
        console.log("Documento 'estado' não encontrado na coleção 'Caixa'.");
        // Se o documento não existir, cria um com o valor inicial de caixaAberto como false
        await setDoc(doc(db, "Caixa", "estado"), { aberto: false });
      }
    });

    fetchTotalPdv();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateCaixaAberto = async () => {
      try {
        const docRef = doc(db, "Caixa", "estado");
        await setDoc(docRef, { aberto: caixaAberto });
      } catch (error) {
        console.error("Erro ao atualizar o estado do caixa no Firebase:", error);
      }
    };

    updateCaixaAberto();
  }, [caixaAberto]);

  return (
    <CaixaContext.Provider value={{ caixaAberto, setCaixaAberto, totalCaixa, setTotalEntrada, setTotalSaida, setTotalCompra, setSaldoFinal }}>
      {children}
    </CaixaContext.Provider>
  );
};

export const useCaixa = () => {
  const context = useContext(CaixaContext);
  if (!context) {
    throw new Error('useCaixa deve ser usado dentro de um CaixaProvider');
  }
  return context;
};
