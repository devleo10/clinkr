import { Route, Routes } from "react-router-dom"
import GetStarted from "./GetStarted"
import PasswordReset from "./PasswordReset"
import Onboarding from "./Onboarding"

const AuthPages = () => {
  return (
    <Routes>
       <Route path="/signup" element={<GetStarted />} />
       <Route path="/password-reset" element={<PasswordReset />} />
       <Route path="/onboarding" element={<Onboarding />} />
    </Routes>
  )
}

export default AuthPages