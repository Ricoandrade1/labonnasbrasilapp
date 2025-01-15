import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { useToast } from "../hooks/use-toast"
import { Plus, Minus, Trash2, User } from "lucide-react"
import { Input } from "../components/ui/input"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { api } from "../lib/api"

interface MenuItem {
  id: string
  name: string
  price: number
  category: "rodizio" | "diaria" | "bebida"
  description?: string
}

interface OrderItem extends MenuItem {
  quantity: number
}

const MenuSelection = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [tableResponsible, setTableResponsible] = useState("")

  const updateMenuItemMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<MenuItem> }) => 
      api.updateMenuItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] })
    }
  })

  const updateBebidaMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<MenuItem> }) => 
      api.updateBebida(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bebidas'] })
    }
  })

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menuItems'],
    queryFn: api.getMenuItems
  })

  const { data: bebidas = [] } = useQuery({
    queryKey: ['bebidas'],
    queryFn: api.getBebidas
  })

  const handleQuantityChange = (item: MenuItem, change: number) => {
    setOrderItems(prev => {
      const existingItem = prev.find(i => i.id === item.id)
      if (existingItem) {
        const newQuantity = existingItem.quantity + change
        if (newQuantity <= 0) {
          return prev.filter(i => i.id !== item.id)
        }
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: newQuantity }
            : i
        )
      }
      if (change > 0) {
        return [...prev, { ...item, quantity: 1 }]
      }
      return prev
    })
  }

  const removeItem = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId))
    toast({
      title: "Item removido",
      description: "Item removido do pedido",
    })
  }

  const getTotalPrice = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleSendToKitchen = async () => {
    if (!tableResponsible.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe o responsável da mesa",
        variant: "destructive",
      })
      return
    }

    if (orderItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione itens ao pedido primeiro",
        variant: "destructive",
      })
      return
    }

    try {
      // Example: Update stock or availability after order
      const updatePromises = orderItems.map(item => {
        if (item.category === 'bebida') {
          return updateBebidaMutation.mutateAsync({
            id: item.id,
            updates: { /* Add any updates needed */ }
          })
        } else {
          return updateMenuItemMutation.mutateAsync({
            id: item.id,
            updates: { /* Add any updates needed */ }
          })
        }
      })

      await Promise.all(updatePromises)

      toast({
        title: "Pedido enviado",
        description: "Seu pedido foi enviado para a cozinha",
      })
      setOrderItems([])
      setTableResponsible("")
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar pedido. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const renderMenuItem = (item: MenuItem) => (
    <Card key={item.id} className="hover:shadow-lg transition-shadow border border-gray-200">
      <CardHeader className="p-4">
        <CardTitle className="text-base">{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <p className="text-lg font-bold text-green-600">€{item.price}</p>
        {item.description && (
          <p className="text-sm text-gray-600">{item.description}</p>
        )}
        <div className="flex items-center justify-between gap-4">
          <Button 
            variant="destructive"
            size="lg"
            onClick={() => handleQuantityChange(item, -1)}
            className="flex-1"
          >
            <Minus className="h-6 w-6" />
          </Button>
          <span className="font-medium text-xl min-w-[30px] text-center">
            {orderItems.find(i => i.id === item.id)?.quantity || 0}
          </span>
          <Button 
            variant="default"
            size="lg"
            onClick={() => handleQuantityChange(item, 1)}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cardápio</h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Rodízios</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems?.filter(item => item.category === "rodizio").map(renderMenuItem)}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Pratos do Dia</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems?.filter(item => item.category === "diaria").map(renderMenuItem)}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Bebidas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bebidas?.map(renderMenuItem)}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4 border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <Input
                      placeholder="Responsável da mesa"
                      value={tableResponsible}
                      onChange={(e) => setTableResponsible(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    {orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="h-6 w-6 p-0 bg-red-100 border border-red-300"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          <span>{item.name} x{item.quantity}</span>
                        </div>
                        <span>€{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total</span>
                      <span>€{getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSendToKitchen}
                    className="w-full bg-[#518426] hover:bg-[#518426]/90 mt-4"
                  >
                    Enviar para Cozinha
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuSelection
