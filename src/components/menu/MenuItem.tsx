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
  <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm overflow-hidden rounded-xl">
    <CardContent className="p-3 sm:p-4 md:p-6 space-y-3 md:space-y-4 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">{item.name}</CardTitle>
        <p className="text-xl sm:text-2xl font-bold text-green-600 bg-green-50/50 px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-sm group-hover:shadow-md group-hover:bg-green-100/50 transition-all whitespace-nowrap">€{item.price}</p>
      </div>
      {item.description && (
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 group-hover:line-clamp-none transition-all duration-300 group-hover:text-gray-700">
          {item.description}
        </p>
      )}
      <div className="flex items-center justify-center gap-4 sm:gap-6 pt-4 sm:pt-6">
        <Button 
          variant="outline"
          size="icon"
          onClick={() => onQuantityChange(item, -1)}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-400 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
        >
          <Minus className="h-5 w-5" />
        </Button>
        <span className="font-bold text-xl sm:text-2xl min-w-[32px] sm:min-w-[40px] text-center text-gray-800 bg-gray-50 rounded-lg px-2 sm:px-3 py-1">
          {quantity}
        </span>
        <Button 
          variant="outline"
          size="icon"
          onClick={() => onQuantityChange(item, 1)}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-green-200 hover:bg-green-50 hover:text-green-600 hover:border-green-400 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </CardContent>
  </Card>
)
