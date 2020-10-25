import React, { useState } from 'react'
import axios from 'axios'
import { useStoreActions } from 'easy-peasy'


export const RegistrationModal = ({ showLogin }) => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordconfirmation, setPasswordconfirmation] = useState('')

  const { setUser } = useStoreActions(({ user }) => user)
  const { setHideModal } = useStoreActions(({ modals }) => modals)

  const submit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/auth/register', { email, password, passwordconfirmation })
      if (response.data.status === 'error') {
        console.log('[KEKEKE]', response.data.message)
        return
      }
      setUser(email)
      setHideModal()
    } catch (e) {
      console.log('[ERROR]', e.response.data.message)
      return
    }
  }
  return (<>
    <h2>Sign up</h2>
    <form onSubmit={submit}>
      <input id="email" type="email" placeholder="Email address" value={email} onChange={event => setEmail(event.target.value)} />
      <input id="password" type="password" placeholder="Password" value={password} onChange={event => setPassword(event.target.value)} />
      <input id="passwordconfirmation" type="password" placeholder="Enter password again" value={passwordconfirmation} onChange={event => setPasswordconfirmation(event.target.value)} />
      <button type="submit">Sign up</button>
    </form>
    <p>
      Already account yet?{' '}
      <a href="javascript:;" onClick={showLogin}>Log in</a>
    </p>
  </>)
}