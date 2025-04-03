import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Home from './pages/Home.jsx';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Contact from './pages/contact.jsx';
import Login from './components/auth/login.jsx';
import Register from './components/auth/register.jsx';
import ForgotPassword from './components/auth/forgotpassword.jsx';
import UserInfo from './components/user/userinfo.jsx';
import ResetPassword from './components/auth/resetpassword.jsx';
import Cart from './components/product/cart.jsx';
import AboutUs from './pages/aboutpage.jsx';
import ServiceCenters from './pages/servicecenters.jsx';
import ProductList from './components/product/productlist.jsx';
import ProductDetail from './components/product/productdetail.jsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        path: '/',
        element: <Home />
      },
      {
        path: '/contact',
        element: <Contact />
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/register',
        element: <Register />
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />
      },
      {
        path: '/users/info',
        element: <UserInfo />
      },
      {
        path: '/resetpassword',
        element: <ResetPassword />
      },
      {
        path: '/cart',
        element: <Cart />
      },
      {
        path: '/aboutus',
        element: <AboutUs />
      },
      {
        path: '/baohanh',
        element: <ServiceCenters />
      },
      {
        path: '/products',
        element: <ProductList />
      },
      {
        path: '/product/:productId',
        element: <ProductDetail />
      },
    ]
  }
]);
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />
  </React.StrictMode>,
)
