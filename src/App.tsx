import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import AuthPages from "./components/auth/AuthPages";
import DashBoard from "./components/Dashboard/DashBoard";
import HomePage from "./components/homepage/HomePage";
import Footer from "./components/homepage/Footer";
import PremiumDashBoard from "./components/Dashboard/premium/PremiumDashBoard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PrivateProfile from "./components/profile/PrivateProfile";
import PublicProfile from "./components/profile/PublicProfile";
import GetStarted from "./components/auth/GetStarted";
import Onboarding from "./components/auth/Onboarding";
import UserProfile from "./components/profile/UserProfile";
import { AuthProvider } from "./components/auth/AuthProvider";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/homepage" />,
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <DashBoard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/privateprofile",
      element: (
        <ProtectedRoute>
          <PrivateProfile />
        </ProtectedRoute>
      ),
    },
    {
      path: "/:username",
      element: <PublicProfile />,
    },
    {
      path: "/homepage",
      element: (
        <>
          <HomePage />
          <Footer />
        </>
      ),
    },
    {
      path: "/premiumdashboard",
      element: (
        <ProtectedRoute>
          <PremiumDashBoard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/onboarding",
      element: <Onboarding />,
    },
    {
      path: "/signup",
      element: <GetStarted />,
    },
    {
      path: "/userprofile",
      element: <UserProfile />,
    },
    {
      path: "/*",
      element: <AuthPages />,
    },
  ]);

  return <RouterProvider router={router} />;
}

const AppWithAuth = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default AppWithAuth;

