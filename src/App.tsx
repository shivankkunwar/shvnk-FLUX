import  { useState, useEffect } from 'react'
import './index.css' // Ensure this is imported
import { useApiKey } from './contexts/ApiKeyContext'
import Header from './components/Header'
import LandingPage from './components/LandingPage'
import ProgressModal from './components/ProgressModal'
import VideoPlayer from './components/VideoPlayer'
import UpdateNotification from './components/UpdateNotification'
import UpdateChecker from './components/UpdateChecker'

interface VideoResult {
  videoPath: string;
  downloadPath: string;
  filename: string;
}

function App() {
  const [runId, setRunId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'landing' | 'preparing' | 'processing' | 'result'>('landing')
  const [selectedEngine, setSelectedEngine] = useState<'p5' | 'manim'>('p5')
  const [logs, setLogs] = useState<string[]>([])
  const { apiKey } = useApiKey()
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false) // This state seems unused, consider removing if not planned for use
  const [showUpdateNotification, setShowUpdateNotification] = useState(false)
  const [appVersion, setAppVersion] = useState<string>('')

  // Get app version on mount
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.updater.getAppVersion().then(version => {
        setAppVersion(version);
      }).catch(console.error);
    }
  }, [window.electronAPI]); // Added window.electronAPI to dependency array

  // Set up log listener for real-time progress updates
  useEffect(() => {
    if (window.electronAPI) {
      const cleanup = window.electronAPI.onRenderLog((event, data) => {
        setLogs(prev => [...prev, data.message]);
      });

      // Cleanup function to remove listeners when component unmounts
      return cleanup;
    }
  }, []); // Assuming window.electronAPI doesn't change, or add if it might

  const handleSubmit = async (prompt: string, engine: 'p5' | 'manim', duration: number) => {
    setRunId(null)
    setVideoUrl(null)
    setLogs([])
    setSelectedEngine(engine)
    setCurrentView('preparing')
    
    if (!apiKey) {
      alert('Please enter your API key')
      setCurrentView('landing')
      return
    }
    
    if (!window.electronAPI) {
      alert('This app must be run as an Electron application')
      setCurrentView('landing')
      return
    }
    
    try {
      const newRunId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString()
      setRunId(newRunId)
      setCurrentView('processing')
      
      const result = await window.electronAPI.generateVideo({
        prompt,
        engine,
        apiKey,
        duration
      });
      
      if (result.success && result.videoPath) {
        setVideoUrl(result.videoPath)
        setCurrentView('result')
        setVideoResult({
          videoPath: result.videoPath,
          downloadPath: result.downloadPath || '',
          filename: result.filename || 'video.mp4',
        });
      } else {
        throw new Error('Video generation failed')
      }
    } catch (err) {
      console.error(err)
      alert((err as Error).message)
      setCurrentView('landing')
    }
  }

  const handleVideoComplete = (url: string) => {
    if (url === 'video-generated' && videoResult?.videoPath) {
      setVideoUrl(videoResult.videoPath)
    } else if (url !== 'video-generated') {
      setVideoUrl(url)
    }
    setCurrentView('result')
  }

  const handleStartOver = () => {
    setRunId(null)
    setVideoUrl(null)
    setLogs([])
    setSelectedEngine('p5')
    setCurrentView('landing')
  }

  const handleUpdateCheck = () => {
    setShowUpdateNotification(true);
  }

  const handleUpdateNotificationClose = () => {
    setShowUpdateNotification(false);
  }

  return (
    <div className="min-h-screen bg-gray-950"> {/* Replaced inline styles */}
      <Header selectedEngine={selectedEngine} />
      
      {showUpdateNotification && (
        <UpdateNotification onClose={handleUpdateNotificationClose} />
      )}
      
      <div className="fixed top-4 right-4 z-40 flex items-center space-x-4"> {/* Replaced inline styles */}
        {appVersion && (
          <span className="text-gray-400 text-xs bg-black/50 px-2 py-1 rounded-sm"> {/* Replaced inline styles */}
            v{appVersion}
          </span>
        )}
        <UpdateChecker onUpdateCheck={handleUpdateCheck} />
      </div>
      
      <main className="pt-16"> {/* Replaced inline styles */}
        {currentView === 'landing' && (
          <LandingPage onSubmit={handleSubmit} />
        )}

        {currentView === 'preparing' && (
          <div className="min-h-screen flex items-center justify-center preparing-bg"> {/* Used custom class */}
            <div className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-3xl py-12 px-8 sm:px-16 text-center max-w-lg shadow-2xl animate-fadeInScale"> {/* Tailwind classes, adjusted padding and max-width */}
              <div className="w-20 h-20 mx-auto mb-8 relative flex items-center justify-center">
                <div className="absolute w-20 h-20 spinning-border" /> {/* Custom class */}
                <div className="w-12 h-12 rounded-full flex items-center justify-center pulsing-circle-bg animate-pulse-local"> {/* Custom classes */}
                  {selectedEngine === 'manim' ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  )}
                </div>
                {/* Particles with Tailwind for base styling + custom animation class */}
                <div className="absolute w-1.5 h-1.5 bg-blue-500 rounded-full top-[10px] left-1/2 animate-particle-float" style={{ animationDelay: '0s' }} />
                <div className="absolute w-1 h-1 bg-purple-500 rounded-full bottom-[10px] right-[10px] animate-particle-float" style={{ animationDelay: '1s' }} />
                <div className="absolute w-[5px] h-[5px] bg-emerald-500 rounded-full bottom-[15px] left-[10px] animate-particle-float" style={{ animationDelay: '2s' }} />
              </div>

              <h2 className="text-3xl font-bold text-white mb-4 text-gradient-blue-purple"> {/* Custom gradient class */}
                Preparing Render Environment
              </h2>
              
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Setting up {selectedEngine === 'manim' ? 'mathematical animation' : 'creative coding'} workspace...
              </p>

              <div className="flex justify-center gap-3 mb-8">
                {['Initializing', 'Configuring', 'Ready'].map((status, index) => (
                  <div key={status} className="flex items-center gap-2 animate-fadeInLeft" style={{ animationDelay: `${index * 0.3}s`}}> {/* Tailwind classes + animationDelay for stagger */}
                    <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-blue-500 animate-pulse-local' : 'bg-white/30'}`} />
                    <span className={`text-sm ${index === 0 ? 'text-blue-400 font-medium' : 'text-gray-400'}`}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'processing' && runId && (
          <ProgressModal 
            runId={runId} 
            onDone={handleVideoComplete} 
            engine={selectedEngine}
            logs={logs}
          />
        )}

        {currentView === 'result' && videoResult && (
          <VideoPlayer
            videoPath={videoResult.videoPath}
            downloadPath={videoResult.downloadPath}
            filename={videoResult.filename}
            onStartOver={handleStartOver}
          />
        )}
      </main>
    </div>
  )
}

export default App
