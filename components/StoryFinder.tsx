import React, { useState } from 'react';
import { findStories } from '../services/geminiService';
import { Story } from '../types';

interface StoryFinderProps {
  onStorySelect: (story: Story) => void;
}

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
        // Since we get unstructured text from Search Grounding, we treat the whole result as the "Source"
        // In a production app, we would parse this better or ask the user to highlight the specific story.
        // For this demo, we pass the raw text to the writer.
        onStorySelect({
            id: 'generated-1',
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
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="e.g. backup failures, wedding disasters, malicious compliance"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Searching...' : 'Search Reddit'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 animate-pulse">Scouring the internet for the best stories...</p>
        </div>
      )}

      {results && !loading && (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Search Results</h3>
          <div className="bg-gray-900 p-4 rounded-lg text-gray-300 text-sm whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto mb-4 border border-gray-700">
             {/* Render parsed text nicely or just the raw text if complex */}
             {results}
          </div>
          <div className="flex justify-end">
            <button
                onClick={handleUseThis}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-transform active:scale-95"
            >
                <span>Use These Results</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryFinder;