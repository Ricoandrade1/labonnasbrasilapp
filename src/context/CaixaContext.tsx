import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface CaixaContextProps {
  caixaAberto: boolean;
  setCaixaAberto: (aberto: boolean) => void;
}

const CaixaContext = createContext<CaixaContextProps | undefined>(undefined);

export const CaixaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [caixaAberto, setCaixaAberto] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const verificarCaixaAberto = async () => {
      try {
        if (!user) {
          return;
        }

        const dataAtual = new Date().toLocaleDateString();
        const fechamentodecaixaCollection = collection(db, 'fechamentodecaixa');
        const qFechado = query(
          fechamentodecaixaCollection,
          where('usuarioAbertura', '==', user.id),
          where('dataFechamento', '==', dataAtual)
        );
        const querySnapshotFechado = await getDocs(qFechado);

        if (!querySnapshotFechado.empty) {
          // Caixa fechado
          setCaixaAberto(false);
          console.log("Caixa já foi fechado (Firebase)");
        } else {
          // Caixa aberto ou não encontrado
          const aberturadecaixaCollection = collection(db, 'aberturadecaixa');
          const qAberto = query(
            aberturadecaixaCollection,
            where('usuarioAbertura', '==', user.id),
            where('dataAbertura', '==', dataAtual),
            where('status', '==', 'aberto')
          );
          const querySnapshotAberto = await getDocs(qAberto);
          setCaixaAberto(!querySnapshotAberto.empty);
        }
      } catch (error) {
        console.error("Erro ao verificar status do caixa:", error);
        setCaixaAberto(false);
      }
    };

    verificarCaixaAberto();
  }, [user]);

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
