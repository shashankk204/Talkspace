import { useState } from 'react'
import './App.css'
import { Route, BrowserRouter, Routes } from 'react-router-dom'
import Room from './page/Room'
import { Sender } from './components/Sender'
import { Receiver } from './components/Receiver'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/room" element={<Room />} /> */}
        <Route path="/s" element={<Sender />} />
        <Route path="/r" element={<Receiver />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App