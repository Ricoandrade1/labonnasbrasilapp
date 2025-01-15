import { MenuItem as MenuItemType } from "../../types"
import { MenuItem } from "./MenuItem"

interface MenuSectionProps {
  title: string
  items: MenuItemType[]
  getItemQuantity: (itemId: string) => number
  onQuantityChange: (item: MenuItemType, change: number) => void
}

export const MenuSection = ({
  title,
  items,
  getItemQuantity,
  onQuantityChange
}: MenuSectionProps) => {
  if (!items?.length) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <MenuItem
            key={item.id}
            item={item}
            quantity={getItemQuantity(item.id)}
            onQuantityChange={onQuantityChange}
          />
        ))}
      </div>
    </section>
  )
}
