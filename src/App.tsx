import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Informacoes from "./pages/Informacoes";
import ResetPassword from "./pages/ResetPassword";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./providers/AuthProvider";
import { SidebarProvider } from "./providers/SidebarProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageDuvidas from "./pages/admin/ManageDuvidas";
import { ThemeProvider } from "./providers/ThemeProvider";
import MinhasDuvidas from "./pages/MinhasDuvidas";
import { DuvidaProvider } from "./providers/DuvidaProvider";
import DuvidaDetail from "./pages/DuvidaDetail";

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Router>
          <AuthProvider>
            <SidebarProvider>
              <DuvidaProvider>
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/informacoes" 
                  element={
                    <ProtectedRoute>
                      <Informacoes />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/duvida/:id" 
                  element={
                    <ProtectedRoute>
                      <DuvidaDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/minhas-duvidas" 
                  element={
                    <ProtectedRoute>
                      <MinhasDuvidas />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <ManageUsers />
                    </AdminRoute>
                  }
                />
                <Route 
                  path="/admin/duvidas"
                  element={
                    <AdminRoute>
                      <ManageDuvidas />
                    </AdminRoute>
                  }
                />
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
        
                <Route path="*" element={<NotFound />} />
              </Routes>
              </DuvidaProvider>
            </SidebarProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </>
  );
}

export default App;