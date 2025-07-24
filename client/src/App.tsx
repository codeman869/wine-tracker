import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import WineList from './WineList'
import RegisterForm from './RegisterForm'
import LoginForm from './LoginForm'

function App() {

  return (
  <BrowserRouter>
    <Routes>
      <Route path="/register" element={<RegisterForm />}></Route>
      <Route path="/login" element={<LoginForm />}></Route>
      <Route path="/dashboard" element={<WineList />}></Route>
    </Routes>
  </BrowserRouter>
  )
}

export default App
