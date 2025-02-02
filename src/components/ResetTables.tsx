import React, { useEffect } from 'react';
import { useTable } from '../context/TableContext';
import { clearOrders } from '../lib/firebase';

const ResetTables = () => {
  const { setAllTablesAvailable } = useTable();

  useEffect(() => {
    const reset = async () => {
      setAllTablesAvailable();
      await clearOrders();
      window.location.reload();
    };
    reset();
  }, [setAllTablesAvailable]);

  return (
    <div>
      Resetting tables...
    </div>
  );
};

export default ResetTables;
