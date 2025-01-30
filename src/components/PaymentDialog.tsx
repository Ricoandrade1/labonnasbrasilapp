import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { Button } from "./ui/button"
import { useToast } from "../hooks/use-toast"
import { PaymentInfo, TableOrder } from "../types"

interface PaymentDialogProps {
  order: TableOrder
  handlePayment: (order: TableOrder, method: PaymentInfo["method"]) => Promise<void>
  onClose?: () => void
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ order, handlePayment, onClose }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentInfo["method"] | null>(null)
  const { toast } = useToast()

  const handlePaymentSubmit = async () => {
    if (!paymentMethod) return

    try {
      setIsLoading(true)
      await handlePayment(order, paymentMethod)
      toast({
        title: "Pagamento processado",
        description: `Pagamento de R$ ${order.total.toFixed(2)} processado com sucesso`,
      })
      onClose?.()
    } catch (error) {
      toast({
        title: "Falha no pagamento",
        description: error instanceof Error ? error.message : "Por favor, tente novamente",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Ver Pedido</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Pedido - Mesa {order.tableId}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>R$ {item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold">
              Total: R$ {order.total.toFixed(2)}
            </div>
          </div>
        </div>
        <DialogFooter className="space-x-2 mt-4">
          <Select
            disabled={isLoading}
            onValueChange={(value) => setPaymentMethod(value as PaymentInfo["method"])}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Método de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Dinheiro</SelectItem>
              <SelectItem value="credit">Cartão de Crédito</SelectItem>
              <SelectItem value="debit">Cartão de Débito</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="hover:bg-red-200"
          >
            Cancelar
          </Button>
          <Button
            variant="default"
            onClick={handlePaymentSubmit}
            disabled={!paymentMethod || isLoading}
          >
            {isLoading ? "Processando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentDialog
