import React from 'react';
import { useTable } from '../context/TableContext';
import { Button } from '../components/ui/button';

const ResetTables = () => {
  const { setAllTablesAvailable } = useTable();

  const handleReset = () => {
    setAllTablesAvailable();
  };

  return (
    <Button onClick={handleReset}>
      Reset Tables
    </Button>
  );
};

export default ResetTables;
