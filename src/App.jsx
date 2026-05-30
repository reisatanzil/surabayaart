import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SignIn from './pages/auth/signin'
import SignUp from './pages/auth/signup'
import CustomerHome from './pages/customer/home'
import Reservasi from './pages/customer/reservasi'
import Detail from './pages/customer/detail'
import Cart from './pages/customer/cart'
import Profile from './pages/customer/profile'
import MyTicket from './pages/customer/myticket'
import OrganizerDashboard from './pages/organizer/dashboard'
import UpEvent from './pages/organizer/upevent'
import OrganizerProfile from './pages/organizer/profile'
import AdminDashboard from './pages/admin/dashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<CustomerHome />} />
        <Route path="/reservasi" element={<Reservasi />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-ticket/:orderId" element={<MyTicket />} />
        <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
        <Route path="/organizer/upload" element={<UpEvent />} />
        <Route path="/organizer/profile" element={<OrganizerProfile />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App