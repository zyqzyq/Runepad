// Runepad | Module: codemirrorLanguages | Depends on: @codemirror/language

import type { Extension } from "@codemirror/state";

export async function loadLanguageExtension(
  language: string,
): Promise<Extension | null> {
  switch (language) {
    case "javascript": {
      const { javascript } = await import("@codemirror/lang-javascript");
      return javascript({ typescript: true, jsx: true });
    }
    case "json": {
      const { json } = await import("@codemirror/lang-json");
      return json();
    }
    case "markdown": {
      const { markdown } = await import("@codemirror/lang-markdown");
      return markdown();
    }
    case "python": {
      const { python } = await import("@codemirror/lang-python");
      return python();
    }
    case "yaml": {
      const { yaml } = await import("@codemirror/lang-yaml");
      return yaml();
    }
    default:
      return null;
  }
}
