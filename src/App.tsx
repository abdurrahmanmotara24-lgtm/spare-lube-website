import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { SiteSettingsProvider, useSiteSettings } from "@/hooks/useSiteSettings";
import RouteScrollToTop from "@/components/RouteScrollToTop";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import Admin from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import OperatingHours from "./pages/OperatingHours.tsx";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { settings } = useSiteSettings();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={settings.show_about ? <About /> : <NotFound />} />
      <Route path="/contact" element={settings.show_contact ? <Contact /> : <NotFound />} />
      <Route
        path="/operating-hours"
        element={settings.show_operating_hours ? <OperatingHours /> : <NotFound />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SiteSettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteScrollToTop />
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </SiteSettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
