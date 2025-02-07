import app from "./supabaseClient";
import { clearFirebaseTables } from "./api";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const addTables = async () => {
  await clearFirebaseTables(); // Clear existing tables first
  const db = getFirestore(app);

  for (let i = 1; i <= 50; i++) {
    try {
      const docRef = await addDoc(collection(db, 'tables'), {
        id: i,
        status: "available",
        orders: [],
        totalAmount: 0,
      });
      
      console.log("Document written with ID: ", docRef.id);


    } catch (e) {
      console.error("Error adding table:", e);
    }
  }
};

export default addTables;
