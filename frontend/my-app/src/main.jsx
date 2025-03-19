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
import ChangePassword from './components/user/changepassword.jsx';
import Cart from './components/product/cart.jsx';


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
        path: '/changepassword',
        element: <ChangePassword />
      },
      {
        path: '/cart',
        element: <Cart />
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
