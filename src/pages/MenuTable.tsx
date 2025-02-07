import React from "react";
import MenuTable from "../components/MenuTable"; // Importe o novo componente
import { OrderManagerProvider } from "../components/OrderManager";

const MenuTableNewPage = () => { // Renomeie o componente da página
  return (
    <OrderManagerProvider>
      <MenuTable /> {/* Use o novo componente aqui */}
    </OrderManagerProvider>
  );
};

export default MenuTableNewPage; // Renomeie a exportação padrão
