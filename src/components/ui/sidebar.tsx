import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "./button"
import { LayoutGrid, UtensilsCrossed, LogOut } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const menuItems = [
    {
      title: "Mesas",
      icon: <LayoutGrid className="w-5 h-5" />,
      path: "/tables",
    },
    {
      title: "Menu",
      icon: <UtensilsCrossed className="w-5 h-5" />,
      path: "/menu",
    },
  ]

  return (
    <div className="min-h-screen w-64 bg-card border-r flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary">La Bonna's</h2>
        <div className="mt-2 text-sm text-muted-foreground">
          {user?.name}
        </div>
      </div>

      <nav className="flex-1 p-4">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant={location.pathname === item.path ? "secondary" : "ghost"}
            className="w-full justify-start gap-2 mb-2"
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            {item.title}
          </Button>
        ))}
      </nav>

      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start gap-2 text-destructive">
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </div>
  )
}
