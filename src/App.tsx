import React from 'react'
import './App.css'
import Header from './pages/Header'
import Footer from './pages/Footer'
import { Outlet } from 'react-router-dom'
import ScrollToTop from './utils/ScrollToTop'

const App = () => {
  return (
    <div className='w-100 h-screen flex flex-col justify-between'>
      <ScrollToTop/>
      <Header/>
      <div>
        <Outlet/>
      </div>
      <Footer/>
    </div>
  )
}

export default App