import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState({ totalFiles: 0, totalSize: 0, totalDownloads: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/files');
        const files = data.files || [];
        setStats({
          totalFiles: files.length,
          totalSize: files.reduce((acc, f) => acc + (f.size || 0), 0),
          totalDownloads: files.reduce((acc, f) => acc + (f.downloadCount || 0), 0),
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '0.5rem' }}>👋 Hello, {user.name || 'User'}!</h1>
      <p className="text-muted mb-1">Welcome to your CloudShare dashboard.</p>

      <div className="file-grid" style={{ marginTop: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{stats.totalFiles}</h3>
          <p className="text-muted">Files Uploaded</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: 'var(--accent)' }}>{formatSize(stats.totalSize)}</h3>
          <p className="text-muted">Total Storage</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', color: 'var(--success)' }}>{stats.totalDownloads}</h3>
          <p className="text-muted">Total Downloads</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
        <Link to="/upload" className="btn btn-primary">⬆ Upload Files</Link>
        <Link to="/files" className="btn btn-outline">📁 My Files</Link>
      </div>
    </div>
  );
};

export default Dashboard;
