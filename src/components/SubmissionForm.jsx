import React from 'react';

export const SubmissionForm = ({ formData, onChange, disabled }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
          Nome
        </label>
        <input
          type="text"
          name="visitor_name"
          value={formData.visitor_name}
          onChange={onChange}
          disabled={disabled}
          placeholder="Ex: Ana Silva"
          maxLength={100}
          style={{
            width: '100%',
            padding: '0.625rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
          Grupo / Mesa (Opcional)
        </label>
        <input
          type="text"
          name="visitor_group"
          value={formData.visitor_group}
          onChange={onChange}
          disabled={disabled}
          placeholder="Ex: Família das aniversariantes / Mesa 04"
          maxLength={100}
          style={{
            width: '100%',
            padding: '0.625rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
          Mensagem
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={onChange}
          disabled={disabled}
          placeholder="Deixe sua mensagem para as aniversariantes..."
          maxLength={500}
          rows={3}
          style={{
            width: '100%',
            padding: '0.625rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
      </div>
    </div>
  );
};