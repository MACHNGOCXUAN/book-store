import './App.css'
import Header from './components/Header'
import { Outlet } from 'react-router-dom'
import ScrollToTop from './utils/ScrollToTop'
import Footer from './components/Footer'

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