import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "./components/AppShell";
import PatientsScreen from "./pages/PatientsScreen";
import CasesScreen from "./pages/CasesScreen";
import CaseDetailScreen from "./pages/CaseDetailScreen";
import NewCaseScreen from "./pages/NewCaseScreen";
import SearchScreen from "./pages/SearchScreen";
import LogbookScreen from "./pages/LogbookScreen";
import AddHospitalScreen from "./pages/AddHospitalScreen";

import SettingsScreen from "./pages/SettingsScreen";
import MediaGalleryScreen from "./pages/MediaGalleryScreen";
import PatientDetailScreen from "./pages/PatientDetailScreen";
import NotFound from "./pages/NotFound";
import GroupPearlScreen from "./pages/GroupPearlScreen";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<CasesScreen />} />
            <Route path="/AllPatientList" element={<PatientsScreen />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/logbook" element={<LogbookScreen />} />
            
          </Route>
          <Route path="/case/new" element={<NewCaseScreen />} />
          <Route path="/case/:id" element={<CaseDetailScreen />} />
          <Route path="/case/:id/media" element={<MediaGalleryScreen />} />
          <Route path="/patient/:id" element={<PatientDetailScreen />} />
          <Route path="/hospital/new" element={<AddHospitalScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/group-pearl" element={<GroupPearlScreen />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
