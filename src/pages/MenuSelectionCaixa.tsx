import React from "react";
import MenuSelectionCaixaNew from "./MenuSelectionCaixaNew";
import { OrderManagerProvider } from "../components/OrderManager";

const MenuSelectionCaixaPage = () => {
  return (
    <OrderManagerProvider>
      <MenuSelectionCaixaNew />
    </OrderManagerProvider>
  );
};

export default MenuSelectionCaixaPage;
