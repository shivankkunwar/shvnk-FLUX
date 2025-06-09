import React from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface VideoPlayerProps {
  videoPath: string;
  downloadPath: string;
  filename: string;
  onStartOver: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoPath, downloadPath, filename, onStartOver }) => {
  if (!videoPath) return null;
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <video
        controls
        style={{
          maxWidth: '720px',
          width: '100%',
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        src={videoPath}
      />
      
      <div style={{ 
        marginTop: '2rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <a
          href={downloadPath}
          download={filename}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #007AFF 0%, #8B5CF6 100%)',
            color: 'white',
            borderRadius: '0.75rem',
            textDecoration: 'none',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          Download
        </a>
        
        <button
          onClick={onStartOver}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12l3-3 3 3m0-6v6" />
          </svg>
          Create Another Video
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer; 