import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const Test = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste</CardTitle>
          <CardDescription>
            Esta é uma tela de teste para verificar o estilo do componente Card.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Este é o conteúdo do componente Card.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Test;
