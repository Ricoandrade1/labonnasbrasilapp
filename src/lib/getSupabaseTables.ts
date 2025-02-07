import supabase from "./supabaseClient";

const getSupabaseTables = async () => {
  const { data, error } = await supabase
    .from('tables')
    .select('id, status') // Select only id and status

  if (error) {
    console.error("Error fetching tables:", error);
    return [];
  }

  return data || [];
};

export default getSupabaseTables;
