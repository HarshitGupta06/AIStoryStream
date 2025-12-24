import { GoogleGenAI, Modality, Type } from "@google/genai";
import { decode, decodeAudioData, pcmToWavBlob } from "./audioUtils";

// Helper to ensure we have a fresh instance (especially after key selection)
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper for retrying on 404 "Entity not found" errors
async function withRetry<T>(operation: (ai: GoogleGenAI) => Promise<T>): Promise<T> {
  let ai = getAI();
  try {
    return await operation(ai);
  } catch (e: any) {
    // Check for 404 or specific message indicating the key/project issue
    const isNotFound = e.status === 404 || e.code === 404 || 
                       (e.message && (e.message.includes("Requested entity was not found") || e.message.includes("404")));
    
    if (isNotFound && (window as any).aistudio && (window as any).aistudio.openSelectKey) {
      console.log("Entity not found (404). Prompting for API Key re-selection...");
      await (window as any).aistudio.openSelectKey();
      ai = getAI(); // Re-instantiate with new key
      return await operation(ai);
    }
    throw e;
  }
}

export const checkApiKey = async (): Promise<boolean> => {
  if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
    return await (window as any).aistudio.hasSelectedApiKey();
  }
  return true; // Fallback if not in the specific environment, assume env var is there
};

export const promptApiKeySelection = async () => {
  if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
    await (window as any).aistudio.openSelectKey();
  }
};

export const findStories = async (topic: string): Promise<string> => {
  return withRetry(async (ai) => {
    const prompt = `Search reddit.com for interesting threads or stories related to: "${topic}". 
    Summarize 3 distinct potential stories found. 
    For each story, provide the Thread Title, a Summary of the plot/content, and the URL if available.
    Format the output clearly with separators so I can parse it easily.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return response.text || "No results found.";
  });
};

export const writeScript = async (storyContent: string, tone: string): Promise<string> => {
  return withRetry(async (ai) => {
    const prompt = `Act as a professional YouTube scriptwriter.
    Take the following raw story/content and rewrite it into a short, engaging video script (approx 60-90 seconds spoken).
    If the content contains multiple stories or summaries, pick the single most interesting one to focus on.
    
    Tone: ${tone} (Make it hook the viewer immediately).
    Style: Conversational, human-written, storytelling format.
    
    Original Content:
    ${storyContent}
    
    Output the spoken narration text ONLY. Do not include scene descriptions, visual cues, or character names. Just the raw text to be spoken.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 1024 }, // Give it a bit of thought for creativity
      }
    });

    return response.text || "Failed to generate script.";
  });
};

export const generateVoiceover = async (text: string): Promise<{ audioUrl: string, blob: Blob }> => {
  return withRetry(async (ai) => {
    // Using TTS model
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Engaging voice
            },
        },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");

    const pcmData = decode(base64Audio);
    
    // Convert PCM to WAV for playback in browser
    const wavBlob = await pcmToWavBlob(pcmData);
    const audioUrl = URL.createObjectURL(wavBlob);
    
    return { audioUrl, blob: wavBlob };
  });
};

export const generateBackgroundVideo = async (scriptSnippet: string): Promise<string> => {
  const prompt = `Create a cinematic, atmospheric 5-second video loop that represents the mood of this story snippet: "${scriptSnippet.slice(0, 100)}...". No text overlay. High quality.`;

  // Capture the AI instance used for the successful initiation so we can use it for polling if needed
  let aiForPolling = getAI();

  const initiateVideo = async (ai: GoogleGenAI) => {
    aiForPolling = ai;
    return await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });
  };

  let operation = await withRetry(initiateVideo);

  // Polling
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
    operation = await aiForPolling.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed");

  // Fetch with API Key
  const videoRes = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await videoRes.blob();
  return URL.createObjectURL(blob);
};

export const generateThumbnail = async (topic: string): Promise<string> => {
    return withRetry(async (ai) => {
        const prompt = `A youtube video thumbnail for a story about ${topic}. High contrast, shocking, catchy, 4k resolution, hyper realistic.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
            parts: [{ text: prompt }],
            },
            config: {
                imageConfig: {
                    aspectRatio: "16:9"
                }
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        throw new Error("No image generated");
    });
}