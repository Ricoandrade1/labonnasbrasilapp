import supabase from "./supabaseClient";

const addSupabaseTables = async () => {
  console.log("Executing addSupabaseTables function");
  try {
    // Verifica se já existem mesas no Supabase
    const { data: existingTables, error: existingTablesError } = await supabase
      .from('tables')
      .select('*', { count: 'exact' });

    if (existingTablesError) {
      console.error("Error checking existing tables:", existingTablesError);
      return;
    }

    // Se já existirem mesas, não adiciona novas
    if (existingTables && existingTables.length > 0) {
      console.log("Tables already exist in Supabase. Skipping table creation.");
      return;
    }

    // Adiciona as mesas ao Supabase
    const { data, error } = await supabase
      .from('tables')
      .insert(
        Array.from({ length: 50 }, (_, i) => ({ id: i + 1, status: 'available' }))
      )

    if (error) {
      console.error("Error adding tables:", error);
    } else {
      console.log("Successfully added 50 tables to Supabase");
    }
  } catch (error) {
    console.error("Error during setup:", error);
  }
};

export default addSupabaseTables;
