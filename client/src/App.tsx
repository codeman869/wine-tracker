import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import WineList from './WineList'

function App() {
  const [count, setCount] = useState(0)

  return (
   <div>
    <h1>Wine Collection</h1>
    <WineList />
   </div>
  )
}

export default App
