import React, { useState } from 'react';
import { writeScript } from '../services/geminiService';
import { Story, Script } from '../types';

interface ScriptWriterProps {
  story: Story;
  onScriptComplete: (script: Script) => void;
  onBack: () => void;
}

const ScriptWriter: React.FC<ScriptWriterProps> = ({ story, onScriptComplete, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState("engaging and suspenseful");
  const [generatedScript, setGeneratedScript] = useState<string>("");

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const scriptContent = await writeScript(story.summary, tone);
      setGeneratedScript(scriptContent);
    } catch (e) {
      console.error(e);
      alert("Failed to generate script");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Back
        </button>
        <h2 className="text-xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Step 2: Rewrite Script
        </h2>
        <div className="w-16"></div> {/* Spacer */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Source Material</h3>
                <div className="bg-gray-900 p-3 rounded text-sm text-gray-300 h-64 overflow-y-auto">
                    {story.summary}
                </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                 <label className="block text-sm font-medium text-gray-300 mb-2">Script Tone</label>
                 <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                 >
                    <option value="engaging and suspenseful">Suspenseful & Hooky</option>
                    <option value="humorous and witty">Humorous & Witty</option>
                    <option value="dramatic and emotional">Dramatic & Emotional</option>
                    <option value="fast-paced and energetic">Fast-paced (TikTok style)</option>
                 </select>
                 <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-purple-900/50"
                 >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Writing Magic...
                        </span>
                    ) : 'Generate Viral Script'}
                 </button>
            </div>
        </div>

        {/* Output Column */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col h-[500px]">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Generated Script</h3>
            {generatedScript ? (
                <>
                    <textarea 
                        className="flex-1 w-full bg-gray-900 border border-gray-600 rounded-lg p-4 text-gray-200 font-mono text-sm resize-none focus:ring-2 focus:ring-purple-500 outline-none"
                        value={generatedScript}
                        onChange={(e) => setGeneratedScript(e.target.value)}
                    />
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => onScriptComplete({ title: 'New Video', content: generatedScript, tone: tone as any})}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-bold shadow-lg transition-transform active:scale-95"
                        >
                            Confirm & Generate Assets &rarr;
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
                    <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    <p>Script will appear here</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ScriptWriter;