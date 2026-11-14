// Writes public/version.json so useVersionCheck can detect new deploys and hard-reload open tabs.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
mkdirSync(new URL("../public/", import.meta.url), { recursive: true });
writeFileSync(
  new URL("../public/version.json", import.meta.url),
  JSON.stringify({ version: `${pkg.version}-${Date.now()}` }),
);
