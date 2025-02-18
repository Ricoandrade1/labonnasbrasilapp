import React from 'react';
import ControleDeCaixa from './ControleDeCaixa';

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

import { useEffect } from 'react';

const Caixa: React.FC<CaixaProps> = ({ caixaAberto, setCaixaAberto, onCaixaFechado, setCaixaData, totalEntrada, setTotalEntrada, totalSaida, setTotalSaida, totalCompra, setTotalCompra, saldoFinal, setSaldoFinal }) => {
  useEffect(() => {
    setCaixaAberto(caixaAberto);
  }, [caixaAberto, setCaixaAberto]);

  return (
    <ControleDeCaixa caixaAberto={caixaAberto} setCaixaAberto={setCaixaAberto} onCaixaFechado={onCaixaFechado} setCaixaData={setCaixaData} totalEntrada={totalEntrada} setTotalEntrada={setTotalEntrada} totalSaida={totalSaida} setTotalSaida={setTotalSaida} totalCompra={totalCompra} setTotalCompra={setTotalCompra} saldoFinal={saldoFinal} setSaldoFinal={setSaldoFinal}/>
  );
};

export default Caixa;
