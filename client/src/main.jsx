import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import './index.css'
import AuthComponent from '../public/auth/authComponent.jsx'
import Main from '../public/pages/main/main.jsx'
import ClientAuthprovider from './clientAuthprovider.jsx'

import Toast from './assets/toast.jsx'



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <div className='relative'>
       <Routes>
          <Route path='/' element={ <AuthComponent /> } />
          <Route path='/dashboard' element={ <ClientAuthprovider> <Main /> </ClientAuthprovider> } />
        </Routes>
        <Toast />
    </div>
    </BrowserRouter>
  </StrictMode>
)
