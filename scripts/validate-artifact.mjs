import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const workerPath = resolve(projectRoot, "dist/server/index.js");
const manifestPath = resolve(projectRoot, "dist/.openai/hosting.json");

const [source, manifest] = await Promise.all([
  readFile(workerPath, "utf8"),
  readFile(manifestPath, "utf8"),
]);
JSON.parse(manifest);

// A data URL forces ESM parsing even though the generated output has no package.json.
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const workerModule = await import(moduleUrl);
assert.equal(
  typeof workerModule.default?.fetch,
  "function",
  `${pathToFileURL(workerPath)} must export default.fetch`,
);

console.log("Artifact is valid ESM and exports default.fetch");

// Parse the embedded browser program too; valid Worker ESM alone is insufficient.
const pageResponse = await workerModule.default.fetch(new Request('https://doodleworld.test/'), {});
assert.equal(pageResponse.status, 200);
const html = await pageResponse.text();
assert.ok(!html.includes('/*__ENGINE__*/') && !html.includes('/*__WORLD_VIEW__*/'));
const {Script} = await import('node:vm');
const browserProgram = html.match(/<script type=\"module\">([\s\S]*?)<\/script>/)?.[1];
assert.ok(browserProgram, 'Browser program must be embedded');
new Script(browserProgram, {filename: 'doodleworld-client.js'});
console.log('Embedded browser JavaScript parses successfully');
