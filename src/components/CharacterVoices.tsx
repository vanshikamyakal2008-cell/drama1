import { Character } from '@/types/drama';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Mic } from 'lucide-react';
import { getVoiceOptions } from '@/utils/scriptParser';

interface CharacterVoicesProps {
  characters: Character[];
  onVoiceChange: (characterName: string, voiceId: string) => void;
}

export function CharacterVoices({ characters, onVoiceChange }: CharacterVoicesProps) {
  const voiceOptions = getVoiceOptions();
  
  if (characters.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-card via-card to-card/50 border border-theater-purple/20 shadow-xl backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-theater-purple to-theater-gold bg-clip-text text-transparent">
          <div className="p-2 rounded-lg bg-theater-purple/10 border border-theater-purple/20">
            <Users className="w-6 h-6 text-theater-purple" />
          </div>
          Character Voice Assignment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {characters.map((character, index) => (
            <div 
              key={character.name}
              className="group p-5 rounded-xl bg-gradient-to-r from-secondary/30 to-secondary/10 border border-border/50 hover:border-theater-purple/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-theater-purple/20 to-theater-gold/20 border-2 border-theater-purple/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Mic className="w-5 h-5 text-theater-purple" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-theater-gold rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-black">{character.lines}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{character.name}</h3>
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="secondary" 
                        className="px-3 py-1 text-xs font-medium bg-theater-purple/20 text-theater-purple border-theater-purple/30"
                      >
                        {character.lines} dialogues
                      </Badge>
                      {character.name === 'NARRATOR' && (
                        <Badge 
                          variant="outline" 
                          className="px-3 py-1 text-xs font-medium border-theater-gold/50 text-theater-gold"
                        >
                          कथावाचक
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <Select
                  value={character.voiceId}
                  onValueChange={(voiceId) => onVoiceChange(character.name, voiceId)}
                >
                  <SelectTrigger className="w-[280px] bg-background/50 border-theater-purple/30 focus:border-theater-gold transition-all duration-300 hover:bg-background/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm">
                    {voiceOptions.map((voice) => (
                      <SelectItem 
                        key={voice.id} 
                        value={voice.id}
                        className="hover:bg-theater-purple/10 focus:bg-theater-purple/20 transition-colors duration-200"
                      >
                        {voice.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}