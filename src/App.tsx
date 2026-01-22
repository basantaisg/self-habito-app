import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginScreen } from "@/components/auth/LoginScreen";
import { QuickAddFab } from "@/components/QuickAddFab";
import { initializeDefaultCategories } from "@/lib/queries";
import Index from "./pages/Index";
import Timers from "./pages/Timers";
import Log from "./pages/Log";
import History from "./pages/History";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();

  // Initialize default categories for new users
  useEffect(() => {
    if (user) {
      initializeDefaultCategories().catch(console.error);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/timers" element={<Timers />} />
        <Route path="/log" element={<Log />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <QuickAddFab />
    </AppLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
