import React, { useState, useEffect } from 'react';
import { generateVoiceover, generateBackgroundVideo, generateThumbnail, checkApiKey, promptApiKeySelection } from '../services/geminiService';
import { Script } from '../types';

interface MediaGeneratorProps {
  script: Script;
  onUpload: () => void;
  onBack: () => void;
}

const MediaGenerator: React.FC<MediaGeneratorProps> = ({ script, onUpload, onBack }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [loadingThumb, setLoadingThumb] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState(false);

  useEffect(() => {
    checkApiKey().then(setApiKeyValid);
  }, []);

  const handleKeySelection = async () => {
    await promptApiKeySelection();
    setApiKeyValid(true);
  };

  const handleGenAudio = async () => {
    setLoadingAudio(true);
    try {
        // Use the full script content for audio generation
        // The script is now expected to be clean narration based on the writeScript update
        const result = await generateVoiceover(script.content);
        setAudioUrl(result.audioUrl);
    } catch (e) {
        console.error(e);
        alert("Audio generation failed");
    } finally {
        setLoadingAudio(false);
    }
  };

  const handleGenVideo = async () => {
    if (!apiKeyValid) {
        await handleKeySelection();
    }
    setLoadingVideo(true);
    try {
        const url = await generateBackgroundVideo(script.content);
        setVideoUrl(url);
    } catch (e) {
        console.error(e);
        alert("Video generation failed. Ensure you selected a paid project key for Veo.");
    } finally {
        setLoadingVideo(false);
    }
  };

  const handleGenThumb = async () => {
      setLoadingThumb(true);
      try {
          const url = await generateThumbnail("tech disaster");
          setThumbnailUrl(url);
      } catch(e) {
          console.error(e);
      } finally {
          setLoadingThumb(false);
      }
  }

  const allReady = audioUrl && videoUrl && thumbnailUrl;

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Back
        </button>
        <h2 className="text-xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            Step 3: Asset Generation
        </h2>
        <div className="w-16"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Audio Card */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center mb-4 text-blue-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Voiceover</h3>
            <p className="text-xs text-gray-400 mb-4">Generate realistic AI speech from your script.</p>
            
            {audioUrl ? (
                <div className="w-full">
                    <audio controls src={audioUrl} className="w-full mb-4" />
                    <span className="text-green-400 text-sm font-bold flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        Ready
                    </span>
                </div>
            ) : (
                <button 
                    onClick={handleGenAudio}
                    disabled={loadingAudio}
                    className="mt-auto w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-2 rounded-lg font-medium"
                >
                    {loadingAudio ? 'Generating...' : 'Generate Audio'}
                </button>
            )}
        </div>

        {/* Video Card */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-pink-900/50 rounded-full flex items-center justify-center mb-4 text-pink-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">B-Roll Video</h3>
            <p className="text-xs text-gray-400 mb-4">Generate a mood-setting background loop with Veo.</p>

            {videoUrl ? (
                <div className="w-full">
                    <video controls src={videoUrl} className="w-full rounded-lg mb-4 aspect-video bg-black" />
                     <span className="text-green-400 text-sm font-bold flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        Ready
                    </span>
                </div>
            ) : (
                 <button 
                    onClick={handleGenVideo}
                    disabled={loadingVideo}
                    className="mt-auto w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 py-2 rounded-lg font-medium"
                >
                    {loadingVideo ? 'Thinking & Rendering...' : 'Generate Video (Veo)'}
                </button>
            )}
        </div>

        {/* Thumbnail Card */}
         <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-yellow-900/50 rounded-full flex items-center justify-center mb-4 text-yellow-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Thumbnail</h3>
            <p className="text-xs text-gray-400 mb-4">Generate a click-bait thumbnail.</p>

            {thumbnailUrl ? (
                <div className="w-full">
                    <img src={thumbnailUrl} alt="Thumbnail" className="w-full rounded-lg mb-4 aspect-video object-cover" />
                     <span className="text-green-400 text-sm font-bold flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        Ready
                    </span>
                </div>
            ) : (
                 <button 
                    onClick={handleGenThumb}
                    disabled={loadingThumb}
                    className="mt-auto w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 py-2 rounded-lg font-medium"
                >
                    {loadingThumb ? 'Painting...' : 'Generate Thumbnail'}
                </button>
            )}
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-700 flex justify-end">
        <button
            onClick={onUpload}
            disabled={!allReady}
            className={`px-8 py-3 rounded-xl font-bold text-lg flex items-center gap-3 transition-all ${
                allReady 
                ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-900/50 transform hover:-translate-y-1' 
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
        >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
            {allReady ? 'Auto-Upload to YouTube' : 'Generate All Assets First'}
        </button>
      </div>
    </div>
  );
};

export default MediaGenerator;