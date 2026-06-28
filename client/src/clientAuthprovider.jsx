import React from 'react'
import axios from 'axios'
import { useEffect, useState } from 'react';
import useProfile from '../public/context/profile';
import useRefresh from '../public/context/refresh';
import useError from '../public/context/error';
import useLoading from '../public/context/loading';
import useAuth from '../public/context/auth';
import useSocket from '../public/pages/sections/chat/context/socketContext';

const ClientAuthprovider = ({ children }) => {

  const isAuthenticated    = useAuth((state) => state.auth)
  const setIsAuthenticated = useAuth((state) => state.setAuth)
  const setProfile = useProfile((state) => state.setProfile)
  const refresh = useRefresh((state) => state.refresh)
  const setError = useError((state) => state.setError)
  const setLoading = useLoading((state) => state.setLoading)

  // ← grab socket actions from zustand
  const connectSocket    = useSocket((state) => state.connectSocket)
  const disconnectSocket = useSocket((state) => state.disconnectSocket)

  async function fetchAuth() {
    try {
      const res = await axios.get('/api/auth-check', { withCredentials: true })
      let data = res.data
      if (data.data) setProfile(data || [])
      setIsAuthenticated(data.authenticated || false)
    } catch (error) {
      console.log(error)
    }
  }

  async function fetchProfile() {
    setLoading(true)
    try {
      const res = await axios.get('/api/profile', { withCredentials: true })
      let data = res.data
      if (data.data) setProfile(data || [])
      setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
      setError(true)
    }
  }

  useEffect(() => {
    fetchProfile()
    fetchAuth()
  }, [refresh])

  // ← connect socket once user is authenticated, disconnect on logout
  useEffect(() => {
    if (isAuthenticated) {
      connectSocket()
    } else {
      disconnectSocket()
    }
  }, [isAuthenticated])

  return isAuthenticated ? children : null
}

export default ClientAuthprovider