import './App.css'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './components/header.jsx'
import Footer from './components/footer.jsx'

function App() {
  const location = useLocation();
  const hideHeaderFooter = ["/login", "/register", "/forgot-password", "/userinfo", '/resetpassword', '/password-reset-success'].includes(location.pathname);

  return (
    <>
      <div>
        {!hideHeaderFooter && (
          <div className='header'>
            <Header />
          </div>
        )}

        <div className='main'>
          <Outlet />
        </div>
        {!hideHeaderFooter && <Footer />}
      </div>
    </>
  )
}

export default App
