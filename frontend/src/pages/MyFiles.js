import React, { useEffect, useState, useCallback } from 'react';
import API from '../services/api';
import FilePreviewModal from '../components/FilePreviewModal';

const MyFiles = () => {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState('');
  const [previewFile, setPreviewFile] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const endpoint = query ? `/files/search?q=${encodeURIComponent(query)}` : '/files';
      const { data } = await API.get(endpoint);
      setFiles(data.files || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFiles(search);
  };

  const handleDownload = async (file) => {
    try {
      const response = await API.get(`/files/${file._id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      fetchFiles(search); // refresh download count
    } catch (err) {
      alert('Download failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this file permanently?')) return;
    try {
      await API.delete(`/files/${id}`);
      setFiles((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      alert('Delete failed.');
    }
  };

  const handleShare = async (id) => {
    try {
      const { data } = await API.post(`/files/${id}/share`);
      setShareUrl(data.shareUrl);
    } catch (err) {
      alert('Failed to generate share link.');
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const canPreview = (mime) => mime?.startsWith('image/') || mime === 'application/pdf';

  return (
    <div className="container">
      <h1 style={{ marginBottom: '1rem' }}>📁 My Files</h1>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          placeholder="Search files…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Search</button>
        {search && (
          <button type="button" className="btn btn-outline" onClick={() => { setSearch(''); fetchFiles(); }}>
            Clear
          </button>
        )}
      </form>

      {/* Share URL popup */}
      {shareUrl && (
        <div className="alert alert-success" style={{ wordBreak: 'break-all' }}>
          <strong>Share link:</strong>{' '}
          <a href={shareUrl} target="_blank" rel="noreferrer">{shareUrl}</a>
          <button
            className="btn btn-sm btn-outline"
            style={{ marginLeft: '0.5rem' }}
            onClick={() => { navigator.clipboard.writeText(shareUrl); }}
          >
            Copy
          </button>
          <button
            className="btn btn-sm btn-outline"
            style={{ marginLeft: '0.25rem' }}
            onClick={() => setShareUrl('')}
          >
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : files.length === 0 ? (
        <p className="text-muted">No files found.</p>
      ) : (
        <div className="file-grid">
          {files.map((file) => (
            <div className="file-card" key={file._id}>
              <div className="file-name">{file.originalName}</div>
              <div className="file-meta">
                {formatSize(file.size)} &middot; {new Date(file.createdAt).toLocaleDateString()} &middot; ⬇ {file.downloadCount || 0}
              </div>
              <div className="file-actions">
                {canPreview(file.mimeType) && (
                  <button className="btn btn-outline btn-sm" onClick={() => setPreviewFile(file)}>👁 Preview</button>
                )}
                <button className="btn btn-primary btn-sm" onClick={() => handleDownload(file)}>⬇ Download</button>
                <button className="btn btn-outline btn-sm" onClick={() => handleShare(file._id)}>🔗 Share</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(file._id)}>🗑 Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
};

export default MyFiles;
