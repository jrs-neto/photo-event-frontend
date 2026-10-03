import React from 'react';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

// Tipos aceitos pelo backend
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

const ACCEPT_ATTRIBUTE = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(',');

export const ImagePicker = ({ currentFilesCount, onFilesSelected, onError }) => {
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // 1. Valida quantidade total (máximo de 10 arquivos)
    if (currentFilesCount + selectedFiles.length > 10) {
      onError(`Você pode enviar no máximo 10 arquivos por vez. Você já tem ${currentFilesCount} selecionado(s).`);
      e.target.value = '';
      return;
    }

    // 2. Valida tipo e limite de tamanho individual por mídia
    for (const file of selectedFiles) {
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

      if (!isImage && !isVideo) {
        onError(`O arquivo "${file.name}" tem um formato não suportado.`);
        e.target.value = '';
        return;
      }

      if (isImage && file.size > MAX_IMAGE_SIZE) {
        onError(`A imagem "${file.name}" excede o limite de 10 MB.`);
        e.target.value = '';
        return;
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        onError(`O vídeo "${file.name}" excede o limite de 50 MB.`);
        e.target.value = '';
        return;
      }
    }

    onError(null);
    onFilesSelected(selectedFiles);
    e.target.value = ''; // Reseta input para permitir re-seleção se necessário
  };

  return (
    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
      <label
        htmlFor="media-input"
        style={{
          display: 'inline-block',
          width: '100%',
          padding: '0.875rem 1rem',
          backgroundColor: '#8b5cf6',
          color: '#ffffff',
          fontWeight: '600',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        📸 Selecionar Fotos ou Vídeos
      </label>
      <input
        id="media-input"
        type="file"
        multiple
        accept={ACCEPT_ATTRIBUTE}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <small style={{ display: 'block', color: '#6b7280', marginTop: '0.5rem' }}>
        Máximo de 10 arquivos (Fotos até 10 MB | Vídeos até 50 MB).
      </small>
    </div>
  );
};