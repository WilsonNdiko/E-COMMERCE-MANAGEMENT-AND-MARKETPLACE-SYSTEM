const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");

/**
 * Lightweight zero-dependency .env loader (safe on Windows, macOS, and Linux,
 * even before optional packages finish installing).
 */
function loadEnvFile(envPath) {
  try {
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      if (!key || process.env[key] !== undefined) continue;
      let val = line.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  } catch (_) {
    // Ignore unreadable .env files
  }
}

/**
 * Resolves DATABASE_URL into a format guaranteed to work with `@libsql/client`
 * across Windows (`file:C:/Users/.../prisma/dev.db`), macOS, and Linux
 * (`file:/home/.../prisma/dev.db`), including paths containing spaces or symbols.
 *
 * NOTE: Do NOT use `pathToFileURL(absPath).href` on Windows — that produces
 * `file:///C:/...` which `@libsql/core` parses into `"/C:/..."` (invalid path).
 */
function resolveLibsqlUrl(projectRoot, explicitUrl) {
  const root = projectRoot || process.cwd();
  loadEnvFile(path.join(root, ".env"));
  loadEnvFile(path.join(root, "server", ".env"));

  let raw = (
    explicitUrl ||
    process.env.DATABASE_URL ||
    "file:./prisma/dev.db"
  ).trim();

  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    raw = raw.slice(1, -1).trim();
  }

  // Pass through remote LibSQL / Turso / in-memory URLs untouched
  if (
    raw.startsWith("libsql://") ||
    raw.startsWith("https://") ||
    raw.startsWith("http://") ||
    raw === "file::memory:" ||
    raw.startsWith("file::memory:?")
  ) {
    return raw;
  }

  let absPath;
  if (raw.startsWith("file://")) {
    try {
      absPath = fileURLToPath(raw);
    } catch (_) {
      // Fallback: strip file:/// on Windows drive letters like file:///C:/...
      const stripped = raw.replace(/^file:\/\/\/?/, "");
      absPath = /^[A-Za-z]:[\\/]/.test(stripped) ? stripped : "/" + stripped;
    }
  } else {
    const filePart = raw.startsWith("file:") ? raw.slice("file:".length) : raw;
    // Strip any query string from file path (e.g. ?connection_limit=1)
    const cleanPart = filePart.split("?")[0];
    const isWinDrive = /^[A-Za-z]:[\\/]/.test(cleanPart);
    absPath =
      path.isAbsolute(cleanPart) || isWinDrive
        ? cleanPart
        : path.resolve(root, cleanPart);
  }

  // Ensure parent directory exists so SQLite can create/open the DB file
  try {
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
  } catch (_) {}

  // Convert backslashes to forward slashes and escape only URI-reserved chars
  // (`@libsql/core` percent-decodes the path without adding a leading `/` on `file:C:/...`)
  const normalized = absPath
    .replace(/\\/g, "/")
    .replace(/^\/([A-Za-z]:\/)/, "$1")
    .replace(/%/g, "%25")
    .replace(/\?/g, "%3F")
    .replace(/#/g, "%23");

  return `file:${normalized}`;
}

module.exports = { loadEnvFile, resolveLibsqlUrl };
