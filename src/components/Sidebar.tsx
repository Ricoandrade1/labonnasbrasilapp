import React from "react"
import { Link } from "react-router-dom"

interface SidebarProps {
  isOpen: boolean
  toggleSidebar: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <div className={`fixed inset-0 z-[1001] transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out bg-gray-800 text-white lg:relative lg:translate-x-0 lg:w-64`}>
      <div className="p-4 text-2xl font-bold">Menu</div>
      <nav className="flex flex-col p-4">
        <Link to="/" className="mb-2 p-2 hover:bg-gray-700 rounded" onClick={toggleSidebar}>
          Home
        </Link>
        <Link to="/menu" className="mb-2 p-2 hover:bg-gray-700 rounded" onClick={toggleSidebar}>
          Menu
        </Link>
        <Link to="/orders" className="mb-2 p-2 hover:bg-gray-700 rounded" onClick={toggleSidebar}>
          Orders
        </Link>
        <Link to="/settings" className="mb-2 p-2 hover:bg-gray-700 rounded" onClick={toggleSidebar}>
          Settings
        </Link>
        <div className="p-4">
          <ResetTables />
        </div>
      </nav>
    </div>
  )
}
import ResetTables from "./ResetTables";

export default Sidebar
