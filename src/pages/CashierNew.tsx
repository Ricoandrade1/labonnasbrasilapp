import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const CashierNew = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Caixa</CardTitle>
          <CardDescription>
            Esta é uma nova tela do caixa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Este é o conteúdo da nova tela do caixa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashierNew;
