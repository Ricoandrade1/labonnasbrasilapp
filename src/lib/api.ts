import app from "./supabaseClient";
import { getFirestore, collection, getDocs, deleteDoc, doc, addDoc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { OrderItem, TableOrder } from "../types";

export const clearFirebaseTables = async () => {
  const db = getFirestore(app);
  const tablesCollection = collection(db, 'tables');

  try {
    const querySnapshot = await getDocs(tablesCollection);
    querySnapshot.forEach(async (document) => {
      if (document.data().id !== 0) { // Assuming 'id' field exists in your documents
        await deleteDoc(doc(db, 'tables', document.id));
      }
    });
    console.log("Successfully cleared all tables in Firebase");
  } catch (error) {
    console.error("Error clearing tables:", error);
  }
};

export const addFirebaseOrder = async (tableOrder: TableOrder, source: string) => {
  console.log("Adding order to Firebase:", tableOrder);
  console.log("tableOrder data:", tableOrder); // Log tableOrder data
  console.log("tableOrder.items (JSON):", JSON.stringify(tableOrder.items)); // Log items as JSON string

  const db = getFirestore(app);
  try {
    const docRef = await addDoc(collection(db, 'orders'), {
      tableId: tableOrder.tableId,
      responsibleName: tableOrder.responsibleName,
      items: JSON.stringify(tableOrder.items), // Store items as JSON
      total: tableOrder.total,
      timestamp: tableOrder.timestamp,
      status: tableOrder.status, // Add status here
      id: tableOrder.id,
      source: source,
      paymentMethod: tableOrder.paymentMethod, // Include paymentMethod
    });

    console.log("Document written with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding order:", error);
  }
};

export const onFirebaseTablesChange = (callback: (tables: any[]) => void) => {
  const db = getFirestore(app);
  const tablesCollection = collection(db, 'tables');

  const unsubscribe = onSnapshot(tablesCollection, (querySnapshot) => {
    const tables: any[] = [];
    querySnapshot.forEach((doc) => {
      tables.push(doc.data());
    });
    callback(tables);
    console.log("Firebase tables data updated!"); // Log Firebase update
  }, (error) => {
    console.error("Error fetching tables from Firebase:", error);
  });

  return unsubscribe;
};

export const onFirebaseOrdersChange = (callback: (payload: any) => void) => {
  const db = getFirestore(app);
  const ordersCollection = collection(db, 'orders');

  const unsubscribe = onSnapshot(ordersCollection, (querySnapshot) => {
    querySnapshot.docChanges().forEach((change) => {
      if (change.type === "added" || change.type === "modified" || change.type === "removed") {
        console.log("Firebase order data changed:", change);
        callback(change); // Pass the change object to the callback
      }
    });
    console.log("Firebase orders data updated!"); // Log Firebase update
  }, (error) => {
    console.error("Error fetching orders from Firebase:", error);
  });

  return unsubscribe;
};


export const updateFirebaseTable = async (tableId: number, newStatus: string) => {
  const db = getFirestore(app);
  try {
    const tableDocRef = doc(db, 'tables', String(tableId)); // Firestore document IDs are strings
    await updateDoc(tableDocRef, { status: newStatus });
    console.log("Successfully updated table in Firebase");
  } catch (error) {
    console.error("Error updating table:", error);
  }
};

export const updateFirebaseOrder = async (orderId: string, newStatus: string) => {
  const db = getFirestore(app);
  try {
    const orderDocRef = doc(db, 'orders', orderId);
    await updateDoc(orderDocRef, { status: newStatus });
    console.log("Successfully updated order in Firebase");
  } catch (error) {
    console.error("Error updating order:", error);
  }
};

export const setFirebaseTableToOccupied = async (tableId: number) => {
  const db = getFirestore(app);
  try {
    const tableDocRef = doc(db, 'tables', String(tableId));
    await updateDoc(tableDocRef, { status: "occupied" });
    console.log("Successfully set table to occupied in Firebase");
  } catch (error) {
    console.error("Error setting table to occupied:", error);
  }
};

export const getFirebaseOrdersForTable = async (tableId: number) => {
  const db = getFirestore(app);
  try {
    const ordersCollection = collection(db, 'orders');
    const q = query(ordersCollection, where('tableId', '==', tableId));
    const querySnapshot = await getDocs(q);
    const orders: any[] = [];
    querySnapshot.forEach((doc) => {
      orders.push(doc.data());
    });
    console.log("Successfully fetched orders for table from Firebase");
    return orders;
  } catch (error) {
    console.error("Error fetching orders for table:", error);
    return [];
  }
};

export const getFirebaseMenuItems = async () => {
  const db = getFirestore(app);
  try {
    const menuItemsCollection = collection(db, 'menu_items');
    const querySnapshot = await getDocs(menuItemsCollection);
    const menuItems: any[] = [];
    querySnapshot.forEach((doc) => {
      menuItems.push(doc.data());
    });
    console.log("Successfully fetched menu items from Firebase");
    return menuItems;
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }
};

export const addFirebaseTable = async (tableData: { tableNumber: string; status: string }) => {
  const db = getFirestore(app);
  try {
    const docRef = await addDoc(collection(db, 'tables'), tableData);
    console.log("Successfully added table to Firebase with ID: ", docRef.id);
    return { data: { ...tableData, id: docRef.id } }; // Return similar data structure
  } catch (error) {
    console.error("Error adding table:", error);
    return null;
  }
};
