import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import app, { getFirestoreInstance } from "@/lib/firebase";

type Role = "owner" | "manager" | "cashier" | "waiter" | "caixa";

interface User {
  id: string;
  name: string;
  role: Role;
  storeId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const db = getFirestoreInstance();

  const login = async (email: string) => {
    console.log("Função login chamada com email:", email); // Adicionado log
    try {
      const userDoc = await getDoc(doc(db, "user", email));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("Dados do usuário do Firestore:", userData); // Adicionado log
        const loggedInUser: User = {
          id: userData.email,
          name: userData.nome,
          role: userData.funcao,
          storeId: "1",
        };
        console.log("Role do usuário:", loggedInUser.role); // Adicionado log
        setUser(loggedInUser);
        localStorage.clear(); // Limpar o localStorage antes de salvar os dados do usuário
        localStorage.setItem("user", JSON.stringify(loggedInUser));
      } else {
        throw new Error("Usuário não encontrado");
      }
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.message === "Usuário não encontrado") {
        console.error("Usuário não encontrado");
      } else {
        console.error("Erro ao fazer login", error);
      }
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a TableProvider');
  }
  return context;
};

export type { AuthContextType, User };
