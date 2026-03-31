import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileSelect = (selectedFile) => {
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.doc', '.docx', '.txt'];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      setMessage({ type: 'error', text: `File type ${ext} is not allowed.` });
      return;
    }
    setFile(selectedFile);
    setMessage({ type: '', text: '' });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setMessage({ type: '', text: '' });
    try {
      const formData = new FormData();
      formData.append('file', file);
      await API.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage({ type: 'success', text: 'File uploaded successfully!' });
      setFile(null);
      setTimeout(() => navigate('/files'), 1200);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 600 }}>
      <h1 style={{ marginBottom: '1.5rem' }}>⬆ Upload File</h1>

      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
          {message.text}
        </div>
      )}

      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx,.txt"
          onChange={(e) => { if (e.target.files.length) handleFileSelect(e.target.files[0]); }}
        />
        {file ? (
          <>
            <p style={{ fontWeight: 600, fontSize: '1rem' }}>📄 {file.name}</p>
            <p className="text-muted text-sm">{(file.size / 1024).toFixed(1)} KB — Click or drag to replace</p>
          </>
        ) : (
          <>
            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Drag & drop a file here</p>
            <p>or click to browse</p>
            <p className="text-muted text-sm mt-1">PDF, images, DOC, DOCX, TXT — Max 10 MB</p>
          </>
        )}
      </div>

      <button
        className="btn btn-primary mt-2"
        style={{ width: '100%' }}
        disabled={!file || uploading}
        onClick={handleUpload}
      >
        {uploading ? 'Uploading…' : 'Upload'}
      </button>
    </div>
  );
};

export default Upload;
