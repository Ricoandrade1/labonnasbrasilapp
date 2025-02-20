import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, LayoutGrid, DollarSign, Users, Settings } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useState, useContext } from "react";
import { useTable } from "@/context/TableContext";
import { AuthContext, User } from "@/context/AuthContext";

const SidebarMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [initialValue, setInitialValue] = useState("");
  const { setInitialCashValue } = useTable();
  const { user } = useContext(AuthContext) as { user: User | null };

  const menuItems = [
    { name: "Mesa", path: "/tables", icon: LayoutGrid },
    { name: "Caixa", path: "/cashier", icon: DollarSign, roles: ["Caixa", "gerente", "adm"] },
    { name: "Gerente", path: "/gerente", icon: Users, roles: ["gerente", "adm"] },
    { name: "Adm", path: "/adm", icon: Settings, roles: ["adm"] },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-[1001] bg-white shadow-md hover:bg-gray-100"
        >
          <Menu className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] bg-white p-0 z-[1001]">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-2xl font-bold text-[#518426]">
            Labonnas
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            if (item.roles && (!user || !item.roles.includes(user.role))) {
              return null;
            }
            return (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "default" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  location.pathname === item.path
                    ? "bg-[#518426] text-white"
                    : "hover:bg-[#518426]/10"
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SidebarMenu;
