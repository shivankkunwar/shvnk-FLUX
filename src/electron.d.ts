// frontend/src/electron.d.ts
export interface IElectronAPI {
  generateVideo: (params: any) => Promise<{ 
    success: boolean; 
    runId?: string; 
    videoPath?: string; 
    downloadPath?: string;
    filename?: string;
    error?: string 
  }>;
  checkHealth: () => Promise<{ status: string; message?: string }>;
  downloadVideo: (path: string) => Promise<any>;
  onRenderLog: (callback: (event: any, data: any) => void) => () => void;
  updater: {
    checkForUpdates: () => Promise<{ success?: boolean; error?: string; result?: any }>;
    downloadUpdate: () => Promise<{ success?: boolean; error?: string }>;
    installUpdate: () => Promise<{ success?: boolean; error?: string }>;
    getAppVersion: () => Promise<string>;
    onUpdateStatus: (callback: (event: any, data: { type: string; message: string }) => void) => () => void;
    onUpdateAvailable: (callback: (event: any, data: { 
      version: string; 
      releaseNotes?: string; 
      releaseDate?: string 
    }) => void) => () => void;
    onUpdateNotAvailable: (callback: (event: any, data: { version: string }) => void) => () => void;
    onUpdateError: (callback: (event: any, data: { error: string }) => void) => () => void;
    onDownloadProgress: (callback: (event: any, data: { 
      percent: number; 
      bytesPerSecond: number; 
      total: number; 
      transferred: number 
    }) => void) => () => void;
    onUpdateDownloaded: (callback: (event: any, data: { version: string }) => void) => () => void;
  };
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
} 