import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Tables from "./pages/Tables"
import MenuSelection from "./pages/MenuSelection"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./context/AuthContext"
import Login from "./pages/Login"
import Sidebar from "./components/Sidebar"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 1000, // Poll every second for real-time updates
      staleTime: 0, // Consider data immediately stale for real-time updates
    },
  },
})

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64">
        {children}
      </main>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Tables />} />
            <Route path="/tables" element={<Tables />} />
            <Route path="/menu" element={<MenuSelection />} />
          </Routes>
        </Layout>
        <Toaster />
      </Router>
    </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
