export interface TerminalEntry {
  id: string;
  type: 'stdout' | 'stderr' | 'system' | 'input' | 'success' | 'info' | 'result' | 'plot';
  text: string;
  timestamp: Date;
  plotUrl?: string;
}

export interface ActiveInputRequest {
  prompt: string;
  resolve: (value: string) => void;
  reject: (reason: Error) => void;
}

export interface PlotImage {
  id: string;
  dataUrl: string;
  title?: string;
  timestamp: Date;
}

export interface PythonVariable {
  name: string;
  type: string;
  value: string;
}

export interface FriendlyErrorHint {
  errorType: string;
  line?: number;
  friendlyMessage: string;
  suggestion: string;
}

export interface PracticeLesson {
  id: string;
  title: string;
  category: 'Basics' | 'Control Flow' | 'Data Structures' | 'Functions' | 'Standard Library' | 'NumPy' | 'Plots';
  difficulty: 'Beginner' | 'Fun Practice';
  description: string;
  hint: string;
  code: string;
}

export interface ScriptFile {
  id: string;
  name: string;
  code: string;
  updatedAt: number;
}

