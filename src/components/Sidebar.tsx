import React, { useState } from "react"
import { Link } from "react-router-dom"
import { Menu, X, User, Table, DollarSign, Settings, Building2 } from "lucide-react"

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 lg:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white transform transition-transform duration-200 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 text-2xl font-bold border-b border-gray-700">Menu</div>
        <nav className="flex flex-col p-4 space-y-2">
          <Link
            to="/profile"
            className="flex items-center p-2 hover:bg-gray-700 rounded transition-colors"
          >
            <User className="mr-2 h-5 w-5" />
            <span>Perfil</span>
          </Link>
          <Link
            to="/tables"
            className="flex items-center p-2 hover:bg-gray-700 rounded transition-colors"
          >
            <Table className="mr-2 h-5 w-5" />
            <span>Mesa</span>
          </Link>
          <Link
            to="/cashier"
            className="flex items-center p-2 hover:bg-gray-700 rounded transition-colors"
          >
            <DollarSign className="mr-2 h-5 w-5" />
            <span>Caixa</span>
          </Link>
          <Link
            to="/management"
            className="flex items-center p-2 hover:bg-gray-700 rounded transition-colors"
          >
            <Settings className="mr-2 h-5 w-5" />
            <span>Gerência</span>
          </Link>
          <Link
            to="/admin"
            className="flex items-center p-2 hover:bg-gray-700 rounded transition-colors"
          >
            <Building2 className="mr-2 h-5 w-5" />
            <span>Administração</span>
          </Link>
        </nav>
      </div>
    </>
  )
}

export default Sidebar
