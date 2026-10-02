import React from 'react';

export const ImagePreview = ({ previews, onRemove }) => {
  if (previews.length === 0) return null;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
        {previews.length} {previews.length === 1 ? 'mídia selecionada' : 'mídias selecionadas'}:
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: '0.5rem',
        }}
      >
        {previews.map((item, index) => (
          <div
            key={item.url}
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '100%',
              borderRadius: '0.375rem',
              overflow: 'hidden',
              backgroundColor: '#f3f4f6',
            }}
          >
            {item.type === 'video' ? (
              <video
                src={item.url}
                muted
                playsInline
                preload="metadata"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <img
                src={item.url}
                alt={`Preview ${index + 1}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            )}
            <button
              type="button"
              onClick={() => onRemove(index)}
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                lineHeight: 1,
              }}
              title="Remover mídia"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};