import React, { useState } from 'react';
import { findStories } from '../services/geminiService';
import { Story } from '../types';

interface StoryFinderProps {
  onStorySelect: (story: Story) => void;
}

// Simple string hash for generating deterministic IDs
const generateStoryId = (content: string): string => {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `story-${Math.abs(hash).toString(16)}`;
};

const StoryFinder: React.FC<StoryFinderProps> = ({ onStorySelect }) => {
  const [topic, setTopic] = useState("backup horror stories");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    try {
      const rawText = await findStories(topic);
      setResults(rawText);
    } catch (err) {
      console.error(err);
      setResults("Error fetching stories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseThis = () => {
    if (results) {
        // Generate a deterministic ID based on the content so auto-save works reliably
        // even if the page is refreshed (as long as the search result is the same)
        const storyId = generateStoryId(results);
        
        onStorySelect({
            id: storyId,
            title: `Search Result for: ${topic}`,
            summary: results,
            originalSource: 'Reddit (via Google Search)',
            selected: true
        });
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          Step 1: Find a Story
        </h2>
        
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-1">Search Topic (Reddit)</label>
            <input 
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="e.g., Tech support nightmares, glitch in the matrix"
            />
          </div>
          <div className="flex items-end">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  Search
                </>
              )}
            </button>
          </div>
        </form>

        {results && (
          <div className="animate-fade-in border-t border-gray-700 pt-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Found Stories</h3>
            <div className="bg-gray-900 rounded-lg p-4 text-gray-300 font-mono text-sm max-h-96 overflow-y-auto whitespace-pre-wrap border border-gray-700">
              {results}
            </div>
            
            <div className="mt-4 flex justify-end">
                <button 
                    onClick={handleUseThis}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                >
                    <span>Use These Stories</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryFinder;