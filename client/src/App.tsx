import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Properties from "@/pages/Properties";
import Owners from "@/pages/Owners";
import Tenants from "@/pages/Tenants";
import Contact from "@/pages/Contact";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminProperties from "@/pages/AdminProperties";
import AdminInquiries from "@/pages/AdminInquiries";
import AdminMaintenance from "@/pages/AdminMaintenance";
import AdminPayments from "@/pages/AdminPayments";
import AdminUsers from "@/pages/AdminUsers";
import OwnerDashboard from "@/pages/OwnerDashboard";
import OwnerProperties from "@/pages/OwnerProperties";
import OwnerTenants from "@/pages/OwnerTenants";
import OwnerPayments from "@/pages/OwnerPayments";
import OwnerMaintenance from "@/pages/OwnerMaintenance";
import TenantDashboard from "@/pages/TenantDashboard";
import TenantPayments from "@/pages/TenantPayments";
import TenantMaintenance from "@/pages/TenantMaintenance";
import TenantDocuments from "@/pages/TenantDocuments";
import TenantSettings from "@/pages/TenantSettings";
import AdminLogin from "@/pages/AdminLogin";
import OwnerLogin from "@/pages/OwnerLogin";
import TenantLogin from "@/pages/TenantLogin";
import Apply from "@/pages/Apply";
import AdminApplications from "@/pages/AdminApplications";
import Vouchers from "@/pages/Vouchers";
import Blog from "@/pages/Blog";
import NorthCounty from "@/pages/NorthCounty";
import StCharles from "@/pages/StCharles";
import Kirkwood from "@/pages/Kirkwood";
import WebsterGroves from "@/pages/WebsterGroves";
import SouthCity from "@/pages/SouthCity";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Switch>
            {/* Login Routes */}
            <Route path={"/login"} component={TenantLogin} />
            <Route path={"/owner-login"} component={OwnerLogin} />
            <Route path={"/admin-login"} component={AdminLogin} />
            
            {/* Application & Voucher Routes */}
            <Route path={"/apply"} component={Apply} />
            <Route path={"/vouchers"}>
              <Vouchers />
            </Route>

            {/* Admin Routes */}
            <Route path={"/admin"} component={AdminDashboard} />
            <Route path={"/admin/properties"} component={AdminProperties} />
            <Route path={"/admin/inquiries"} component={AdminInquiries} />
            <Route path={"/admin/maintenance"} component={AdminMaintenance} />
            <Route path={"/admin/payments"} component={AdminPayments} />
            <Route path={"/admin/users"} component={AdminUsers} />
            <Route path={"/admin/applications"} component={AdminApplications} />
            
            {/* Owner Routes */}
            <Route path={"/owner"} component={OwnerDashboard} />
            <Route path={"/owner/properties"} component={OwnerProperties} />
            <Route path={"/owner/tenants"} component={OwnerTenants} />
            <Route path={"/owner/payments"} component={OwnerPayments} />
            <Route path={"/owner/maintenance"} component={OwnerMaintenance} />
            
            {/* Tenant Routes */}
            <Route path={"/tenant"} component={TenantDashboard} />
            <Route path={"/tenant/payments"} component={TenantPayments} />
            <Route path={"/tenant/maintenance"} component={TenantMaintenance} />
            <Route path={"/tenant/documents"} component={TenantDocuments} />
            <Route path={"/tenant/settings"} component={TenantSettings} />
            
            {/* Public Routes with Layout */}
            <Route path={"/404"} component={NotFound} />
            <Route path={"/"}>
              <Layout>
                <Home />
              </Layout>
            </Route>
            <Route path={"/about"}>
              <Layout>
                <About />
              </Layout>
            </Route>
            <Route path={"/services"}>
              <Layout>
                <Services />
              </Layout>
            </Route>
            <Route path={"/properties"}>
              <Layout>
                <Properties />
              </Layout>
            </Route>
            <Route path={"/owners"}>
              <Layout>
                <Owners />
              </Layout>
            </Route>
            <Route path={"/tenants"}>
              <Layout>
                <Tenants />
              </Layout>
            </Route>
            <Route path={"/blog"}>
              <Layout>
                <Blog />
              </Layout>
            </Route>
            <Route path={"/neighborhoods/north-county"}>
              <Layout>
                <NorthCounty />
              </Layout>
            </Route>
            <Route path={"/neighborhoods/st-charles"}>
              <Layout>
                <StCharles />
              </Layout>
            </Route>
            <Route path={"/neighborhoods/kirkwood"}>
              <Layout>
                <Kirkwood />
              </Layout>
            </Route>
            <Route path={"/neighborhoods/webster-groves"}>
              <Layout>
                <WebsterGroves />
              </Layout>
            </Route>
            <Route path={"/neighborhoods/south-city"}>
              <Layout>
                <SouthCity />
              </Layout>
            </Route>
            <Route path={"/contact"}>
              <Layout>
                <Contact />
              </Layout>
            </Route>
            
            {/* 404 Fallback */}
            <Route>
              <Layout>
                <NotFound />
              </Layout>
            </Route>
          </Switch>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
