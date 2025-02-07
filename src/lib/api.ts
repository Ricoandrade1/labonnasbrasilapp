import supabase from "./supabaseClient";


export const clearSupabaseTables = async () => {
  const { error } = await supabase
    .from('tables')
    .delete()
    .neq('id', 0); // Evita deletar a mesa com ID 0 (se existir)

  if (error) {
    console.error("Error clearing tables:", error);
  } else {
    console.log("Successfully cleared all tables in Supabase");
  }
};

import { OrderItem } from "../types";

export const addSupabaseOrder = async (item: OrderItem, { tableId, products, total, paymentMethod, timestamp, responsibleName, status, source }: { tableId: string, products: string, total: number, paymentMethod: string, timestamp: string, responsibleName: string, status: string, source: string }) => {
  console.log("Adding order to Supabase:", { tableId, products, total, paymentMethod, timestamp, responsibleName, status, source, item });
  const { data, error } = await supabase
    .from('orders')
    .insert([
      { 
        tableId, 
        products, 
        total, 
        paymentMethod, 
        timestamp, 
        responsibleName, 
        status, 
        source,
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        description: item.description,
        includes: item.includes,
        daysAvailable: item.daysAvailable,
        reportEnabled: item.reportEnabled,
        editablePrice: item.editablePrice,
        quantity: item.quantity
      }
    ])

  if (error) {
    console.error("Error adding order:", error);
  } else {
    console.log("Successfully added order to Supabase");
  }
};

export const onSupabaseTablesChange = (callback: (tables: any[]) => void) => {
  const channel = supabase.channel('tables_changes');

  channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tables' }, payload => {
      console.log('Change received!', payload)
      supabase
        .from('tables')
        .select('*')
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching tables:", error);
          } else {
            callback(data || []);
          }
        });
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel);
  };
};

export const updateSupabaseTable = async (tableId: number, newStatus: string) => {
  const { data, error } = await supabase
    .from('tables')
    .update({ status: newStatus })
    .eq('id', tableId)

  if (error) {
    console.error("Error updating table:", error);
  } else {
    console.log("Successfully updated table in Supabase");
  }
};

export const updateSupabaseOrder = async (orderId: string, newStatus: string) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)

  if (error) {
    console.error("Error updating order:", error);
  } else {
    console.log("Successfully updated order in Supabase");
  }
};

export const setSupabaseTableToOccupied = async (tableId: number) => {
  const { data, error } = await supabase
    .from('tables')
    .update({ status: "occupied" })
    .eq('id', tableId)

  if (error) {
    console.error("Error setting table to occupied:", error);
  } else {
    console.log("Successfully set table to occupied in Supabase");
  }
};

export const getSupabaseOrdersForTable = async (tableId: number) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('tableid', tableId);

  if (error) {
    console.error("Error fetching orders for table:", error);
    return [];
  }

  return data || [];
};
