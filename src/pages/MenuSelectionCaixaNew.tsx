import React from "react";
import MenuSelectionNew from "../components/MenuSelectionNew";
import { OrderManagerProvider } from "../components/OrderManager";

const MenuSelectionPage = () => {
  return (
    <OrderManagerProvider>
      <MenuSelectionNew />
    </OrderManagerProvider>
  );
};

export default MenuSelectionPage;
