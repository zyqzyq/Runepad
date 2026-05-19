import { getT } from "@/i18n";

export function getTextFileDialogFilters(): Array<{
  name: string;
  extensions: string[];
}> {
  const tr = getT();
  return [
    {
      name: tr("dialog.filter.textFiles"),
      extensions: [
        "txt",
        "md",
        "json",
        "js",
        "ts",
        "tsx",
        "jsx",
        "css",
        "html",
        "xml",
        "yaml",
        "yml",
        "rs",
        "toml",
      ],
    },
    { name: tr("dialog.filter.allFiles"), extensions: ["*"] },
  ];
}
