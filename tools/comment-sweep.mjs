#!/usr/bin/env node
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const USAGE = `comment-sweep — remove comments from a target's source and restamp its bindings.

A human's tool, run in two phases. Phase "strip" edits files and writes a proof
manifest; nothing is stripped unless the TypeScript printer output of the file,
with comments removed, is byte-identical before and after the edit — a file that
fails that proof is restored untouched and reported. Phase "bind" reads the
manifest, requires the stripped files committed, and restamps each binding whose
digest matched the trace BEFORE the strip, through trace.py --bind. A binding
already stale before the sweep is never restamped: its drift predates the sweep
and keeps its /reconcile route.

Kept comments: tool directives (eslint, @ts-*, prettier, istanbul/c8, biome,
vitest environment, triple-slash references) and the shebang line.

Usage:
  node tools/comment-sweep.mjs --target <key> [--project-root <dir>]
       [--siegard-bin <dir>] [--phase strip|bind] [--apply] [file ...]

  --target <key>        required; a key of siegard.json targets
  --project-root <dir>  default: the repository root above tools/
  --siegard-bin <dir>   default: newest siegard under ~/.claude/plugins/cache
  --phase strip|bind    default: strip
  --apply               strip: write files and manifest (default: dry run)
                        bind: run trace.py --bind (default: print the plan)
  file ...              restrict to these paths, relative to the target root

Exit: 0 done / dry run printed; 1 a file failed its proof or a bind refused;
      2 cannot run.`;

function fail(message) {
  process.stderr.write(`cannot run: ${message}\n`);
  process.exit(2);
}

function parseArgs(argv) {
  const args = { phase: "strip", apply: false, files: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--help") { console.log(USAGE); process.exit(0); }
    else if (a === "--target") args.target = argv[++i];
    else if (a === "--project-root") args.projectRoot = argv[++i];
    else if (a === "--siegard-bin") args.siegardBin = argv[++i];
    else if (a === "--phase") args.phase = argv[++i];
    else if (a === "--apply") args.apply = true;
    else if (a.startsWith("--")) fail(`unknown option ${a}`);
    else args.files.push(a);
  }
  if (!args.target) fail("--target is required (a key of siegard.json targets)");
  if (!["strip", "bind"].includes(args.phase)) fail(`--phase is strip or bind, not ${args.phase}`);
  return args;
}

function findSiegardBin(given) {
  if (given) {
    if (!fs.existsSync(path.join(given, "trace.py"))) fail(`${given} holds no trace.py`);
    return given;
  }
  const cache = path.join(os.homedir(), ".claude/plugins/cache/siegard-generator/siegard");
  if (!fs.existsSync(cache)) fail(`no plugin cache at ${cache}; pass --siegard-bin`);
  const versions = fs.readdirSync(cache).filter((v) => /^\d+\.\d+\.\d+$/.test(v));
  if (versions.length === 0) fail(`no versions under ${cache}; pass --siegard-bin`);
  versions.sort((a, b) => {
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);
    return pa[0] - pb[0] || pa[1] - pb[1] || pa[2] - pb[2];
  });
  return path.join(cache, versions[versions.length - 1], "bin");
}

function runPy(bin, script, cliArgs) {
  const done = spawnSync("python3", ["-B", path.join(bin, script), ...cliArgs],
    { encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 });
  if (done.error) fail(`${script}: ${done.error.message}`);
  return done;
}

function readProject(bin, projectRoot, targetKey) {
  const done = runPy(bin, "project.py", [projectRoot]);
  const fields = {};
  for (const line of done.stdout.split("\n")) {
    const hit = line.match(/^(specification_root|target (\S+)): (.+)$/);
    if (hit) {
      if (hit[1] === "specification_root") fields.spec = hit[3];
      else if (hit[2] === targetKey) fields.target = hit[3];
    }
  }
  if (!fields.spec) fail(`project.py named no specification_root for ${projectRoot}`);
  if (!fields.target) fail(`project.py named no target ${targetKey} for ${projectRoot}`);
  return fields;
}

const SOURCE = /\.(ts|tsx|mts|cts)$/;
const SKIP_DIRS = new Set(["node_modules", "dist", "build", "coverage", ".git"]);

function walk(dir, rootAbs, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name), rootAbs, out);
    } else if (SOURCE.test(entry.name)) {
      out.push(path.relative(rootAbs, path.join(dir, entry.name)).split(path.sep).join("/"));
    }
  }
  return out;
}

const KEEP = [
  /^\/\/\/\s*<(reference|amd-)/,
  /@ts-(expect-error|ignore|nocheck|check)\b/,
  /\beslint-(disable|enable)/,
  /\bprettier-ignore\b/,
  /\b(istanbul|c8)\s+ignore\b/,
  /\bbiome-ignore\b/,
  /@vitest-environment\b/,
  /@jsx(Runtime|ImportSource|Frag)?\b/,
];

