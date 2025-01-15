import React, { useState } from "react"
// ...existing code...

const MenuSelection = () => {
  // ...existing code...
  const [tableNumber, setTableNumber] = useState<number | null>(null)
  // ...existing code...

  const handleSendToKitchen = () => {
    // ...existing code...
    if (tableNumber === null) {
      toast({
        title: "Erro",
        description: "Por favor, selecione o número da mesa",
        variant: "destructive",
      })
      return
    }
    // ...existing code...
  }

  return (
    <div className="container mx-auto p-4">
      {!tableSelected ? (
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-6">Selecione a Mesa</h2>
          <Input
            type="number"
            placeholder="Número da mesa"
            value={tableNumber ?? ""}
            onChange={(e) => setTableNumber(Number(e.target.value))}
            className="mb-4"
          />
          <Button onClick={() => setTableSelected(true)} className="bg-[#518426] hover:bg-[#518426]/90">
            Selecionar Mesa
          </Button>
        </div>
      ) : (
        // ...existing code...
      )}
    </div>
  )
}

export default MenuSelection
