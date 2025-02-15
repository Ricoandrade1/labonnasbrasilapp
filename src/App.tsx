import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Tables from "@/pages/Tables";
import MenuSelection from "@/pages/MenuSelection";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import Login from "@/pages/Login";
import SidebarMenu from "@/components/SidebarMenu";
import Test from "@/pages/Test";
import Cashier from "@/pages/Cashier";
import MenuSelectionCaixa from "@/pages/MenuSelectionCaixa";
import TableCaixa from "@/pages/TableCaixa";
import { TableProvider } from "@/context/TableContext";
import ResetTables from "./components/ResetTables";
import { useEffect } from 'react';
import { createUniqueTables } from './lib/firebase';

function App() {
  useEffect(() => {
    createUniqueTables();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <SidebarMenu />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/tables" element={<TableProvider><Tables /></TableProvider>} />
          <Route path="/tablecaixa" element={<TableProvider><TableCaixa /></TableProvider>} />
          <Route path="/menu" element={<TableProvider><MenuSelection /></TableProvider>} />
          <Route path="/caixa" element={<Cashier />} />
          <Route path="/gerente" element={<div>Página do Gerente</div>} />
          <Route path="/adm" element={<div>Página do Administrador</div>} />
          <Route path="/test" element={<Test />} />
          <Route path="/reset" element={<TableProvider><ResetTables /></TableProvider>} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
