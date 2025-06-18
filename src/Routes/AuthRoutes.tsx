import { Routes,Route } from 'react-router-dom';
import GetStarted from '../components/auth/GetStarted';
import PasswordReset from '../components/auth/PasswordReset';

const AuthRoutes = () => {
  return (
      <Routes>
        <Route path="/getstarted" element={<GetStarted/>}/>
        <Route path="/password-reset" element={<PasswordReset/>}/>
      </Routes>
  )
}

export default AuthRoutes