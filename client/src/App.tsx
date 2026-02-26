import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";

// Layout & Decorations
import { Navbar } from "./components/layout/Navbar";
import { FloatingElements } from "./components/FloatingElements";

// Pages
import Home from "./pages/Home";
import Events from "./pages/Events";
import FestPass from "./pages/FestPass";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={Home}/>
        <Route path="/events" component={Events}/>
        <Route path="/fest-pass" component={FestPass}/>
        <Route path="/login" component={Login}/>
        <Route path="/dashboard" component={Dashboard}/>
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="relative min-h-screen selection:bg-[hsl(var(--primary))] selection:text-black">
          <FloatingElements />
          <Navbar />
          <main className="relative z-10">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
