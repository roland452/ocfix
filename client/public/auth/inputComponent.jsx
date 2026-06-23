import React from 'react'
import Login from './inputs/login' 
import Signup from './inputs/signup'
import Admin from './inputs/admin'
import Toast from '../../src/assets/toast'
import { useState } from 'react'
import useToast from '../context/toast'

const InputComponent = ({ authSection }) => {


  const [submitting, setSubmitting] = useState(false)

  const setToast = useToast((state) => state.setToast)

  function setPopup(message) {
    setToast(message) 
    setTimeout(() => {setToast('')},9000) 
  }

  return (
    <div className='h-full place-self-center'> 
      <Login 
        authSection={authSection}
        setPopup={setPopup}
        submitting={submitting}
        setSubmitting={setSubmitting}
      />

      <Signup 
        authSection={authSection}
        setPopup={setPopup}
        submitting={submitting}
        setSubmitting={setSubmitting}
      />

      <Admin 
        authSection={authSection}
        setPopup={setPopup}
        submitting={submitting}
        setSubmitting={setSubmitting}

      />

      <Toast />

    </div>
  )
}

export default InputComponent
