export type LineEnding = "LF" | "CRLF";

export interface Tab {
  id: string;
  filename: string;
  filepath: string | null;
  isDirty: boolean;
  isNew: boolean;
  language: string;
  encoding: string;
  lineEnding: LineEnding;
}
