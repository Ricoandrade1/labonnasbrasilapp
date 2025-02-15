import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import Sidebar from "../components/Sidebar"

const tables = [
  { id: "1", name: "Mesa 1" },
  { id: "2", name: "Mesa 2" },
  { id: "3", name: "Mesa 3" },
  { id: "4", name: "Mesa 4" },
  { id: "5", name: "Mesa 5" },
]

const Home = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="p-6 bg-gray-50 min-h-screen flex-1 ml-64">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-3xl font-bold mb-8">Mesas</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {tables.map(table => (
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
  )
}

export default Home
