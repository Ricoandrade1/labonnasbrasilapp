import React from 'react';
import ControleDeCaixa from './ControleDeCaixa';

interface CaixaProps {
  caixaAberto: boolean;
  setCaixaAberto: (aberto: boolean) => void;
}

const Caixa: React.FC<CaixaProps> = ({ caixaAberto, setCaixaAberto }) => {
  return (
    <ControleDeCaixa caixaAberto={caixaAberto} setCaixaAberto={setCaixaAberto} />
  );
};

export default Caixa;
