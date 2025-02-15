import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, getDocs, updateDoc, onSnapshot, deleteDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { TableStatus } from "@/context/TableContext";

const firebaseConfig = {
  apiKey: "AIzaSyARukrdm6Toj98roAgUu37V22YPcaVPppU",
  authDomain: "apprestaurante-c5938.firebaseapp.com",
  projectId: "apprestaurante-c5938",
  storageBucket: "apprestaurante-c5938.firebasestorage.app",
  messagingSenderId: "990837413805",
  appId: "1:990837413805:web:79ceb367e18b026794b324",
  measurementId: "G-ZZF96JLMK8"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Inicializar auth
const db = getFirestore(app);

const addTable = async (tableData: {
  tableNumber: string | number;
  status: string;
  occupants?: number;
  timeSeated?: string;
  server?: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, "Mesas"), {
      ...tableData,
      orders: []
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    return null;
  }
};

const addTableWithId = async (tableId: string | number, tableData: {
  tableNumber: string | number;
  status: string;
  occupants?: number;
  timeSeated?: string;
  server?: string;
  orders?: any[];
  totalAmount?: number;
}) => {
  try {
    const tableRef = doc(db, "Mesas", String(tableId));
    await setDoc(tableRef, {
      ...tableData,
      orders: []
    });
    console.log("Document written with ID: ", tableId);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

const addOrder = async (orderData: {
  tableId: string;
  products: string[];
  total: number;
  paymentMethod: string;
  timestamp: string;
  responsibleName: string;
  status: string;
  source: string;
}) => {
  console.log("addOrder - orderData", orderData);
  try {
    // Adiciona o pedido em 'Pedidos'
    const pedidosRef = await addDoc(collection(db, "Pedidos"), orderData);
    console.log("Pedido adicionado em Pedidos com ID: ", pedidosRef.id);

    // Adiciona também em 'statusdemesa'
    const statusMesaRef = await addDoc(collection(db, "statusdemesa"), orderData);
    console.log("Pedido adicionado em statusdemesa com ID: ", statusMesaRef.id);

  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

const addProduct = async (productData: {
  name: string;
  description: string;
  price: number;
  category: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, "Produtos"), productData);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

const addTransaction = async (transactionData: {
  paymentMethod: string;
  amount: number;
  timestamp: string;
  tableId: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, "Transações"), transactionData);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

const getTables = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "Mesas"));
    const tables = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        tableNumber: data.tableNumber,
        total: data.totalAmount || 0,
        status: data.status,
        orders: data.orders || []
      };
    });
    return tables;
  } catch (e) {
    console.error("Error getting documents: ", e);
    console.error("Error details:", e);
    return [];
  }
};

const updateTableStatus = async (tableId: string, status: string) => {
  try {
    const tableRef = doc(db, "Mesas", tableId);
    await updateDoc(tableRef, { status });
    console.log(`Table ${tableId} status updated to ${status}`);
  } catch (e) {
    console.error("Error updating table status: ", e);
  }
};

const onTablesChange = (callback: (tables: any[]) => void) => {
  return onSnapshot(collection(db, "table"), (snapshot) => {
    try {
      const tables = snapshot.docs.map(doc => ({
        id: Number(doc.id),
        ...doc.data()
      }));
      callback(tables);
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  });
};


const clearOrders = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "Pedidos"));
    for (const doc of querySnapshot.docs) {
      await (doc as any).ref.delete();
    }
    console.log("All orders cleared from database");
  } catch (e) {
    console.error("Error clearing orders: ", e);
  }
};

const clearTables = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "Mesas"));
    for (const docSnapshot of querySnapshot.docs) {
      const docRef = doc(collection(db, "Mesas"), docSnapshot.id);
      await deleteDoc(docRef);
    }
    console.log("All tables cleared from database");
  } catch (e) {
    console.error("Error clearing tables: ", e);
  }
};


const checkTablesExists = async () => {
  const querySnapshot = await getDocs(collection(db, "Mesas"));
  return querySnapshot.size >= 50;
};

const createUniqueTables = async () => {
  const tablesExists = await checkTablesExists();
  if (!tablesExists) {
    for (let i = 1; i <= 50; i++) {
      const tableNumber = i;
      await addTableWithId(tableNumber, {
        tableNumber: tableNumber,
        status: "available",
        orders: [],
        totalAmount: 0,
      });
    }
    console.log("50 mesas únicas criadas no Firebase!");
  } else {
    console.log("As mesas já existem no Firebase.");
  }
};

export { auth, db, addTable, addOrder, addProduct, addTransaction, getTables, clearOrders, clearTables, updateTableStatus, onTablesChange, getDocs, collection, deleteDoc, doc, updateDoc, addDoc, createUniqueTables, addTableWithId, addTable as default }; // Export auth
