import app from "./supabaseClient";
import { clearFirebaseTables } from "./api";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const addTables = async () => {
  console.log("Starting addTables function");
  await clearFirebaseTables(); // Clear existing tables first
  console.log("Cleared existing Firebase tables (if any)");
  const db = getFirestore(app);
  console.log("Firestore instance initialized");

  const statuses = ["disponivel", "pendente", "ocupado"];
  const colors = ["verde", "azul", "vermelho"];

  for (let i = 1; i <= 50; i++) {
    const statusIndex = i % statuses.length;
    const status = statuses[statusIndex];
    const color = colors[statusIndex];

    try {
      console.log(`Attempting to add table ${i} with status ${status} and color ${color}`);
      const docRef = await addDoc(collection(db, 'tables'), {
        id: i,
        status: status,
        color: color,
        orders: [],
        totalAmount: 0,
      });
      
      console.log("Document written with ID: ", docRef.id);

    } catch (e) {
      console.error(`Error adding table ${i}:`, e);
      console.error("Error details:", e.message, e.code);
    }
  }
  console.log("Finished adding tables.");
};

export default addTables;
