import { useState } from "react";
import { Order, OrderItem } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus, Trash2, Receipt } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderSummaryProps {
  order: Order;
  onUpdateQuantity: (item: OrderItem, change: number) => void;
  onRemoveItem: (itemId: string) => void;
  onAddNote: (note: string) => void;
  onComplete: () => void;
}

export const OrderSummary = ({
  order,
  onUpdateQuantity,
  onRemoveItem,
  onAddNote,
  onComplete,
}: OrderSummaryProps) => {
  const [note, setNote] = useState("");

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Mesa {order.tableId}</h2>
          <p className="text-sm text-gray-500">Atendente: {order.serverName}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
          <p className="text-sm font-medium text-[#518426]">
            Pedido #{order.id.slice(-4)}
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <AnimatePresence>
          {order.items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-500">
                  €{item.price.toFixed(2)} cada
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(item, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(item, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="space-y-4 mb-6">
        <Textarea
          placeholder="Observações do pedido..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full"
        />
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            onAddNote(note);
            setNote("");
          }}
        >
          Adicionar Observação
        </Button>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-medium">€{order.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span className="text-gray-500">Taxa de Serviço (10%)</span>
          <span className="font-medium">
            €{(order.total * 0.1).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-[#518426]">
            €{(order.total * 1.1).toFixed(2)}
          </span>
        </div>
      </div>

      <Button
        className="w-full mt-6 bg-[#518426] hover:bg-[#518426]/90"
        onClick={onComplete}
      >
        <Receipt className="h-4 w-4 mr-2" />
        Finalizar Pedido
      </Button>
    </div>
  );
};
