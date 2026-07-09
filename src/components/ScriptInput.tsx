import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';

interface ScriptInputProps {
  onScriptSubmit: (script: string) => void;
  isLoading?: boolean;
}

const SAMPLE_SCRIPT = `NARRATOR: In a dark and stormy night, two friends meet at a mysterious mansion.

JOHN: Sarah, are you sure this is the right place? It looks abandoned.

SARAH: According to the letter, this is where we'll find the answer to the mystery.

NARRATOR: Thunder crashes overhead as they approach the front door.

JOHN: I have a bad feeling about this. Maybe we should come back in the morning.

SARAH: We've come too far to turn back now. Besides, someone is expecting us.

NARRATOR: The door creaks open before they can knock, revealing a shadowy figure.

MYSTERIOUS VOICE: Welcome, I've been waiting for you both.`;

export function ScriptInput({ onScriptSubmit, isLoading }: ScriptInputProps) {
  const [script, setScript] = useState('');

  const handleSubmit = () => {
    if (script.trim()) {
      onScriptSubmit(script.trim());
    }
  };

  const useSampleScript = () => {
    setScript(SAMPLE_SCRIPT);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FileText className="w-5 h-5 text-theater-gold" />
          Drama Script Input
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Paste your drama script here... 

Format example:
CHARACTER NAME: Their dialogue here
NARRATOR: Narration text here

The system will automatically detect characters and assign voices."
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="min-h-[300px] bg-background border-border text-foreground font-mono text-sm"
          />
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={handleSubmit}
            disabled={!script.trim() || isLoading}
            variant="stage"
            size="lg"
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isLoading ? 'Processing...' : 'Analyze Script'}
          </Button>
          
          <Button 
            onClick={useSampleScript}
            variant="outline"
            size="lg"
          >
            Use Sample
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}