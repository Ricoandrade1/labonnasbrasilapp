import supabase from "./supabaseClient";

const getSupabaseTables = async () => {
  const { data, error } = await supabase
    .from('tables')
    .select('*')

  if (error) {
    console.error("Error fetching tables:", error);
    return [];
  }

  const getOrdersForTable = async (tableId: number) => {
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('id, tableId, products, total, paymentMethod, timestamp, responsibleName, status, source')
      .eq('tableid', tableId);

    if (ordersError) {
      console.error("Error fetching orders for table:", ordersError);
      return [];
    }

    return ordersData || [];
  };

  // Fetch orders for each table
  const tablesWithOrdersPromises = data?.map(async table => {
    const orders = await getOrdersForTable(table.id);
    return {
      ...table,
      orders: orders || []
    };
  }) || [];

  const tablesWithOrders = await Promise.all(tablesWithOrdersPromises);

  return tablesWithOrders;
};

export default getSupabaseTables;
