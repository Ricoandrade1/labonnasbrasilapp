import { addTable } from "./firebase";

const create50Tables = async () => {
  for (let i = 1; i <= 50; i++) {
    await addTable({
      tableNumber: i,
      status: "available",
    });
  }
};

create50Tables();
