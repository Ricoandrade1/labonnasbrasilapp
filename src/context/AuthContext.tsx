import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc, getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import app, { getFirestoreInstance } from "@/lib/firebase";

type Role = "Caixa" | "gerente" | "adm" | "garcom" | "Função não definida";

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

  useEffect(() => {
    console.log("AuthProvider montado");
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const storedUserParsed = JSON.parse(storedUser);
      const user: User = {
        id: storedUserParsed.id,
        name: storedUserParsed.name,
        role: storedUserParsed.role,
        storeId: storedUserParsed.storeId,
      };
      console.log("Usuário recuperado do sessionStorage:", user);
      setUser(user);
      setCaixaAberto(true);
    } else {
      console.log("Nenhum usuário encontrado no sessionStorage.");
    }
    return () => {
      console.log("AuthProvider desmontado");
    };
  }, []);

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
        console.log("AuthContext.tsx - userData:", userData);
        const loggedInUser: User = {
          id: userData.email,
          name: userData.nome,
          role: userData.role ? userData.role as Role : "Função não definida",
          storeId: "1",
        };
        console.log("Role do usuário:", loggedInUser.role);
        // const isCaixaAberto = await verificarCaixaAberto(loggedInUser.id);
        // if (!isCaixaAberto) {
        //   throw new Error("Caixa precisa ser aberto");
        // }
        console.log("AuthContext.tsx - loggedInUser:", loggedInUser);
        setUser(loggedInUser);
        setCaixaAberto(true);
        console.log("AuthContext.tsx - loggedInUser.role:", loggedInUser.role);
        sessionStorage.setItem("user", JSON.stringify(loggedInUser));
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
    sessionStorage.removeItem("user");
  };

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

export { AuthContext };
