import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Play, Pause, Download, Volume2, AlertCircle, PlayCircle, StopCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Character, DialogueLine, AudioTrack } from '@/types/drama';
import { generateSpeech, createAudioUrl, downloadAudio } from '@/services/elevenlabs';

interface AudioGenerationProps {
  characters: Character[];
  lines: DialogueLine[];
  apiKey?: string;
}

export function AudioGeneration({ characters, lines, apiKey }: AudioGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [playingTrack, setPlayingTrack] = useState<number | null>(null);
  const [currentApiKey, setCurrentApiKey] = useState(apiKey || '');
  const [error, setError] = useState<string | null>(null);
  const [useBuiltInKey, setUseBuiltInKey] = useState(true);
  const [playingAll, setPlayingAll] = useState(false);
  const [currentPlayIndex, setCurrentPlayIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateAllAudio = async () => {
    const apiKeyToUse = useBuiltInKey ? 'sk_b3227410cb1fef8f09625192624b67627e011af0a4893ef1' : currentApiKey;
    
    if (!apiKeyToUse.trim()) {
      setError('Please enter your ElevenLabs API key');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setError(null);
    const generatedTracks: AudioTrack[] = [];

    try {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const character = characters.find(c => c.name === line.character);
        
        if (character && line.text.trim()) {
          try {
            const audioBlob = await generateSpeech(line.text, {
              apiKey: apiKeyToUse,
              voiceId: character.voiceId
            });
            
            const audioUrl = createAudioUrl(audioBlob);
            generatedTracks.push({
              character: line.character,
              audioUrl,
              text: line.text,
              lineNumber: line.lineNumber
            });
          } catch (err) {
            console.error(`Error generating audio for line ${i + 1}:`, err);
            setError(`Failed to generate audio for line ${i + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        }
        
        setProgress(((i + 1) / lines.length) * 100);
      }
      
      setAudioTracks(generatedTracks);
    } catch (err) {
      setError(`Generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = (index: number) => {
    if (playingTrack === index) {
      setPlayingTrack(null);
      return;
    }
    
    const audio = new Audio(audioTracks[index].audioUrl);
    setPlayingTrack(index);
    
    audio.play();
    audio.onended = () => setPlayingTrack(null);
  };

  const downloadAllAudio = () => {
    audioTracks.forEach((track, index) => {
      fetch(track.audioUrl)
        .then(response => response.blob())
        .then(blob => {
          downloadAudio(blob, `${track.character}-line${track.lineNumber}.mp3`);
        });
    });
  };

  const downloadFullDrama = async () => {
    if (audioTracks.length === 0) return;

    try {
      // Create audio context for combining audio files
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffers: AudioBuffer[] = [];

      // Load all audio files and convert to AudioBuffer
      for (const track of audioTracks) {
        const response = await fetch(track.audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBuffers.push(audioBuffer);
      }

      // Calculate total duration with gaps
      const gapDuration = 0.5; // 0.5 second gap between tracks
      const totalDuration = audioBuffers.reduce((sum, buffer) => sum + buffer.duration, 0) + 
                           (audioBuffers.length - 1) * gapDuration;

      // Create a new buffer for the combined audio
      const combinedBuffer = audioContext.createBuffer(
        2, // stereo
        Math.ceil(totalDuration * audioContext.sampleRate),
        audioContext.sampleRate
      );

      // Copy audio data to combined buffer
      let currentTime = 0;
      audioBuffers.forEach((buffer) => {
        const startSample = Math.floor(currentTime * audioContext.sampleRate);
        
        for (let channel = 0; channel < Math.min(2, buffer.numberOfChannels); channel++) {
          const sourceData = buffer.getChannelData(channel);
          const targetData = combinedBuffer.getChannelData(channel);
          
          for (let i = 0; i < sourceData.length; i++) {
            if (startSample + i < targetData.length) {
              targetData[startSample + i] = sourceData[i];
            }
          }
        }
        
        currentTime += buffer.duration + gapDuration;
      });

      // Convert AudioBuffer to WAV blob
      const wavBlob = audioBufferToWav(combinedBuffer);
      downloadAudio(wavBlob, 'full-drama.wav');
    } catch (error) {
      console.error('Error combining audio files:', error);
      setError('Failed to combine audio files. Downloading individual files instead.');
      downloadAllAudio();
    }
  };

  // Helper function to convert AudioBuffer to WAV
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bytesPerSample = 2;
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;
    const bufferSize = 44 + dataSize;

    const wav = new ArrayBuffer(bufferSize);
    const view = new DataView(wav);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bytesPerSample * 8, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([wav], { type: 'audio/wav' });
  };

  const playAllSequentially = () => {
    if (playingAll) {
      // Stop playing all
      setPlayingAll(false);
      setCurrentPlayIndex(0);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    if (audioTracks.length === 0) return;
    
    setPlayingAll(true);
    setCurrentPlayIndex(0);
    playNextTrack(0);
  };

  const playNextTrack = (index: number) => {
    if (index >= audioTracks.length) {
      setPlayingAll(false);
      setCurrentPlayIndex(0);
      return;
    }

    setCurrentPlayIndex(index);
    const audio = new Audio(audioTracks[index].audioUrl);
    audioRef.current = audio;
    
    audio.play();
    
    audio.onended = () => {
      setTimeout(() => {
        playNextTrack(index + 1);
      }, 800); // Small pause between tracks
    };

    audio.onerror = () => {
      console.error(`Error playing track ${index}`);
      playNextTrack(index + 1);
    };
  };

  if (characters.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-card via-card to-card/50 border border-theater-gold/20 shadow-xl backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-theater-gold to-theater-purple bg-clip-text text-transparent">
          <div className="p-2 rounded-lg bg-theater-gold/10 border border-theater-gold/20">
            <Volume2 className="w-6 h-6 text-theater-gold" />
          </div>
          Audio Generation Studio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded-xl bg-gradient-to-r from-theater-purple/10 to-theater-gold/10 border border-theater-purple/20">
          <div className="flex items-center gap-3 mb-4">
            <Switch
              id="api-toggle"
              checked={useBuiltInKey}
              onCheckedChange={setUseBuiltInKey}
              className="data-[state=checked]:bg-theater-gold"
            />
            <Label htmlFor="api-toggle" className="font-medium text-foreground">
              {useBuiltInKey ? 'Using built-in API key' : 'Use your own API key'}
            </Label>
          </div>
          
          {!useBuiltInKey && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="apiKey" className="text-sm font-medium text-muted-foreground">Your ElevenLabs API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your ElevenLabs API key"
                value={currentApiKey}
                onChange={(e) => setCurrentApiKey(e.target.value)}
                className="bg-background/50 border-theater-purple/30 focus:border-theater-gold transition-all duration-300"
              />
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-500/20 bg-red-500/10 animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button 
            onClick={generateAllAudio}
            disabled={isGenerating || (!useBuiltInKey && !currentApiKey.trim())}
            className="bg-gradient-to-r from-theater-purple to-theater-burgundy hover:from-theater-purple/80 hover:to-theater-burgundy/80 text-white font-semibold py-3 transition-all duration-300 hover:scale-105 shadow-lg"
            size="lg"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </div>
            ) : (
              'Generate All Audio'
            )}
          </Button>
          
          {audioTracks.length > 0 && (
            <>
              <Button 
                onClick={playAllSequentially}
                className="bg-gradient-to-r from-theater-gold to-yellow-500 hover:from-theater-gold/80 hover:to-yellow-500/80 text-black font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
                size="lg"
              >
                {playingAll ? (
                  <>
                    <StopCircle className="w-4 h-4 mr-2" />
                    Stop Play All
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Play All Drama
                  </>
                )}
              </Button>
              
              <Button 
                onClick={downloadFullDrama}
                variant="outline"
                size="lg"
                className="border-theater-gold/30 hover:border-theater-gold bg-gradient-to-r from-theater-gold/10 to-theater-purple/10 hover:from-theater-gold/20 hover:to-theater-purple/20 transition-all duration-300 hover:scale-105 font-semibold"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Full Drama
              </Button>
              
              <Button 
                onClick={downloadAllAudio}
                variant="outline"
                size="lg"
                className="border-theater-purple/30 hover:border-theater-purple transition-all duration-300 hover:scale-105"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Individual
              </Button>
            </>
          )}
        </div>
        
        {isGenerating && (
          <div className="space-y-3 p-4 rounded-xl bg-gradient-to-r from-theater-purple/5 to-theater-gold/5 border border-theater-purple/20 animate-fade-in">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-foreground">Generating audio tracks...</span>
              <span className="text-theater-gold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full h-2" />
          </div>
        )}
        
        {playingAll && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-theater-gold/10 to-theater-purple/10 border border-theater-gold/20 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-theater-gold rounded-full animate-pulse" />
              <span className="font-medium text-foreground">
                Playing: Line {currentPlayIndex + 1} of {audioTracks.length}
              </span>
            </div>
          </div>
        )}
        
        {audioTracks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <div className="w-2 h-2 bg-theater-gold rounded-full animate-pulse" />
              Generated Audio Tracks ({audioTracks.length})
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {audioTracks.map((track, index) => (
                <div 
                  key={index}
                  className={`group relative p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                    playingAll && currentPlayIndex === index
                      ? 'bg-gradient-to-r from-theater-gold/20 to-theater-purple/20 border-2 border-theater-gold/50 shadow-lg'
                      : 'bg-gradient-to-r from-secondary/30 to-secondary/10 border border-border/50 hover:border-theater-purple/30'
                  }`}
                >
                  {playingAll && currentPlayIndex === index && (
                    <div className="absolute top-2 right-2">
                      <div className="w-3 h-3 bg-theater-gold rounded-full animate-ping" />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge 
                          variant="secondary" 
                          className="px-3 py-1 text-xs font-medium bg-theater-purple/20 text-theater-purple border-theater-purple/30"
                        >
                          {track.character}
                        </Badge>
                        <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                          Line {track.lineNumber}
                        </span>
                      </div>
                      <p className="text-sm text-foreground font-medium leading-relaxed">
                        {track.text}
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => playAudio(index)}
                      variant="ghost"
                      size="sm"
                      className="ml-3 p-2 rounded-full hover:bg-theater-gold/20 hover:text-theater-gold transition-all duration-200"
                    >
                      {playingTrack === index ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}