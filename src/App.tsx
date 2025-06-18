import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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

function App() {
  const location = useLocation();
  const showFooter = location.pathname === '/homepage';

  return (
    <>
      <Routes>
        {/* Redirect from root to homepage */}
        <Route path="/" element={<Navigate to ="/homepage" />}/>
        {/* Dashboard route without Navbar/Footer */}
        <Route path="/dashboard" element={<ProtectedRoute><DashBoard/></ProtectedRoute>} />
        <Route path="/privateprofile" element={<ProtectedRoute><PrivateProfile/></ProtectedRoute>} />
        <Route path="/:username" element={<PublicProfile/>} />
        <Route path="/homepage" element={<HomePage/>} />
        <Route path="/premiumdashboard" element={<ProtectedRoute><PremiumDashBoard/></ProtectedRoute>} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/signup" element={<GetStarted />} />
        <Route path="/userprofile" element={<UserProfile />} />

        <Route path="/*" element={<AuthPages />} />
      </Routes>
      {showFooter && <Footer/>}
    </>
  );
}

export default App;

