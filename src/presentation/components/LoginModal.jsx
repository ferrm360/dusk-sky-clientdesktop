import InputField from './InputField'

export default function LoginModal({ username, setUsername, password, setPassword, onSubmit,   onRegisterClick // 👈 agrega esto aquí si no está
 }) {
  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{
        background: "rgba(36,47,60,0.00)", // transparente, fondo ya está abajo
        minHeight: "100vh"
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content" style={{ background: "#506273", color: "#fff", minWidth: 340 }}>
          <div className="modal-header border-0">
            <h5 className="modal-title w-100 text-center" style={{ letterSpacing: 1 }}>INICIAR SESIÓN</h5>
          </div>
          <form onSubmit={onSubmit}>
            <div className="modal-body">
              <InputField
                label="Usuario"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
                required
              />
              <InputField
                label="Contraseña"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="modal-footer border-0 d-flex flex-column align-items-center">
              <button
                type="submit"
                className="btn"
                style={{
                  background: "#18ef89",
                  color: "#264040",
                  fontWeight: 700,
                  letterSpacing: 1,
                  padding: "0.5rem 2.5rem"
                }}
              >
                ENTRAR
              </button>

              <button
                type="button"
                className="btn"
                style={{
                  background: "transparent",
                  color: "#fff",
                  fontWeight: 500,
                  letterSpacing: 1,
                  textDecoration: "underline"
                }}
                onClick={onRegisterClick} 
              >
                ¿No tienes cuenta? Registrarse
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
