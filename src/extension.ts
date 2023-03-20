"use strict";

import * as vscode from "vscode";

const SEARCH_ENGINES = {
  google: "https://www.google.com/search?q={INPUT}",
  bing: "https://www.bing.com/search?q={INPUT}",
  yahoo: "https://search.yahoo.com/search?p={INPUT}",
  duckduckgo: "https://duckduckgo.com/?q={INPUT}",
  wikipedia: "https://en.wikipedia.org/wiki/Special:Search?search={INPUT}",
};
type SearchEngine = keyof typeof SEARCH_ENGINES;

function generateLink(searchEngine: SearchEngine, input: string): string {
  const url = SEARCH_ENGINES[searchEngine];
  if (!url) {
    throw new Error(`Invalid search engine: ${searchEngine}`);
  }
  return url.replace("{INPUT}", encodeURIComponent(input));
}

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "searchLinkInMarkdown.insertSearchLink",
    function () {
      const config = vscode.workspace.getConfiguration("searchLinkInMarkdown");
      const searchEngine = config.get("searchEngine") as string;
      if (!searchEngine) {
        vscode.window.showErrorMessage("No search engine set in config");
        return;
      }
      if (!(searchEngine in SEARCH_ENGINES)) {
        vscode.window.showErrorMessage(
          `Invalid search engine: ${searchEngine}`
        );
        return;
      }

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const selection = editor.selection;
      if (selection.isEmpty) {
        return;
      }
      const text = editor.document.getText(selection);
      const link = generateLink(searchEngine as SearchEngine, text);
      editor.edit((editBuilder) => {
        editBuilder.replace(selection, `[${text}](${link})`);
      });
    }
  );
}

export function deactivate() {}
