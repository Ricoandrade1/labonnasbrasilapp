import { db } from "./firebase";
import { collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";

const addTables = async () => {
  const querySnapshot = await getDocs(collection(db, "table"));
  if (querySnapshot.empty) {
    for (let i = 1; i <= 50; i++) {
      try {
        const docRef = await addDoc(collection(db, "table"), {
          id: i,
          status: "available",
          orders: [],
          totalAmount: 0,
        });
        console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
  } else {
    querySnapshot.forEach(async docSnapshot => {
      const docRef = doc(db, "table", docSnapshot.id);
      await updateDoc(docRef, { status: 'available' });
    });
  }
};

export default addTables;
