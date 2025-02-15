import { db, collection, getDocs, deleteDoc, doc } from "./firebase";

const removeExtraTables = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "Mesas"));
    const tables = querySnapshot.docs.map(doc => ({ id: doc.id, tableNumber: doc.data().tableNumber }));

    if (tables.length > 50) {
      // Sort tables by tableNumber (assuming it's a string)
      tables.sort((a, b) => parseInt(a.tableNumber) - parseInt(b.tableNumber));

      // Remove tables with tableNumber greater than 50
      for (let i = 50; i < tables.length; i++) {
        const table = tables[i];
        await deleteDoc(doc(db, "Mesas", table.id));
        console.log(`Mesa ${table.tableNumber} removida.`);
      }
      console.log("Mesas extras removidas.");
    } else {
      console.log("Não há mesas extras para remover.");
    }
  } catch (error) {
    console.error("Erro ao remover mesas extras:", error);
  }
};

removeExtraTables();
