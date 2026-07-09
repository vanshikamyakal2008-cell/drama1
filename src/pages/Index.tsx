import { useState } from 'react';
import { ScriptInput } from '@/components/ScriptInput';
import { CharacterVoices } from '@/components/CharacterVoices';
import { AudioGeneration } from '@/components/AudioGeneration';
import { parseScript } from '@/utils/scriptParser';
import { ScriptAnalysis } from '@/types/drama';
import { Separator } from '@/components/ui/separator';
import { Theater, Sparkles } from 'lucide-react';

const Index = () => {
  const [scriptAnalysis, setScriptAnalysis] = useState<ScriptAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleScriptSubmit = async (script: string) => {
    setIsAnalyzing(true);
    try {
      // Simulate processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      const analysis = parseScript(script);
      setScriptAnalysis(analysis);
    } catch (error) {
      console.error('Failed to analyze script:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVoiceChange = (characterName: string, voiceId: string) => {
    if (!scriptAnalysis) return;
    
    setScriptAnalysis({
      ...scriptAnalysis,
      characters: scriptAnalysis.characters.map(char =>
        char.name === characterName ? { ...char, voiceId } : char
      )
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-theater-purple/5">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-theater-purple/20 via-theater-burgundy/15 to-theater-gold/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
        <div className="relative border-b border-theater-gold/20 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-12">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-theater-purple/20 to-theater-gold/20 border border-theater-gold/30 shadow-lg backdrop-blur-sm">
                  <Theater className="w-12 h-12 text-theater-gold" />
                </div>
                <div className="text-left">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-theater-gold via-theater-purple to-theater-burgundy bg-clip-text text-transparent">
                    Drama Text-to-Voice
                  </h1>
                  <p className="text-xl text-muted-foreground mt-2">Transform your scripts into compelling audio performances</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-theater-gold/10 to-theater-purple/10 border border-theater-gold/20 backdrop-blur-sm max-w-md mx-auto">
                <Sparkles className="w-5 h-5 text-theater-gold animate-pulse" />
                <span className="text-foreground font-medium">Powered by ElevenLabs AI voices for professional quality audio</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
                <div className="p-6 rounded-xl bg-gradient-to-br from-theater-purple/10 to-transparent border border-theater-purple/20 backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-lg bg-theater-purple/20 flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl font-bold text-theater-purple">1</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Upload Script</h3>
                  <p className="text-sm text-muted-foreground">Paste your drama script and we'll automatically detect characters</p>
                </div>
                
                <div className="p-6 rounded-xl bg-gradient-to-br from-theater-gold/10 to-transparent border border-theater-gold/20 backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-lg bg-theater-gold/20 flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl font-bold text-theater-gold">2</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Assign Voices</h3>
                  <p className="text-sm text-muted-foreground">Choose from our collection of Hindi voices for each character</p>
                </div>
                
                <div className="p-6 rounded-xl bg-gradient-to-br from-theater-burgundy/10 to-transparent border border-theater-burgundy/20 backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-lg bg-theater-burgundy/20 flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl font-bold text-theater-burgundy">3</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Generate Audio</h3>
                  <p className="text-sm text-muted-foreground">Create professional-quality audio tracks for your drama</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Step 1: Script Input */}
          <section className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-theater-purple/10 to-theater-gold/10 border border-theater-purple/20 mb-4">
                <div className="w-8 h-8 rounded-full bg-theater-purple/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-theater-purple">1</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Upload Your Script</h2>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Paste your drama script and we'll automatically detect characters and dialogue using advanced AI parsing.
              </p>
            </div>
            
            <ScriptInput 
              onScriptSubmit={handleScriptSubmit} 
              isLoading={isAnalyzing} 
            />
          </section>

          {scriptAnalysis && (
            <>
              <Separator className="bg-gradient-to-r from-transparent via-theater-gold/30 to-transparent h-px" />
              
              {/* Step 2: Character Voice Assignment */}
              <section className="animate-fade-in">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-theater-gold/10 to-theater-burgundy/10 border border-theater-gold/20 mb-4">
                    <div className="w-8 h-8 rounded-full bg-theater-gold/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-theater-gold">2</span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Assign Character Voices</h2>
                  </div>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    We've detected <span className="font-semibold text-theater-gold">{scriptAnalysis.characters.length} characters</span> with 
                    <span className="font-semibold text-theater-purple"> {scriptAnalysis.totalLines} total lines</span>. 
                    Customize the voice for each character from our Hindi voice collection.
                  </p>
                </div>
                
                <CharacterVoices 
                  characters={scriptAnalysis.characters}
                  onVoiceChange={handleVoiceChange}
                />
              </section>

              <Separator className="bg-gradient-to-r from-transparent via-theater-purple/30 to-transparent h-px" />
              
              {/* Step 3: Audio Generation */}
              <section className="animate-fade-in">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-theater-burgundy/10 to-theater-purple/10 border border-theater-burgundy/20 mb-4">
                    <div className="w-8 h-8 rounded-full bg-theater-burgundy/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-theater-burgundy">3</span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Generate Audio</h2>
                  </div>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Create high-quality audio tracks for your drama script with professional voice synthesis and seamless playback.
                  </p>
                </div>
                
                <AudioGeneration 
                  characters={scriptAnalysis.characters}
                  lines={scriptAnalysis.lines}
                />
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;