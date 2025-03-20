import './App.css'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './layout/header.jsx'
import Footer from './layout/footer.jsx'

function App() {
  const location = useLocation();
  const hideHeaderFooter = ["/login", "/register", "/forgot-password", "/userinfo", '/resetpassword'].includes(location.pathname);

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
