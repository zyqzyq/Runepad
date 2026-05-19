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
    default:
      return null;
  }
}
