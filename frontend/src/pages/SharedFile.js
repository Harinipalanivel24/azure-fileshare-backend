import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const SharedFile = () => {
  const { token } = useParams();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSharedFile = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/files/shared/${token}`);
        setFile(data.file);
      } catch (err) {
        setError(err.response?.data?.message || 'File not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchSharedFile();
  }, [token]);

  const handleDownload = async () => {
    try {
      const response = await axios.get(`${API_URL}/files/shared/${token}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed.');
    }
  };

  const isImage = file?.mimeType?.startsWith('image/');
  const isPDF = file?.mimeType === 'application/pdf';

  if (loading) return <div className="shared-wrapper"><p>Loading…</p></div>;
  if (error) return <div className="shared-wrapper"><div className="card shared-card"><h2>😕 Oops</h2><p className="text-muted">{error}</p></div></div>;

  return (
    <div className="shared-wrapper">
      <div className="card shared-card">
        <h2>📎 {file.originalName}</h2>
        <p className="text-muted text-sm mb-1">
          {(file.size / 1024).toFixed(1)} KB &middot; Downloads: {file.downloadCount || 0}
        </p>

        {isImage && (
          <img
            src={file.blobUrl}
            alt={file.originalName}
            style={{ maxWidth: '100%', borderRadius: 'var(--radius)', margin: '1rem 0' }}
          />
        )}
        {isPDF && (
          <iframe
            src={file.blobUrl}
            title={file.originalName}
            style={{ width: '100%', height: '60vh', border: 'none', borderRadius: 'var(--radius)', margin: '1rem 0' }}
          />
        )}

        <button className="btn btn-primary mt-1" onClick={handleDownload}>
          ⬇ Download File
        </button>
      </div>
    </div>
  );
};

export default SharedFile;
