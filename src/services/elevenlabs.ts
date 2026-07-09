export interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  model?: string;
}

export async function generateSpeech(
  text: string,
  config: ElevenLabsConfig
): Promise<Blob> {
  const { apiKey, voiceId, model = 'eleven_multilingual_v2' } = config;
  
  // Enhanced voice settings for better quality
  const voiceSettings = {
    stability: 0.7,
    similarity_boost: 0.8,
    style: 0.2,
    use_speaker_boost: true
  };

  // Add retry logic for better reliability
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: model,
          voice_settings: voiceSettings
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      return await response.blob();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
    }
  }

  throw lastError || new Error('Failed to generate speech after multiple attempts');
}

// Enhanced batch processing for multiple text segments
export async function generateSpeechBatch(
  textSegments: { text: string; config: ElevenLabsConfig }[],
  onProgress?: (completed: number, total: number) => void
): Promise<Blob[]> {
  const results: Blob[] = [];
  const batchSize = 3; // Process 3 requests concurrently
  
  for (let i = 0; i < textSegments.length; i += batchSize) {
    const batch = textSegments.slice(i, i + batchSize);
    
    const batchPromises = batch.map(({ text, config }) => 
      generateSpeech(text, config)
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(`Failed to generate speech for segment ${i + index + 1}:`, result.reason);
        throw new Error(`Speech generation failed for segment ${i + index + 1}`);
      }
    });
    
    onProgress?.(Math.min(i + batchSize, textSegments.length), textSegments.length);
  }
  
  return results;
}

export function createAudioUrl(audioBlob: Blob): string {
  return URL.createObjectURL(audioBlob);
}

export function downloadAudio(audioBlob: Blob, filename: string) {
  const url = createAudioUrl(audioBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}