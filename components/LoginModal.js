import { useState } from 'react'
import axios from 'axios'
import { useStoreActions } from 'easy-peasy'

export const LoginModal = ({ showSignup }) => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { setUser } = useStoreActions(({ user }) => user)
  const { setHideModal } = useStoreActions(({ modals }) => modals)

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      if (response.data.status === 'error') {
        alert(response.data.status)
        return
      }
      setUser(email)
      setHideModal()
    } catch (e) {
      alert(e.response.data.message)
      return
    }
  }

  return (<>
    <h2>Log in</h2>
    <form onSubmit={handleSubmit}>
      <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email address" />
      <input id="password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" />
      <button type="submit">Log in</button>
    </form>
    <p>
      Don't have account yet?{' '}
      <a href="javascript:;" onClick={showSignup} >Sign up</a>
    </p>
  </>)
}