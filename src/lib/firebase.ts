import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJQl6t7LyOlAPhQ11UZCGqPv--4nfvoYs",
  authDomain: "labonnasbrasil-ab1cb.firebaseapp.com",
  projectId: "labonnasbrasil-ab1cb",
  storageBucket: "labonnasbrasil-ab1cb.firebasestorage.app",
  messagingSenderId: "1042659454330",
  appId: "1:1042659454330:web:b70f247d2172f115003ac3",
  measurementId: "G-27F961QLCG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const addTable = async (tableData: {
  tableNumber: string;
  status: string;
  occupants?: number;
  timeSeated?: string;
  server?: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, "Mesas"), tableData);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    return null;
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
    const docRef = await addDoc(collection(db, "Pedidos"), orderData);
    console.log("Document written with ID: ", docRef.id);
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
    const tables = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return tables;
  } catch (e) {
    console.error("Error getting documents: ", e);
    return [];
  }
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
    for (const doc of querySnapshot.docs) {
      await (doc as any).ref.delete();
    }
    console.log("All tables cleared from database");
  } catch (e) {
    console.error("Error clearing tables: ", e);
  }
};

export { db, addTable, addOrder, addProduct, addTransaction, getTables, clearOrders, clearTables };
