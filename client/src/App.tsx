import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { CurrencyProvider } from "@/hooks/use-currency";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ResetPassword from "@/pages/reset-password";
import Dashboard from "@/pages/dashboard";
import CreatePage from "@/pages/create-page";
import PublicBooking from "@/pages/public-booking";
import Pricing from "@/pages/pricing";
import Sales from "@/pages/sales";
import Tutorial from "@/pages/tutorial";
import AuthGuard from "@/components/auth/auth-guard";
import NotFound from "@/pages/not-found";
import Legal from "@/pages/legal";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Refunds from "@/pages/refunds";
import Contact from "@/pages/contact";
import ReportBug from "@/pages/report-bug";
import RequestFeature from "@/pages/request-feature";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/sales" component={Sales} />
      <Route path="/tutorial" component={Tutorial} />
      <Route path="/legal" component={Legal} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/refunds" component={Refunds} />
      <Route path="/contact" component={Contact} />
      <Route path="/dashboard">
        <AuthGuard>
          <Dashboard />
        </AuthGuard>
      </Route>
      <Route path="/create-page">
        <AuthGuard>
          <CreatePage />
        </AuthGuard>
      </Route>
      <Route path="/report-bug">
        <AuthGuard>
          <ReportBug />
        </AuthGuard>
      </Route>
      <Route path="/request-feature">
        <AuthGuard>
          <RequestFeature />
        </AuthGuard>
      </Route>
      <Route path="/:slug" component={PublicBooking} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}

export default App;
