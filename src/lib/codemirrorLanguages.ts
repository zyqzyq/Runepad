// Runepad | Module: codemirrorLanguages | Depends on: @codemirror/language

import { EditorState, type Extension } from "@codemirror/state";

const yamlCommentLanguageData = EditorState.languageData.of(() => [
  { commentTokens: { line: "#" } },
]);

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
    case "yaml":
      return yamlCommentLanguageData;
    default:
      return null;
  }
}
