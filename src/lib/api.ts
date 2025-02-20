import {
  auth,
  db,
  addTable,
  addOrder,
  addProduct,
  addTransaction,
  getTables,
  clearOrders,
  clearTables,
  updateTableStatus,
  onTablesChange,
  getDocs,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
  createUniqueTables,
  addTableWithId,
  onSnapshot
} from "./firebase";
import { getDoc, setDoc, query, where, orderBy, limit } from "firebase/firestore";
import { TableOrder, OrderItem } from "../types";
import { User } from "@/context/AuthContext";
import { TableStatus } from "@/context/TableContext";

export { query, where, orderBy, limit };

const addTransactionToControleFinanceiro = async (type: string, amount: number, description: string) => {
  try {
    const docRef = await addDoc(collection(db, "ControleFinanceiro"), {
      tipo: type,
      valor: amount,
      descricao: description,
      data: new Date().toISOString(),
    });
    console.log("api.ts - addTransactionToControleFinanceiro - Document written with ID: ", docRef.id);


    return docRef.id;
  } catch (e) {
    console.error("api.ts - addTransactionToControleFinanceiro - Error adding document: ", e);
    return null;
  }
};

const updateTableStatusInFirebase = async (tableId: string, status: TableStatus) => {
  try {
    const tableRef = doc(db, "Mesas", tableId);
    if (status === "occupied") {
      await updateDoc(tableRef, { status: status, openingTime: new Date().toISOString() });
    } else {
      await updateDoc(tableRef, { status: status });
    }
    console.log(`api.ts - updateTableStatusInFirebase - Table ${tableId} status updated to ${status}`);
  } catch (e) {
    console.error("api.ts - updateTableStatusInFirebase - Error updating table status: ", e);
  }
};

const getFirebaseOrderHistory = async (tableId: string) => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, "Pedidos"),
        where("tableId", "==", tableId),
        orderBy("timestamp", "desc")
      )
    );
    const orders: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const items = typeof data.items === 'string' ? JSON.parse(data.items) : data.items;
      orders.push({
        id: doc.id,
        responsibleName: data.responsibleName,
        items: items,
        total: data.total,
        timestamp: data.timestamp,
        status: data.status,
      });
    });
    console.log(`api.ts - getFirebaseOrderHistory - Successfully fetched order history for table ${tableId} from Firebase`);
    console.log(`api.ts - getFirebaseOrderHistory - orders:`, orders);
    return orders;
  } catch (error) {
    console.error("api.ts - getFirebaseOrderHistory - Error fetching order history:", error);
    return [];
  }
};

const closeTableAndRegisterPayment = async (tableId: string, totalAmount: number) => {
  try {
    // 1. Update table status to "available"
    await updateTableStatusInFirebase(tableId, "available");

    // 2. Add a transaction to "ControleFinanceiro"
    await addTransactionToControleFinanceiro("entrada", totalAmount, `Fechamento da mesa ${tableId}`);

    // 3. Fetch the most recent order for the table
    const querySnapshot = await getDocs(
      query(
        collection(db, "Pedidos"),
        where("tableId", "==", tableId),
        orderBy("timestamp", "desc"),
        limit(1)
      )
    );

    // 4. Update the order status to "completed"
    if (!querySnapshot.empty) {
      const orderDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "Pedidos", orderDoc.id), {
        status: "completed",
      });
      console.log(`api.ts - closeTableAndRegisterPayment - Order ${orderDoc.id} status updated to completed`);
    }

    console.log("api.ts - closeTableAndRegisterPayment - Table ${tableId} closed and payment registered.");
  } catch (error) {
    console.error("api.ts - closeTableAndRegisterPayment - Error closing table and registering payment:", error);
  }
};

async function addOrderToFirebase(tableId: string, order: TableOrder, user: User | null, paymentMethod: string) {
  try {
    const docRef = await addDoc(collection(db, "Pedidos"), {
      tableId: tableId,
      items: order.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total: order.total,
      paymentMethod: paymentMethod,
      timestamp: new Date().toISOString(),
      responsibleName: order.responsibleName, // Use order.responsibleName instead of user?.name || "Unknown User"
      status: "pending",
      source: "web",
    });
    console.log("api.ts - addOrderToFirebase - Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("api.ts - addOrderToFirebase - Error adding document: ", e);
    return null;
  }
}

export {
  auth,
  db,
  addTable,
  addOrder,
  addProduct,
  addTransaction,
  getTables,
  clearOrders,
  clearTables,
  updateTableStatus,
  onTablesChange,
  getDocs,
  collection,
  deleteDoc,
  doc,
  updateDoc,
  addDoc,
  createUniqueTables,
  addTableWithId,
  addOrderToFirebase,
  updateTableStatus as updateOrderStatus,
  updateTableStatusInFirebase,
  getFirebaseOrderHistory,
  getDoc,
  setDoc,
  addTransactionToControleFinanceiro,
  closeTableAndRegisterPayment,
  onSnapshot
};
