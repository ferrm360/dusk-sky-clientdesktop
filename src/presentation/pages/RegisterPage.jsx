import React, { useState } from 'react'
import BackgroundBlur from '../components/BackgroundBlur'
import RegisterModal from '../components/RegisterModal'
import bgImg from '../assets/login-bg.png'

export default function RegisterPage({ onRegister, onCancel }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

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
            onRegister?.({ username, email, password })
          }}
          onCancel={onCancel}
        />
      </div>
    </div>
  )
}
