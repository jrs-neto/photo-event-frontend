import React from 'react';

export const ProgressBar = ({ progress }) => {
  return (
    <div style={{ width: '100%', marginTop: '1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.25rem',
          fontSize: '0.875rem',
          fontWeight: '500',
        }}
      >
        <span>Enviando fotos...</span>
        <span>{progress}%</span>
      </div>
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#2563eb',
            transition: 'width 0.2s ease-in-out',
          }}
        />
      </div>
    </div>
  );
};