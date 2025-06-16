import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export default function UserSettingsModal({ show, onClose }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const handleSave = () => {
    onClose();
  };

  const handleDelete = () => {
    if (confirmDelete && deletePassword) {
      console.log('Cuenta eliminada');
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Configuración de cuenta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nuevo correo"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nombre de usuario</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nuevo usuario"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nueva contraseña"
            />
          </Form.Group>

          <hr />

          <Form.Check
            type="checkbox"
            label="Quiero eliminar mi cuenta"
            checked={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.checked)}
            className="text-danger"
          />

          {confirmDelete && (
            <Form.Group className="mt-3">
              <Form.Label>Confirma tu contraseña para eliminar la cuenta</Form.Label>
              <Form.Control
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Contraseña actual"
              />
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave}>Guardar cambios</Button>
        {confirmDelete && (
          <Button variant="danger" onClick={handleDelete}>Eliminar cuenta</Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
