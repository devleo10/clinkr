import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import AuthPages from "./components/auth/AuthPages";
import DashBoard from "./components/Dashboard/DashBoard";
import HomePage from "./components/homepage/HomePage";
import PremiumDashBoard from "./components/Dashboard/premium/PremiumDashBoard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PrivateProfile from "./components/profile/PrivateProfile";
import PublicProfile from "./components/profile/PublicProfile";
import GetStarted from "./components/auth/GetStarted";
import Onboarding from "./components/auth/Onboarding";
import { AuthProvider } from "./components/auth/AuthProvider";
import PrivacyPolicy from "./components/legal/PrivacyPolicy";
import TermsOfService from "./components/legal/TermsOfService";
import CookiePolicy from "./components/legal/CookiePolicy";
import { Analytics } from "@vercel/analytics/react"

function App() {
  <Analytics/>
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/homepage" />,
    },
    {
      path: "/homepage",
      element: <HomePage />,
    },
    {
      path: "/signup",
      element: <GetStarted />,
    },
    {
      path: "/onboarding",
      element: (
        <ProtectedRoute requireAuth={true} requireProfile={false}>
          <Onboarding />
        </ProtectedRoute>
      ),
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute requireAuth={true} requireProfile={true}>
          <DashBoard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/privateprofile",
      element: (
        <ProtectedRoute requireAuth={true} requireProfile={true}>
          <PrivateProfile />
        </ProtectedRoute>
      ),
    },
    {
      path: "/premiumdashboard",
      element: (
        <ProtectedRoute requireAuth={true} requireProfile={true}>
          <PremiumDashBoard />
        </ProtectedRoute>
      ),
    },
  
    {
      path: "/:username",
      element: <PublicProfile />,
    },

    {
      path: "/privacypolicy",
      element: <PrivacyPolicy />,
    },
    {
      path: "/termsofservice",
      element: <TermsOfService />,
    },
    {
      path: "/cookiepolicy",
      element: <CookiePolicy />,
    },
    {
      path: "/*",
      element: <AuthPages />,
    },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;

