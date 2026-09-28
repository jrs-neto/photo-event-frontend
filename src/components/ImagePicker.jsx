import React from 'react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = 'image/jpeg,image/png,image/webp,image/heic,image/heif';

export const ImagePicker = ({ currentFilesCount, onFilesSelected, onError }) => {
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // 1. Valida quantidade total (máximo de 10 fotos)
    if (currentFilesCount + selectedFiles.length > 10) {
      onError(`Você pode enviar no máximo 10 fotos por vez. Você já tem ${currentFilesCount} selecionada(s).`);
      e.target.value = '';
      return;
    }

    // 2. Valida tamanho de cada arquivo (máximo 10MB)
    const overSizedFile = selectedFiles.find((file) => file.size > MAX_FILE_SIZE);
    if (overSizedFile) {
      onError(`O arquivo "${overSizedFile.name}" excede o limite de 10 MB.`);
      e.target.value = '';
      return;
    }

    onError(null);
    onFilesSelected(selectedFiles);
    e.target.value = ''; // Reseta input para permitir re-seleção do mesmo arquivo se necessário
  };

  return (
    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
      <label
        htmlFor="photo-input"
        style={{
          display: 'inline-block',
          width: '100%',
          padding: '0.875rem 1rem',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          fontWeight: '600',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        📸 Selecionar Fotos
      </label>
      <input
        id="photo-input"
        type="file"
        multiple
        accept={ALLOWED_TYPES}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <small style={{ display: 'block', color: '#6b7280', marginTop: '0.5rem' }}>
        Máximo de 10 fotos (até 10 MB cada). Formatos: JPG, PNG, WEBP, HEIC.
      </small>
    </div>
  );
};