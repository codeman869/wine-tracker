import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import WineList from './WineList'
import RegisterForm from './RegisterForm'
import LoginForm from './LoginForm'
import { AuthProvider } from './context/AuthProvider'

function App() {

  return (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/register" element={<RegisterForm />}></Route>
        <Route path="/login" element={<LoginForm />}></Route>
        <Route path="/dashboard" element={<WineList />}></Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
  )
}

export default App
