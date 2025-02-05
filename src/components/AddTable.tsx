import React, { useState } from 'react';
import { db, addTable } from '../lib/firebase';
import { collection, getDocs } from "firebase/firestore";

const AddTable = () => {
  const [tableNumber, setTableNumber] = useState('');
  const [status, setStatus] = useState('available');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tableNumber) {
      await addTable({
        tableNumber: tableNumber,
        status: status,
      });
      setTableNumber('');
      setStatus('available');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="tableNumber">Número da Mesa:</label>
        <input
          type="text"
          id="tableNumber"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="status">Status:</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="available">Disponível</option>
          <option value="occupied">Ocupada</option>
          <option value="closing">Fechando</option>
        </select>
      </div>
      <button type="submit">Adicionar Mesa</button>
    </form>
  );
};

export default AddTable;
