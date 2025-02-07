import app from "./supabaseClient";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const getSupabaseTables = async () => {
  const db = getFirestore(app);
  const tablesCollection = collection(db, 'tables');

  try {
    const querySnapshot = await getDocs(tablesCollection);
    const tables: any[] = [];
    querySnapshot.forEach((doc) => {
      tables.push({ id: Number(doc.id), status: doc.data().status }); // Assuming doc.id is tableId and status is in doc.data()
    });
    console.log("Successfully fetched tables from Firebase");
    return tables;
  } catch (error) {
    console.error("Error fetching tables:", error);
    return [];
  }
};

export default getSupabaseTables;
