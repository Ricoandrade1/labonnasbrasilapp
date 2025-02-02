import React from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import PDVPanel from "../components/PDVPanel";

const CashierNew = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Painel Caixa</CardTitle>
          <CardDescription>
            Sistema de PDV para finalizar pedidos e receber pagamentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PDVPanel />
          <div className="mt-4 border p-4 rounded-md">
            <CardTitle>Opções de Pagamento</CardTitle>
            <p>Selecione a forma de pagamento para finalizar o pedido.</p>
            <div className="flex space-x-4 mt-4">
              <Button variant="default" onClick={() => alert('Dinheiro selecionado')}>
                Dinheiro
              </Button>
              <Button variant="default" onClick={() => alert('MBWay selecionado')}>
                MBWay
              </Button>
              <Button variant="default" onClick={() => alert('MultiBanco selecionado')}>
                MultiBanco
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashierNew;
