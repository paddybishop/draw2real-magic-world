
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DrawProvider } from "./context/DrawContext";

import WelcomeScreen from "./pages/WelcomeScreen";
import CameraScreen from "./pages/CameraScreen";
import PreviewScreen from "./pages/PreviewScreen";
import MakeRealScreen from "./pages/MakeRealScreen";
import ResultScreen from "./pages/ResultScreen";
import PremiumScreen from "./pages/PremiumScreen";
import PaymentSuccessScreen from "./pages/PaymentSuccessScreen";
import HowItWorks from "./pages/HowItWorks";
import Gallery from "./pages/Gallery";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DrawProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/camera" element={<CameraScreen />} />
            <Route path="/preview" element={<PreviewScreen />} />
            <Route path="/make-real" element={<MakeRealScreen />} />
            <Route path="/result" element={<ResultScreen />} />
            <Route path="/premium" element={<PremiumScreen />} />
            <Route path="/payment-success" element={<PaymentSuccessScreen />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DrawProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
