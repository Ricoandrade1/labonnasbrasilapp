import React, { useEffect, useState } from "react"; // Import useState and useEffect
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import SidebarMenu from "../components/SidebarMenu"; // Import SidebarMenu instead of Sidebar
import getSupabaseTables from "../lib/getSupabaseTables"; // Import getSupabaseTables

const Home = () => {
  const [supabaseTables, setSupabaseTables] = useState([]); // State for tables

  useEffect(() => {
    const fetchTables = async () => {
      const tablesData = await getSupabaseTables();
      console.log("Supabase Tables Data:", tablesData); // Log the data
      setSupabaseTables(tablesData); // Set the state
    };

    fetchTables();
  }, []);

  console.log("supabaseTables:", supabaseTables); // Add console log here

  return (
    <div className="flex">
      <SidebarMenu /> {/* Use SidebarMenu instead of Sidebar */}
      <div className="p-6 bg-gray-50 min-h-screen flex-1 ml-64">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-3xl font-bold mb-8">Mesas</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {supabaseTables.map(table => ( // Use supabaseTables for mapping
              <Card key={table.id} className="hover:shadow-lg transition-shadow border border-gray-200">
                <CardHeader className="p-4">
                  <CardTitle className="text-base">{table.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-lg font-bold text-green-600 mb-2">Status: Disponível</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
