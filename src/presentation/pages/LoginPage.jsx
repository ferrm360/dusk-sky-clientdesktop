import React, { useState } from 'react'
import BackgroundBlur from '../components/BackgroundBlur'
import LoginModal from '../components/LoginModal'
import RegisterModal from '../components/RegisterModal'
import bgImg from '../assets/login-bg.png'
import { login, register } from "../../business/authService"
import UserSessionManager from '../../business/UserSessionManager'
import { useNavigate } from 'react-router-dom'

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async ({ username, email, password }) => {
    try {
      await register({ username, email, password })
      await login(username, password)
      navigate('/') 
    } catch (error) {
      alert("Error al registrarse: " + (error.message || "Intenta de nuevo"))
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await login(username, password)
      navigate('/')
    } catch (error) {
      alert("Error al iniciar sesión: " + error.message)
    }
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      <BackgroundBlur src={bgImg} type="image" />

      <div style={{
        position: 'fixed',
        top: 0, left: 0, width: '100vw', height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1
      }}>
        {
          isRegistering ? (
            <RegisterModal
              username={username}
              setUsername={setUsername}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              onSubmit={e => {
                e.preventDefault()
                if (password !== confirmPassword) {
                  alert("Las contraseñas no coinciden")
                  return
                }
                handleRegister({ username, email, password })
              }}
              onCancel={() => setIsRegistering(false)}
            />
          ) : (
            <LoginModal
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              onSubmit={handleLogin}
              onRegisterClick={() => setIsRegistering(true)}
            />
          )
        }
      </div>
    </div>
  )
}
