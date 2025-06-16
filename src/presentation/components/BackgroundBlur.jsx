// Usa imagen o video como fondo borroso

export default function BackgroundBlur({ src, type = 'image' }) {
  if (type === 'video') {
    return (
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          filter: 'blur(8px) brightness(0.6)'
        }}
      />
    )
  }

  // Por defecto, imagen
  return (
    <img
      src={src}
      alt="fondo"
      style={{
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        objectFit: 'cover',
        zIndex: 0,
        filter: 'blur(8px) brightness(0.6)'
      }}
    />
  )
}
