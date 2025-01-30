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

function App() {
  return (
    <AuthProvider>
      <Router>
        <SidebarMenu />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<TableCaixa />} />
          <Route path="/tables" element={<Tables />} />
          <Route path="/menu" element={<MenuSelection />} />
          <Route path="/menu?tablecaixa=" element={<MenuSelectionCaixa />} />
          <Route path="/caixa" element={<Cashier />} />
          <Route path="/gerente" element={<div>Página do Gerente</div>} />
          <Route path="/adm" element={<div>Página do Administrador</div>} />
          <Route path="/test" element={<Test />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
