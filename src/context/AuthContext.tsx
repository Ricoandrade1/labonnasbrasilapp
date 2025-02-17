import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc, getFirestore, collection, query, where, getDocs } from "firebase/firestore";
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
  const [caixaAberto, setCaixaAberto] = useState<boolean>(false);
  const db = getFirestoreInstance();

  const verificarCaixaAberto = async (userId: string): Promise<boolean> => {
    try {
      const caixasCollection = collection(db, 'aberturadeciaxa - fechamentodecaixa');
      const q = query(caixasCollection, where('status', '==', 'aberto'), where('usuarioAbertura', '==', userId));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Erro ao verificar status do caixa:", error);
      return false;
    }
  };

  const login = async (email: string) => {
    console.log("Função login chamada com email:", email);
    try {
      const userDoc = await getDoc(doc(db, "user", email));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("Dados do usuário do Firestore:", userData);
        const loggedInUser: User = {
          id: userData.email,
          name: userData.nome,
          role: "owner",
          storeId: "1",
        };
        console.log("Role do usuário:", loggedInUser.role);
        // const isCaixaAberto = await verificarCaixaAberto(loggedInUser.id);
        // if (!isCaixaAberto) {
        //   throw new Error("Caixa precisa ser aberto");
        // }
        setUser(loggedInUser);
        setCaixaAberto(true);
        localStorage.clear();
        localStorage.setItem("user", JSON.stringify(loggedInUser));
      } else {
        throw new Error("Usuário não encontrado");
      }
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.message === "Usuário não encontrado") {
        console.error("Usuário não encontrado");
      } else if (error.message === "Caixa precisa ser aberto") {
        console.error("Caixa precisa ser aberto");
        // throw new Error("Caixa precisa ser aberto");
      } else {
        console.error("Erro ao fazer login", error);
      }
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setCaixaAberto(false);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      verificarCaixaAberto(user.id).then(isCaixaAberto => {
        if (isCaixaAberto) {
          setUser(user);
          setCaixaAberto(true);
        }
      });
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
