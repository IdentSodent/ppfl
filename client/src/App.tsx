import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";

// Pages
import Dashboard from "@/pages/Dashboard";
import AnomalyTimeline from "@/pages/AnomalyTimeline";
import DeviceManagement from "@/pages/DeviceManagement";
import Training from "@/pages/Training";
import Privacy from "@/pages/Privacy";
import Settings from "@/pages/Settings";
import AnomalyAnalysis from "@/pages/AnomalyAnalysis";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/timeline" component={AnomalyTimeline} />
      <Route path="/analysis" component={AnomalyAnalysis} />
      <Route path="/devices" component={DeviceManagement} />
      <Route path="/training" component={Training} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="ppfl-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
