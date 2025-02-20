import React from 'react';
import { useCaixa } from '../context/CaixaContext';

interface CaixaFechadoAvisoProps {
  children?: React.ReactNode;
}

const CaixaFechadoAviso: React.FC<CaixaFechadoAvisoProps> = ({ children }) => {
  const { caixaAberto } = useCaixa();

  if (caixaAberto) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      color: 'white',
      fontSize: '1.2em',
      textAlign: 'center',
      pointerEvents: 'none',
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        padding: '10px',
        borderRadius: '10px',
        maxWidth: '90%',
        margin: '0 auto',
        pointerEvents: 'auto',
        fontSize: '0.9em',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      >
        <p>🔔 ATENÇÃO! O CAIXA AINDA NÃO FOI ABERTO 🔔</p>
        <p>💰 Para iniciar o atendimento, peça ao caixa ou ao gerente para abrir o caixa e informar o valor inicial de operação.</p>
        <p>⚠️ IMPORTANTE:</p>
        <p>✅ Todos os registros devem ser feitos com máxima atenção.</p>
        <p>🚫 Nenhuma comanda pode ser cancelada sem a validação dos administradores.</p>
        <p>💳 Caso haja qualquer divergência financeira, os responsáveis serão notificados e deverão prestar esclarecimentos.</p>
        <p>Aguarde a liberação do sistema para continuar os atendimentos.</p>
        {children}
      </div>
    </div>
  );
};

export default CaixaFechadoAviso;
