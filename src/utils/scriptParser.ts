import { Character, DialogueLine, ScriptAnalysis } from '@/types/drama';

// Hindi voice names with ElevenLabs voice IDs
const DEFAULT_VOICES = [
  'प्रिया (मधुर स्त्री स्वर) - 9BWtsMINqrJLrRacOk9x',
  'राजेश (गंभीर पुरुष स्वर) - CwhRBWXzGAHq8TQ4Fs17', 
  'सुनीता (कोमल स्त्री स्वर) - EXAVITQu4vr4xnSDxMaL',
  'लीला (युवा स्त्री स्वर) - FGY2WhTYpPnrIDTdsKH5',
  'चंदन (युवा पुरुष स्वर) - IKne3meq5aSn9XLyUdCD',
  'गणेश (बुजुर्ग पुरुष स्वर) - JBFqnCBsd6RMkjVDRZzb',
  'शारदा (बुजुर्ग स्त्री स्वर) - XB0fDUnXU5powFXDhCwa',
  'लीयाम (विदेशी पुरुष स्वर) - TX3LPaxmHKxFdv7VOQHJ'
];

export function parseScript(script: string): ScriptAnalysis {
  const lines = script.split('\n').filter(line => line.trim() !== '');
  const characters: Character[] = [];
  const dialogueLines: DialogueLine[] = [];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines and stage directions in parentheses
    if (!trimmedLine || (trimmedLine.startsWith('(') && trimmedLine.endsWith(')'))) {
      return;
    }
    
    // Check if line contains character dialogue (CHARACTER: dialogue)
    const colonIndex = trimmedLine.indexOf(':');
    
    if (colonIndex > 0 && colonIndex < 50) { // Reasonable character name length
      const characterName = trimmedLine.substring(0, colonIndex).trim().toUpperCase();
      const dialogue = trimmedLine.substring(colonIndex + 1).trim();
      
      if (dialogue && characterName) {
        // Add or update character
        let character = characters.find(c => c.name === characterName);
        if (!character) {
          const voiceIndex = characters.length % DEFAULT_VOICES.length;
          character = {
            name: characterName,
            voiceId: DEFAULT_VOICES[voiceIndex].split(' - ')[1],
            lines: 0
          };
          characters.push(character);
        }
        character.lines++;
        
        // Add dialogue line
        dialogueLines.push({
          character: characterName,
          text: dialogue,
          isNarration: false,
          lineNumber: index + 1
        });
      }
    } else {
      // Treat as narration if it doesn't match character format
      dialogueLines.push({
        character: 'NARRATOR',
        text: trimmedLine,
        isNarration: true,
        lineNumber: index + 1
      });
      
      // Add narrator character if not exists
      if (!characters.find(c => c.name === 'NARRATOR')) {
        characters.push({
          name: 'NARRATOR',
          voiceId: 'प्रिया (मधुर स्त्री स्वर) - 9BWtsMINqrJLrRacOk9x'.split(' - ')[1], // Default narrator voice
          lines: 0
        });
      }
      const narrator = characters.find(c => c.name === 'NARRATOR');
      if (narrator) narrator.lines++;
    }
  });
  
  return {
    characters,
    lines: dialogueLines,
    totalLines: dialogueLines.length
  };
}

export function getVoiceOptions() {
  return DEFAULT_VOICES.map(voice => {
    const [name, id] = voice.split(' - ');
    return { name, id };
  });
}