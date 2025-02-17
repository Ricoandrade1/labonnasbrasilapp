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
import TableCaixa from "@/pages/TableCaixa";
import { TableProvider } from "@/context/TableContext";
import ResetTables from "./components/ResetTables";
import { createUniqueTables } from './lib/firebase';

import { ReactNode } from 'react';

interface PrivateRouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <div>Não autenticado</div>;
  }
  return children;
}

function App() {
  useEffect(() => {
    createUniqueTables();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <TableProvider>
          <SidebarMenu />
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
              path="/tablecaixa"
              element={
                <PrivateRoute>
                  <TableCaixa />
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
    </AuthProvider>
  );
}

export default App;
