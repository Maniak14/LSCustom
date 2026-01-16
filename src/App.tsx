import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RecruitmentProvider } from "./contexts/RecruitmentContext";
import Index from "./pages/Index";
import Tarifs from "./pages/Tarifs";
import Candidature from "./pages/Candidature";
import Panel from "./pages/Panel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Obtenir le base path depuis import.meta.env.BASE_URL (défini par Vite)
const basename = import.meta.env.BASE_URL || '/';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RecruitmentProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={basename}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tarifs" element={<Tarifs />} />
            <Route path="/candidature" element={<Candidature />} />
            <Route path="/panel" element={<Panel />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RecruitmentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
