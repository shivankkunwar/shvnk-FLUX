import React from 'react';

interface VideoPlayerProps {
  videoUrl: string | null;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  if (!videoUrl) return null;
  return (
    <div className="mt-6 text-center">
      <video
        controls
        className="mx-auto shimmer-border"
        width="720"
        src={videoUrl}
      />
      <div className="mt-2">
        <a
          href={videoUrl}
          download
          className="px-4 py-2 bg-cyan-500 text-black rounded hover:bg-cyan-400"
        >
          Download MP4
        </a>
      </div>
    </div>
  );
};

export default VideoPlayer; 