function loadTypescript(targetAbs) {
  const anchor = path.join(targetAbs, "package.json");
  if (!fs.existsSync(anchor)) fail(`${anchor} does not exist; typescript resolves from the target root`);
  try {
    return createRequire(anchor)("typescript");
  } catch (broken) {
    fail(`typescript does not resolve from ${targetAbs}: ${broken.message}`);
  }
}

function commentRanges(ts, sourceFile, text) {
  const found = new Map();
  const collect = (pos, end) => {
    for (const kind of ["Leading", "Trailing"]) {
      const at = kind === "Leading" ? pos : end;
      const ranges = (kind === "Leading"
        ? ts.getLeadingCommentRanges(text, at)
        : ts.getTrailingCommentRanges(text, at)) || [];
      for (const r of ranges) found.set(r.pos, r);
    }
  };
  const visit = (node) => {
    collect(node.pos, node.end);
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  collect(sourceFile.endOfFileToken.pos, sourceFile.endOfFileToken.end);
  return [...found.values()].sort((a, b) => a.pos - b.pos);
}

function strippable(text, range) {
  const body = text.slice(range.pos, range.end);
  if (range.pos === 0 && body.startsWith("#!")) return false;
  return !KEEP.some((pattern) => pattern.test(body));
}

function stripText(ts, filename, text) {
  const kind = filename.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const before = ts.createSourceFile(filename, text, ts.ScriptTarget.Latest, false, kind);
  const ranges = commentRanges(ts, before, text).filter((r) => strippable(text, r));
  if (ranges.length === 0) return { text, removed: 0 };

  let out = "";
  let cursor = 0;
  for (const r of ranges) {
    out += text.slice(cursor, r.pos);
    const prev = out.length > 0 ? out[out.length - 1] : "";
    const next = r.end < text.length ? text[r.end] : "";
    if (/\S/.test(prev) && /\S/.test(next)) out += " ";
    cursor = r.end;
  }
  out += text.slice(cursor);

  out = out.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").replace(/^\n+/, "");
  if (!out.endsWith("\n")) out += "\n";

  const after = ts.createSourceFile(filename, out, ts.ScriptTarget.Latest, false, kind);
  const printer = ts.createPrinter({ removeComments: true });
  const provenBefore = printer.printFile(before);
  const provenAfter = printer.printFile(after);
  const beforeErrors = before.parseDiagnostics ? before.parseDiagnostics.length : 0;
  const afterErrors = after.parseDiagnostics ? after.parseDiagnostics.length : 0;
  if (provenBefore !== provenAfter || afterErrors > beforeErrors) {
    return { text, removed: 0, failed: true };
  }
  return { text: out, removed: ranges.length };
}

function sha256(text) {
  return "sha256:" + createHash("sha256").update(text).digest("hex");
}

function encodesOf(bin, targetAbs, projectRoot, relFiles) {
  const anchor = path.relative(projectRoot, targetAbs).split(path.sep).join("/");
  const byFile = new Map();
  const chunk = 80;
  for (let i = 0; i < relFiles.length; i += chunk) {
    const slice = relFiles.slice(i, i + chunk);
    const done = runPy(bin, "trace.py", ["--encodes", targetAbs, ...slice]);
    if (done.status === 2) fail(`trace.py --encodes refused:\n${done.stderr}${done.stdout}`);
    let current = null;
    for (const line of done.stdout.split("\n")) {
      const head = line.match(/^(\S+): (\d+) binding\(s\)$/);
      const none = line.match(/^(\S+): the trace binds nothing to this file$/);
      const node = line.match(/^ {2}(\S+) — (matches|stale.*)$/);
      if (head) { current = head[1]; byFile.set(current, []); }
      else if (none) { byFile.set(none[1], []); current = null; }
      else if (node && current) {
        byFile.get(current).push({ id: node[1], state: node[2] === "matches" ? "matches" : "stale" });
      }
    }
  }
  const resolved = new Map();
  for (const rel of relFiles) {
    const anchored = anchor === "" || anchor === "." ? rel : `${anchor}/${rel}`;
    resolved.set(rel, byFile.get(anchored) ?? []);
  }
  return resolved;
}

function gitClean(projectRoot, targetAbs, relFiles) {
  const done = spawnSync("git", ["-C", projectRoot, "status", "--porcelain", "--",
    ...relFiles.map((rel) => path.join(targetAbs, rel))],
  { encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 });
  return done.status === 0 && done.stdout.trim() === "";
}

function manifestPath(projectRoot, targetKey) {
  return path.join(projectRoot, "tools", `comment-sweep-${targetKey}.json`);
}

function phaseStrip(args, bin, roots) {
  const targetAbs = roots.target;
  const files = args.files.length > 0 ? args.files : walk(targetAbs, targetAbs, []);
  const ts = loadTypescript(targetAbs);
  const bindings = encodesOf(bin, targetAbs, args.projectRoot, files);

  const entries = [];
  const failed = [];
  let untouched = 0;
  for (const rel of files) {
    const abs = path.join(targetAbs, rel);
    const original = fs.readFileSync(abs, "utf-8");
    const result = stripText(ts, rel, original);
    if (result.failed) { failed.push(rel); continue; }
    if (result.removed === 0) { untouched += 1; continue; }
    const nodes = bindings.get(rel) ?? [];
    entries.push({
      path: rel,
      removed: result.removed,
      before: sha256(original),
      after: sha256(result.text),
      eligible: nodes.filter((n) => n.state === "matches").map((n) => n.id),
      stale_before_sweep: nodes.filter((n) => n.state === "stale").map((n) => n.id),
      newText: result.text,
    });
  }

  for (const entry of entries) {
    const owed = entry.stale_before_sweep.length > 0
      ? `; ${entry.stale_before_sweep.length} binding(s) already stale before the sweep keep their /reconcile route`
      : "";
    console.log(`${entry.path}: ${entry.removed} comment(s), ${entry.eligible.length} binding(s) to restamp${owed}`);
  }
  console.log(`\n${entries.length} file(s) to strip, ${untouched} already clean, ${failed.length} failed the proof`);
  for (const rel of failed) console.log(`  FAILED PROOF (untouched, needs eyes): ${rel}`);

  if (!args.apply) {
    console.log("\ndry run: nothing written. Re-run with --apply to write files and the manifest.");
    return failed.length > 0 ? 1 : 0;
  }

  for (const entry of entries) {
    fs.writeFileSync(path.join(targetAbs, entry.path), entry.newText, "utf-8");
    delete entry.newText;
  }
  const manifest = {
    target: args.target,
    written_at: new Date().toISOString(),
    files: entries,
    failed_proof: failed,
  };
  fs.writeFileSync(manifestPath(args.projectRoot, args.target),
    JSON.stringify(manifest, null, 2) + "\n", "utf-8");
  console.log(`\nwrote ${entries.length} file(s) and ${manifestPath(args.projectRoot, args.target)}`);
  console.log("next: review the diff, commit the stripped sources, then run --phase bind --apply");
  return failed.length > 0 ? 1 : 0;
}

function phaseBind(args, bin, roots) {
  const targetAbs = roots.target;
  const at = manifestPath(args.projectRoot, args.target);
  if (!fs.existsSync(at)) fail(`${at} does not exist; run --phase strip --apply first`);
  const manifest = JSON.parse(fs.readFileSync(at, "utf-8"));

  const drifted = manifest.files.filter((entry) =>
    sha256(fs.readFileSync(path.join(targetAbs, entry.path), "utf-8")) !== entry.after);
  if (drifted.length > 0) {
    fail(`these files no longer match the manifest — re-run strip:\n  ${drifted.map((e) => e.path).join("\n  ")}`);
  }
  if (!gitClean(args.projectRoot, targetAbs, manifest.files.map((e) => e.path))) {
    fail("the stripped files are not committed; a bind records a digest, and the digest of an uncommitted edit points at content the next checkout erases");
  }

  const byNode = new Map();
  for (const entry of manifest.files) {
    for (const node of entry.eligible) {
      if (!byNode.has(node)) byNode.set(node, []);
      byNode.get(node).push(entry.path);
    }
  }

  if (!args.apply) {
    for (const [node, files] of byNode) {
      console.log(`would bind ${node} ← ${files.join(", ")}`);
    }
    console.log(`\ndry run: ${byNode.size} bind(s) planned. Re-run with --apply to write them.`);
    return 0;
  }

  let bound = 0;
  for (const [node, files] of byNode) {
    const done = runPy(bin, "trace.py", ["--bind", targetAbs, roots.spec, node, ...files]);
    process.stdout.write(done.stdout);
    if (done.stderr) process.stderr.write(done.stderr);
    if (done.status !== 0) {
      console.error(`\nbind refused for ${node}; ${bound} bind(s) already written stand — fix and re-run, binds are idempotent`);
      return 1;
    }
    bound += 1;
  }
  console.log(`\n${bound} node(s) restamped. Confirm with trace.py --check, then commit siegard-trace.json.`);
  const stale = manifest.files.flatMap((e) => e.stale_before_sweep.map((n) => `${n} ← ${e.path}`));
  if (stale.length > 0) {
    console.log(`${stale.length} binding(s) were already stale before the sweep and were not touched:`);
    for (const line of stale) console.log(`  ${line}`);
  }
  return 0;
}

const args = parseArgs(process.argv.slice(2));
args.projectRoot = path.resolve(args.projectRoot ?? path.join(path.dirname(new URL(import.meta.url).pathname), ".."));
const bin = findSiegardBin(args.siegardBin);
const roots = readProject(bin, args.projectRoot, args.target);
process.exit(args.phase === "strip" ? phaseStrip(args, bin, roots) : phaseBind(args, bin, roots));
