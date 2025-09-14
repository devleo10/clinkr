import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./components/auth/AuthProvider";
import { LoadingProvider } from "./contexts/LoadingContext";
import GlobalLoadingOverlay from "./components/GlobalLoadingOverlay";
import SuspenseFallback from "./components/SuspenseFallback";
import { Analytics } from "@vercel/analytics/react";

// Lazy load components for better performance
const DashBoard = lazy(() => import("./components/Dashboard/DashBoard"));
const HomePage = lazy(() => import("./components/homepage/HomePage"));
const PremiumDashBoard = lazy(() => import("./components/Dashboard/premium/PremiumDashBoard"));
const ProtectedRoute = lazy(() => import("./components/auth/ProtectedRoute"));
const PrivateProfile = lazy(() => import("./components/profile").then(module => ({ default: module.PrivateProfile })));
const SmartRouteResolver = lazy(() => import("./components/profile/pages/SmartRouteResolver"));
const GetStarted = lazy(() => import("./components/auth/GetStarted"));
const Onboarding = lazy(() => import("./components/auth/Onboarding"));
const PrivacyPolicy = lazy(() => import("./components/legal/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./components/legal/TermsOfService"));
const CookiePolicy = lazy(() => import("./components/legal/CookiePolicy"));
const About = lazy(() => import("./components/homepage/About"));
const AuthPages = lazy(() => import("./components/auth/AuthPages"));

function App() {
  <Analytics />;
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/homepage" />,
    },
    {
      path: "/homepage/*",
      element: (
        <Suspense fallback={<SuspenseFallback />}>
          <HomePage />
        </Suspense>
      ),
    },
    {
      path: "/getstarted",
      element: (
        <Suspense fallback={<SuspenseFallback />}>
          <GetStarted />
        </Suspense>
      ),
    },
    {
      path: "/onboarding",
      element: (
        <ProtectedRoute requireAuth={true} requireProfile={false}>
          <Suspense fallback={<SuspenseFallback />}>
            <Onboarding />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute requireAuth={true} requireProfile={true}>
          <Suspense fallback={<SuspenseFallback />}>
            <DashBoard />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: "/privateprofile",
      element: (
        <ProtectedRoute requireAuth={true} requireProfile={true}>
          <Suspense fallback={<SuspenseFallback />}>
            <PrivateProfile />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: "/premiumdashboard",
      element: (
        <ProtectedRoute requireAuth={true} requireProfile={true}>
          <Suspense fallback={<SuspenseFallback />}>
            <PremiumDashBoard />
          </Suspense>
        </ProtectedRoute>
      ),
    },
    {
      path: "/about",
      element: (
        <Suspense fallback={<SuspenseFallback />}>
          <About />
        </Suspense>
      ),
    },
    {
      path: "/privacypolicy",
      element: (
        <Suspense fallback={<SuspenseFallback />}>
          <PrivacyPolicy />
        </Suspense>
      ),
    },
    {
      path: "/termsofservice",
      element: (
        <Suspense fallback={<SuspenseFallback />}>
          <TermsOfService />
        </Suspense>
      ),
    },
    {
      path: "/cookiepolicy",
      element: (
        <Suspense fallback={<SuspenseFallback />}>
          <CookiePolicy />
        </Suspense>
      ),
    },
    {
      path: "/:identifier",
      element: (
        <Suspense fallback={<SuspenseFallback />}>
          <SmartRouteResolver />
        </Suspense>
      ),
    },
    {
      path: "/*",
      element: (
        <Suspense fallback={<SuspenseFallback />}>
          <AuthPages />
        </Suspense>
      ),
    },
  ]);

  return (
    <AuthProvider>
      <LoadingProvider>
        <RouterProvider router={router} />
        <GlobalLoadingOverlay />
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;

