// PostToolUse hook for Write and Edit: formats the file Claude just changed
// with this project's Prettier setup, so edits match `npm run format:check`.
//
// It only touches files inside the project that Prettier handles and doesn't
// ignore. It never blocks an edit: problems (for example, node_modules not
// installed yet) go to the Claude Code debug log and the hook exits 0.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

try {
  const input = JSON.parse(readFileSync(0, "utf8"));
  const file = input.tool_input?.file_path ?? input.tool_response?.filePath;
  const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
  const relative = file ? path.relative(root, path.resolve(file)) : "..";

  if (!relative.startsWith("..") && !path.isAbsolute(relative)) {
    // Prettier resolves config plugins (prettier-plugin-tailwindcss) from the
    // working directory, so run from the project root like the CLI does.
    process.chdir(root);
    // Resolves from this file's folder up to the project's node_modules.
    const prettier = await import("prettier");
    const ignorePath = [".gitignore", ".prettierignore"].map((name) => path.join(root, name));
    const info = await prettier.getFileInfo(file, { ignorePath, resolveConfig: true });

    if (!info.ignored && info.inferredParser) {
      const options = (await prettier.resolveConfig(file)) ?? {};
      const source = readFileSync(file, "utf8");
      const formatted = await prettier.format(source, { ...options, filepath: file });
      if (formatted !== source) writeFileSync(file, formatted);
    }
  }
} catch (error) {
  console.error(`format-file hook: ${error instanceof Error ? error.message : String(error)}`);
}
