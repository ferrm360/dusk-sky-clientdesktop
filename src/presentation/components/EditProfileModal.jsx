import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { uploadProfileData } from '@business/userManagerService';

export default function EditProfileModal({ show, onHide, profile, onSave }) {
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [mediaFile, setMediaFile] = useState(null); // ✅ Preparado para multimedia
  const [bio, setBio] = useState(profile.bio || '');
  const [about, setAbout] = useState(profile.about_section || '');
  const [genres, setGenres] = useState(profile.favorite_genres || []);
  const [games, setGames] = useState(profile.favorite_games || []);

  const handleSubmit = async () => {
    await uploadProfileData(profile.user_id, {
      avatarFile,
      bannerFile,
      bio,
      about_section: about,
      mediaFile
    });

    if (onSave) await onSave(); // ✅ Asegura que se recargue si se pasó
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-dark text-white">
        <Modal.Title>Editar Perfil</Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-black text-white">
        <div className="mb-3">
          <label className="form-label">Foto de perfil</label>
          <input type="file" className="form-control" onChange={e => setAvatarFile(e.target.files[0])} />
        </div>

        <div className="mb-3">
          <label className="form-label">Imagen de portada</label>
          <input type="file" className="form-control" onChange={e => setBannerFile(e.target.files[0])} />
        </div>

        <div className="mb-3">
          <label className="form-label">Bio corta</label>
          <textarea className="form-control bg-dark text-white" value={bio} onChange={e => setBio(e.target.value)} maxLength={500} rows={2} />
        </div>

        <div className="mb-3">
          <label className="form-label">Acerca de ti</label>
          <textarea className="form-control bg-dark text-white" value={about} onChange={e => setAbout(e.target.value)} maxLength={5000} rows={4} />
        </div>

        <div className="mb-3">
          <label className="form-label">Géneros favoritos</label>
          <input
            className="form-control bg-dark text-white"
            type="text"
            placeholder="Separados por coma: RPG, Indie, Horror"
            value={genres.join(', ')}
            onChange={e => setGenres(e.target.value.split(',').map(s => s.trim()))}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Juegos favoritos (máx 4)</label>
          <input
            className="form-control bg-dark text-white"
            type="text"
            placeholder="Ej: Hollow Knight, Nier Automata"
            value={games.join(', ')}
            onChange={e => {
              const newGames = e.target.value.split(',').map(s => s.trim());
              if (newGames.length <= 4) setGames(newGames);
            }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Archivo multimedia (opcional)</label>
          <input type="file" className="form-control" onChange={e => setMediaFile(e.target.files[0])} />
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-dark text-white">
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={handleSubmit}>Guardar cambios</Button>
      </Modal.Footer>
    </Modal>
  );
}
