import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface UpdateInfo {
  version: string;
  releaseNotes?: string;
  releaseDate?: string;
}

interface DownloadProgress {
  percent: number;
  bytesPerSecond: number;
  total: number;
  transferred: number;
}

interface UpdateNotificationProps {
  onClose: () => void;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onClose }) => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [status, setStatus] = useState<'checking' | 'available' | 'downloading' | 'downloaded' | 'error' | 'not-available'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    // Setup event listeners
    const cleanupStatus = window.electronAPI.updater.onUpdateStatus((_, data) => {
      setStatus('checking');
      setError(null);
    });

    const cleanupAvailable = window.electronAPI.updater.onUpdateAvailable((_, data) => {
      setUpdateInfo(data);
      setStatus('available');
      setIsVisible(true);
    });

    const cleanupNotAvailable = window.electronAPI.updater.onUpdateNotAvailable((_, data) => {
      setStatus('not-available');
      setTimeout(() => setIsVisible(false), 3000); // Auto-hide after 3 seconds
    });

    const cleanupError = window.electronAPI.updater.onUpdateError((_, data) => {
      setError(data.error);
      setStatus('error');
      setIsVisible(true);
    });

    const cleanupProgress = window.electronAPI.updater.onDownloadProgress((_, data) => {
      setDownloadProgress(data);
      setStatus('downloading');
    });

    const cleanupDownloaded = window.electronAPI.updater.onUpdateDownloaded((_, data) => {
      setStatus('downloaded');
      setDownloadProgress(null);
    });

    cleanupFunctions.push(
      cleanupStatus,
      cleanupAvailable,
      cleanupNotAvailable,
      cleanupError,
      cleanupProgress,
      cleanupDownloaded
    );

    // Cleanup on unmount
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, []);

  const handleDownload = async () => {
    try {
      setStatus('downloading');
      await window.electronAPI.updater.downloadUpdate();
    } catch (err) {
      setError('Failed to download update');
      setStatus('error');
    }
  };

  const handleInstall = async () => {
    try {
      await window.electronAPI.updater.installUpdate();
    } catch (err) {
      setError('Failed to install update');
      setStatus('error');
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  const getStatusColor = () => {
    switch (status) {
      case 'error': return 'border-red-500 bg-red-50';
      case 'available': return 'border-blue-500 bg-blue-50';
      case 'downloading': return 'border-yellow-500 bg-yellow-50';
      case 'downloaded': return 'border-green-500 bg-green-50';
      case 'not-available': return 'border-gray-500 bg-gray-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'error': return <ExclamationCircleIcon className="w-6 h-6 text-red-500" />;
      case 'available': case 'downloading': return <ArrowDownTrayIcon className="w-6 h-6 text-blue-500" />;
      case 'downloaded': return <ArrowDownTrayIcon className="w-6 h-6 text-green-500" />;
      default: return <ArrowDownTrayIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'checking':
        return (
          <div className="text-gray-600">
            <p>Checking for updates...</p>
          </div>
        );

      case 'available':
        return (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Update Available: v{updateInfo?.version}
            </h3>
            {updateInfo?.releaseNotes && (
              <div className="text-sm text-gray-600 mb-3 max-h-20 overflow-y-auto">
                <p>{updateInfo.releaseNotes}</p>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Download Update
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        );

      case 'downloading':
        return (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Downloading Update...
            </h3>
            {downloadProgress && (
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{Math.round(downloadProgress.percent)}%</span>
                  <span>
                    {(downloadProgress.bytesPerSecond / 1024 / 1024).toFixed(1)} MB/s
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress.percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'downloaded':
        return (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Update Downloaded
            </h3>
            <p className="text-gray-600 mb-3">
              The update has been downloaded and is ready to install. The application will restart.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Install & Restart
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Install Later
              </button>
            </div>
          </div>
        );

      case 'not-available':
        return (
          <div className="text-gray-600">
            <p>Your application is up to date!</p>
          </div>
        );

      case 'error':
        return (
          <div>
            <h3 className="font-semibold text-red-600 mb-2">
              Update Error
            </h3>
            <p className="text-gray-600 mb-3">{error}</p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Close
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 max-w-md w-full z-50">
      <div className={`border-l-4 rounded-md p-4 shadow-lg ${getStatusColor()}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
          <div className="ml-3 flex-1">
            {renderContent()}
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification; 