import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem } from "@/types/menu";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MenuCategoryProps {
  category: {
    id: string;
    name: string;
    icon: string;
  };
  items: MenuItem[];
  onItemSelect: (item: MenuItem) => void;
}

export const MenuCategory = ({ category, items, onItemSelect }: MenuCategoryProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.icon}</span>
          <h2 className="text-lg font-semibold">{category.name}</h2>
          <span className="text-sm text-gray-500">({items.length})</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
          >
            {items.map((item) => (
              <motion.div
                key={item.id}
                layoutId={item.id}
                className="relative group"
              >
                <button
                  onClick={() => onItemSelect(item)}
                  disabled={!item.available}
                  className={`w-full h-full bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200 
                    ${item.available ? 'hover:shadow-md' : 'opacity-50 cursor-not-allowed'}`}
                >
                  {item.image && (
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-lg font-bold text-[#518426]">
                        €{item.price.toFixed(2)}
                      </span>
                      {!item.available && (
                        <span className="text-xs text-red-500 font-medium">
                          Indisponível
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
