import React, { createContext, useState, useContext, useEffect } from 'react';
import { db, doc, getDoc, setDoc } from '../lib/api';

interface CaixaContextProps {
  caixaAberto: boolean;
  setCaixaAberto: (aberto: boolean) => void;
}

const CaixaContext = createContext<CaixaContextProps | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'caixaAberto';

export const CaixaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [caixaAberto, setCaixaAberto] = useState(() => {
    const storedValue = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedValue === 'true' ? true : false;
  });

  useEffect(() => {
    const fetchCaixaAberto = async () => {
      try {
        const docRef = doc(db, "Caixa", "estado");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const aberto = docSnap.data().aberto || false;
          setCaixaAberto(aberto);
          localStorage.setItem(LOCAL_STORAGE_KEY, String(aberto));
        } else {
          console.log("Documento 'estado' não encontrado na coleção 'Caixa'.");
          // Se o documento não existir, cria um com o valor inicial de caixaAberto como false
          await setDoc(docRef, { aberto: false });
          localStorage.setItem(LOCAL_STORAGE_KEY, 'false');
        }
      } catch (error) {
        console.error("Erro ao buscar o estado do caixa no Firebase:", error);
      }
    };

    fetchCaixaAberto();
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

    localStorage.setItem(LOCAL_STORAGE_KEY, String(caixaAberto));
  }, [caixaAberto]);

  return (
    <CaixaContext.Provider value={{ caixaAberto, setCaixaAberto }}>
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
