import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "@/components/layout/Layout";
import Placeholder from "@/pages/Placeholder";
import EventDetails from "@/pages/EventDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/events" element={<Placeholder title="Events" description="Browse all club events." />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/projects" element={<Placeholder title="Projects" description="Explore student-led projects." />} />
            <Route path="/members" element={<Placeholder title="Members" description="Meet the club members and leaders." />} />
            <Route path="/admin" element={<Placeholder title="Admin Panel" description="Access admin features." />} />
            <Route path="/admin/login" element={<Placeholder title="Admin Login" />} />
            <Route path="/admin/dashboard" element={<Placeholder title="Admin Dashboard" description="Add, update, or delete members, projects and events." />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
