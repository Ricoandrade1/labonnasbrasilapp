import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Plus, Minus } from "lucide-react"
import { MenuItem as MenuItemType } from "../../types"

interface MenuItemProps {
  item: MenuItemType
  quantity: number
  onQuantityChange: (item: MenuItemType, change: number) => void
}

export const MenuItem = ({ item, quantity, onQuantityChange }: MenuItemProps) => (
  <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm overflow-hidden">
    <CardContent className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-xl font-semibold text-gray-800">{item.name}</CardTitle>
        <p className="text-2xl font-bold text-green-600 bg-green-50/50 px-3 py-1 rounded-full">€{item.price}</p>
      </div>
      {item.description && (
        <p className="text-sm text-gray-600 line-clamp-2 group-hover:line-clamp-none transition-all">
          {item.description}
        </p>
      )}
      <div className="flex items-center justify-between gap-4 pt-4">
        <Button 
          variant="outline"
          size="icon"
          onClick={() => onQuantityChange(item, -1)}
          className="w-12 h-12 rounded-full border-2 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-400 transition-all shadow-sm"
        >
          <Minus className="h-5 w-5" />
        </Button>
        <span className="font-semibold text-2xl min-w-[40px] text-center text-gray-800">
          {quantity}
        </span>
        <Button 
          variant="outline"
          size="icon"
          onClick={() => onQuantityChange(item, 1)}
          className="w-12 h-12 rounded-full border-2 border-green-200 hover:bg-green-50 hover:text-green-600 hover:border-green-400 transition-all shadow-sm"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </CardContent>
  </Card>
)
