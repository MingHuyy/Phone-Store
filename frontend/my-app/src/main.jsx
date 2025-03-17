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


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
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
    ]
  }
]);
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />
  </React.StrictMode>,
)
