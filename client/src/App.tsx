import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import StockDetail from "@/pages/stock-detail";
import Portfolio from "@/pages/portfolio";
import Market from "@/pages/market";
import AIInsights from "@/pages/ai-insights";
import News from "@/pages/news";

import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/stock/:symbol" component={StockDetail} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/market" component={Market} />
      <Route path="/ai-insights" component={AIInsights} />
      <Route path="/news" component={News} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
