import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Tables from "@/pages/Tables";
import MenuSelection from "@/pages/MenuSelection";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Login from "@/pages/Login";
import SidebarMenu from "@/components/SidebarMenu";
import Test from "@/pages/Test";
import Cashier from "@/pages/Cashier";
import MenuSelectionCaixa from "@/pages/MenuSelectionCaixa";
import { CaixaProvider } from "@/context/CaixaContext";
import { TableProvider } from "@/context/TableContext";
import ResetTables from "./components/ResetTables";
import { createUniqueTables } from './lib/firebase';

import { ReactNode, useMemo, useContext } from 'react';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated } = useAuth();
  console.log("PrivateRoute - isAuthenticated:", isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  useEffect(() => {
    createUniqueTables();
  }, []);

  const { isAuthenticated } = useAuth();

  return (
    <AuthProvider>
      <CaixaProvider>
        <Router>
          <TableProvider>
            {isAuthenticated && <SidebarMenu />}
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/tables"
                element={
                  <PrivateRoute>
                    <Tables />
                  </PrivateRoute>
                }
              />
              <Route
                path="/menu"
                element={
                  <PrivateRoute>
                    <MenuSelection />
                  </PrivateRoute>
                }
              />
              <Route
                path="/cashier"
                element={
                  <PrivateRoute>
                    <Cashier />
                  </PrivateRoute>
                }
              />
              <Route
                path="/gerente"
                element={
                  <PrivateRoute>
                    <div>Página do Gerente</div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/adm"
                element={
                  <PrivateRoute>
                    <div>Página do Administrador</div>
                  </PrivateRoute>
                }
              />
              <Route path="/test" element={<PrivateRoute><Test /></PrivateRoute>} />
              <Route
                path="/reset"
                element={
                  <PrivateRoute>
                    <ResetTables />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
            <Toaster />
          </TableProvider>
        </Router>
      </CaixaProvider>
    </AuthProvider>
  );
}

export default App;
