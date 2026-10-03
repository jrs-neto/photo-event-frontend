import React, { useState, useEffect, useRef } from 'react';
import { ImagePicker } from '../components/ImagePicker';
import { ImagePreview } from '../components/ImagePreview';
import { SubmissionForm } from '../components/SubmissionForm';
import { ProgressBar } from '../components/ProgressBar';
import { submitPhotos } from '../services/api';

export const PublicUploadPage = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [formData, setFormData] = useState({
    visitor_name: '',
    visitor_group: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [feedback, setFeedback] = useState({ type: null, message: null });

  // Referência mutável para ter sempre a lista atualizada no cleanup final de desmontagem do componente
  const previewsRef = useRef(previews);
  previewsRef.current = previews;

  // Revoga todas as Object URLs criadas SOMENTE quando a página é desmontada
  useEffect(() => {
    return () => {
      previewsRef.current.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, []);

  const handleFilesSelected = (newFiles) => {
    const newPreviews = newFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveFile = (index) => {
    // Revoga explicitamente apenas a URL do item que está sendo removido
    URL.revokeObjectURL(previews[index].url);

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      setFeedback({ type: 'error', message: 'Selecione pelo menos uma foto ou vídeo para enviar.' });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setFeedback({ type: null, message: null });

    const payload = new FormData();
    if (formData.visitor_name.trim()) payload.append('visitor_name', formData.visitor_name.trim());
    if (formData.visitor_group.trim()) payload.append('visitor_group', formData.visitor_group.trim());
    if (formData.message.trim()) payload.append('message', formData.message.trim());

    selectedFiles.forEach((file) => {
      payload.append('photos', file);
    });

    try {
      await submitPhotos(payload, (progress) => {
        setUploadProgress(progress);
      });

      setFeedback({
        type: 'success',
        message: 'Suas mídias foram enviadas com sucesso! Obrigado por compartilhar.',
      });

      // Limpa individualmente as Object URLs após sucesso antes de zerar os estados
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setSelectedFiles([]);
      setPreviews([]);
      setFormData({ visitor_name: '', visitor_group: '', message: '' });
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.message ||
        'Ocorreu um erro ao enviar suas mídias. Tente novamente.';

      setFeedback({ type: 'error', message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '1.25rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '1.625rem',
            fontWeight: '800',
            margin: '0 0 0.5rem 0',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.025em',
          }}
        >
          Compartilhe seus momentos com a Manu e a Gabi
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 'bold', margin: 0 }}>
          Envie os momentos que você registrou durante o evento.
        </p>
      </header>

      {feedback.message && (
        <div
          style={{
            padding: '0.875rem',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            backgroundColor: feedback.type === 'error' ? '#fee2e2' : '#dcfce7',
            color: feedback.type === 'error' ? '#991b1b' : '#166534',
            border: `1px solid ${feedback.type === 'error' ? '#fca5a5' : '#86efac'}`,
          }}
        >
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <ImagePicker
          currentFilesCount={selectedFiles.length}
          onFilesSelected={handleFilesSelected}
          onError={(msg) => setFeedback({ type: 'error', message: msg })}
        />

        <ImagePreview previews={previews} onRemove={handleRemoveFile} />

        <SubmissionForm formData={formData} onChange={handleInputChange} disabled={isSubmitting} />

        {isSubmitting && <ProgressBar progress={uploadProgress} />}

        <button
          type="submit"
          disabled={isSubmitting || selectedFiles.length === 0}
          style={{
            width: '100%',
            padding: '0.875rem',
            marginTop: '1rem',
            backgroundColor: isSubmitting || selectedFiles.length === 0 ? '#9ca3af' : '#8b5cf6',
            color: '#ffffff',
            fontWeight: '600',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: isSubmitting || selectedFiles.length === 0 ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s ease',
          }}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Fotos/Vídeos'}
        </button>
      </form>
    </div>
  );
};