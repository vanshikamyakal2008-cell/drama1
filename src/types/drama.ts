export interface Character {
  name: string;
  voiceId: string;
  lines: number;
}

export interface DialogueLine {
  character: string;
  text: string;
  isNarration: boolean;
  lineNumber: number;
}

export interface ScriptAnalysis {
  characters: Character[];
  lines: DialogueLine[];
  totalLines: number;
}

export interface AudioTrack {
  character: string;
  audioUrl: string;
  text: string;
  lineNumber: number;
}