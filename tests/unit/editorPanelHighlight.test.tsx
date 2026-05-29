import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { EditorPanel } from "@/components/editor/EditorPanel";
import { editorInstances } from "@/lib/editorInstances";
import { pendingInitialDocs } from "@/lib/pendingDocs";

describe("EditorPanel syntax highlighting", () => {
  afterEach(() => {
    cleanup();
    for (const view of editorInstances.values()) {
      view.destroy();
    }
    editorInstances.clear();
    pendingInitialDocs.clear();
  });

  test("applies CodeMirror highlight classes for loaded language tokens", async () => {
    pendingInitialDocs.set("json-doc", '{\n  "name": "Runepad"\n}');

    render(<EditorPanel docId="json-doc" language="json" isActive />);

    await waitFor(() => {
      const highlightedToken = document.querySelector(".cm-content span[class]");

      expect(highlightedToken).not.toBeNull();
    });
  });
});
