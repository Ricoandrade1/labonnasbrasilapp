import React, { createContext, useState, useContext } from 'react';

interface CaixaContextProps {
  caixaAberto: boolean;
  setCaixaAberto: (aberto: boolean) => void;
}

const CaixaContext = createContext<CaixaContextProps | undefined>(undefined);

export const CaixaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [caixaAberto, setCaixaAberto] = useState(false);

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
