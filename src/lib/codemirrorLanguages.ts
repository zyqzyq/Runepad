import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import type { Extension } from "@codemirror/state";

export function getLanguageExtension(language: string): Extension | null {
  switch (language) {
    case "javascript":
      return javascript({ typescript: true, jsx: true });
    case "json":
      return json();
    case "markdown":
      return markdown();
    default:
      return null;
  }
}
