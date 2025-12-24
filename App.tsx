import React, { useState } from 'react';
import StoryFinder from './components/StoryFinder';
import ScriptWriter from './components/ScriptWriter';
import MediaGenerator from './components/MediaGenerator';
import { PipelineStep, Story, Script } from './types';

function App() {
  const [step, setStep] = useState<PipelineStep>(PipelineStep.SEARCH);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [finalScript, setFinalScript] = useState<Script | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleStorySelect = (story: Story) => {
    setSelectedStory(story);
    setStep(PipelineStep.SCRIPT);
  };

  const handleScriptComplete = (script: Script) => {
    setFinalScript(script);
    setStep(PipelineStep.ASSETS);
  };

  const handleUpload = () => {
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
        setIsUploading(false);
        setUploadComplete(true);
        setStep(PipelineStep.UPLOAD);
    }, 3000);
  };

  const reset = () => {
    setStep(PipelineStep.SEARCH);
    setSelectedStory(null);
    setFinalScript(null);
    setUploadComplete(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
                    SS
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">StoryStream</h1>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-gray-400">
                <div className={`flex items-center gap-2 ${step >= PipelineStep.SEARCH ? 'text-indigo-400' : ''}`}>
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">1</span>
                    <span className="hidden sm:inline">Find</span>
                </div>
                <div className="w-8 h-px bg-gray-700"></div>
                <div className={`flex items-center gap-2 ${step >= PipelineStep.SCRIPT ? 'text-purple-400' : ''}`}>
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">2</span>
                    <span className="hidden sm:inline">Write</span>
                </div>
                <div className="w-8 h-px bg-gray-700"></div>
                <div className={`flex items-center gap-2 ${step >= PipelineStep.ASSETS ? 'text-pink-400' : ''}`}>
                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs">3</span>
                    <span className="hidden sm:inline">Create</span>
                </div>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {step === PipelineStep.SEARCH && (
            <StoryFinder onStorySelect={handleStorySelect} />
        )}

        {step === PipelineStep.SCRIPT && selectedStory && (
            <ScriptWriter 
                story={selectedStory} 
                onScriptComplete={handleScriptComplete}
                onBack={() => setStep(PipelineStep.SEARCH)}
            />
        )}

        {step === PipelineStep.ASSETS && finalScript && (
            <MediaGenerator 
                script={finalScript} 
                onUpload={handleUpload}
                onBack={() => setStep(PipelineStep.SCRIPT)}
            />
        )}

        {step === PipelineStep.UPLOAD && uploadComplete && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center">
                <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Upload Successful!</h2>
                <p className="text-gray-400 max-w-md mx-auto mb-8">
                    Your video has been compiled and uploaded to the StoryStream channel. Check your YouTube Studio for analytics.
                </p>
                <button 
                    onClick={reset}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                    Create Another Video
                </button>
            </div>
        )}
      </main>

      {/* Upload Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-[loading_2s_ease-in-out_infinite]"></div>
            </div>
            <p className="text-white font-medium animate-pulse">Uploading to YouTube...</p>
        </div>
      )}

      <footer className="border-t border-gray-800 py-6 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} StoryStream Automation. Powered by Gemini.</p>
      </footer>

      <style>{`
        @keyframes loading {
            0% { width: 0%; transform: translateX(-100%); }
            50% { width: 100%; transform: translateX(0); }
            100% { width: 0%; transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

export default App;