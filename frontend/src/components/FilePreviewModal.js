import React from 'react';

const FilePreviewModal = ({ file, onClose }) => {
  if (!file) return null;

  const isImage = file.mimeType?.startsWith('image/');
  const isPDF = file.mimeType === 'application/pdf';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <strong>{file.originalName}</strong>
          <button className="btn btn-outline btn-sm" onClick={onClose}>✕ Close</button>
        </div>

        {isImage && <img src={file.blobUrl} alt={file.originalName} />}
        {isPDF && <iframe src={file.blobUrl} title={file.originalName} />}
        {!isImage && !isPDF && (
          <p className="text-muted">Preview not available for this file type. Please download it.</p>
        )}
      </div>
    </div>
  );
};

export default FilePreviewModal;
