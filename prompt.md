# Initial Prompt: 3D DSA Visualizer (for Antigravity)

Copy everything below the line into Antigravity as your first message.

---

You are my senior engineering partner on a university project. I am a third-semester CS student at NED University building a Complex Computing Problem (CCP) for my Data Structures & Algorithms course. I must be able to explain and defend every part of this codebase in a viva, so favour clarity over cleverness, and comment the non-obvious decisions.

# 1. The project

Build a **3D Data Structures & Algorithms Visualizer** that runs entirely in the browser (no backend).

Two modes:
- **Library mode:** built-in data structures and algorithms, animated step by step in 3D.
- **Upload mode:** the user pastes or uploads their own code. The app runs it in a sandbox, records what it does, and visualizes it in the same 3D scene.

The 3D space must feel like Blender's viewport: free orbit / pan / zoom, an infinite grid floor, an XYZ axis gizmo, click-to-select objects, and camera presets (front / top / side / focus-selected).

# 2. Locked stack (do not swap without asking me)

- Vite + React + TypeScript (strict mode)
- Three.js via @react-three/fiber and @react-three/drei (OrbitControls, Grid, GizmoHelper/GizmoViewport, Text, Line)
- Zustand for state
- Vitest for unit tests
- web-tree-sitter + tree-sitter-cpp (WASM) to parse uploaded C++, plus our own tree-walking C++ interpreter written in TypeScript (section 6.3)
- Pyodide (optional stretch only) for Python upload support
- Minimal dependencies, pinned versions. Ask before adding any package not listed here.

# 3. Core architecture: the trace model

All algorithms, built-in or uploaded, produce a **trace**: an ordered list of events. The 3D renderer only replays traces. It never runs algorithm logic itself. This keeps logic and visuals separate and makes play / pause / step forward / step back / speed control straightforward.

```ts
type Ref = { id: string; index?: number };
type Primitive = number | string | boolean | null;

type TraceEvent =
  | { t: 'line'; line: number }
  | { t: 'create'; id: string; kind: 'array' | 'node' | 'edge'; value?: Primitive }
  | { t: 'set'; target: Ref; value: Primitive }
  | { t: 'compare'; a: Ref; b: Ref }
  | { t: 'swap'; a: Ref; b: Ref }
  | { t: 'link'; from: string; to: string; label?: string }
  | { t: 'unlink'; from: string; to: string }
  | { t: 'remove'; id: string }
  | { t: 'visit'; id: string }
  | { t: 'note'; text: string }
  | { t: 'call'; fn: string; args: Primitive[]; depth: number }
  | { t: 'return'; fn: string; value?: Primitive }
  | { t: 'truncated'; reason: string }
  | { t: 'done' };
```

Requirements:
- Playback engine supports step back by storing periodic state snapshots (keyframes), not by re-running the algorithm.
- Each data structure has its own renderer and a 3D layout strategy: arrays along an axis, linked lists along a path, trees fanning out in depth (not just left/right), graphs with a force-directed layout, heaps as trees plus an array strip.
- Use instanced meshes once node count exceeds a threshold. Target 60 fps at 500 nodes. Cap rendered nodes and show a message when capped.

# 4. UI layout

- Left panel: choose structure / algorithm, input data (custom array, graph editor, etc.).
- Centre: the 3D viewport.
- Right panel: properties of the selected node, plus a code panel with the current line highlighted and time/space complexity info.
- Bottom bar: play, pause, step, step back, speed slider, timeline scrubber, step counter.
- Dark, Blender-inspired theme. Keyboard shortcuts for playback. Labels rendered with drei `<Text>`, never raw HTML from user data.

## 4.1 Operations, Play button and animation language

**Operations panel (left side).** Each structure exposes its operations as buttons with input fields:
- Array: insert at index, delete at index, update, linear/binary search, reverse, rotate.
- Linked list: insert at head/tail/position, delete head/tail/value, search, reverse, traverse.
- Stack: push, pop, peek. Queue: enqueue, dequeue, peek.
- BST: insert, delete (leaf, one child and two-children cases), search, min/max, inorder / preorder / postorder / level-order traversal.
- AVL: insert and delete with visible rotations (LL, RR, LR, RL).
- Heap: insert (bubble up), extract (bubble down), heapify.
- Graph: add/remove vertex and edge, BFS, DFS, Dijkstra.

**Play flow.** The user picks an operation and enters a value. The library generates a trace for it, and the viewport is then ready to play.
- A large Play button sits as an overlay in the 3D viewport and is mirrored in the bottom bar. Spacebar toggles it.
- Controls: play, pause, step forward, step back, restart, skip to end, speed (0.25x to 4x), and a scrubber.
- Optional "auto-play on run" toggle.
- Operation queue: the user can chain operations (insert 5, insert 3, delete 5) and play the whole sequence, with a history list to jump to any point.

**Animation language** (consistent across all structures; never rely on colour alone, so add shapes, icons and labels, and keep it colour-blind safe, with a small legend):
- **Insert:** the node spawns with a scale-in and glow, and its edge draws in. If the structure re-balances or shifts, it re-lays out smoothly.
- **Delete:** the target is highlighted, then shrinks and fades. Its edges retract and neighbours re-link. For BST two-children deletion, visibly highlight the in-order successor and show the value copy.
- **Traversal:** the current node pulses, visited nodes get an order badge (1, 2, 3...), and a "visited order" strip shows the output so far. BFS and DFS also show a live queue or stack panel.
- **Search:** the path is highlighted. Found gives a success pulse, not found gives a shake.
- **Compare / swap:** compared nodes are joined by a beam, and swapped nodes arc past each other.
- **Rotations (AVL):** the pivot is highlighted and the subtree swings into place.
- **Narration:** a one-line caption per step (e.g. "5 < 8, go left"), synced with the code-panel line highlight. It comes from `note` events.
- **Camera:** an optional auto-follow mode focuses the active node. Any manual orbit, pan or zoom pauses auto-follow, and the user can always move the camera while an animation plays.

**Uploaded code** uses the same machinery. Let the user optionally tag the entry function as insert / delete / search / traverse so the captions and visuals use the right vocabulary. Otherwise, fall back to generic events.

# 5. Built-in library (Library mode)

Sorting: bubble, selection, insertion, merge, quick, heap sort.
Linear: array, singly/doubly linked list, stack, queue.
Trees: BST (insert / delete / search / traversals), AVL with rotations.
Heap: min/max heap insert and extract.
Graphs: BFS, DFS, Dijkstra.
Each algorithm ships with pseudocode, complexity info, and unit tests.

# 6. Upload Mode (the headline feature)

## 6.1 Languages (priority order)
1. **C++ (top priority; it is the language of my DSA course).** Supported through our own in-browser interpreter for a defined C++ subset (section 6.3). We do NOT compile real C++: tracing needs to observe every read, write and pointer change, and an interpreter gives that for free, with no backend.
2. **JavaScript / TypeScript:** built first (Phase 5) as the cheap way to prove the sandbox and trace pipeline end to end (TS is transpiled to JS, then instrumented).
3. **Stretch only:** Python via Pyodide.

Design a `LanguageAdapter` interface (`parse -> run -> TraceEvent[]`) so every language plugs into the same sandbox, trace model and renderers.

## 6.2 How uploaded JavaScript becomes a trace
Use a hybrid approach:
1. **Parse** the code to an AST (acorn or @babel/parser).
2. **Instrument** it: inject trace calls for line execution, function call/return, and array/object reads and writes.
3. **Proxy-wrap** the inputs: arrays and node-like objects are wrapped in Proxies that emit events on get/set.
4. **Auto-detect structure type** from the data shape: array of numbers means array/sorting; objects with `next` means linked list; `left`/`right` means binary tree; adjacency list or matrix means graph. Let the user override via a dropdown.
5. **Entry point:** the user picks a function and supplies sample input in a small form. Do not execute top-level code blindly beyond defining functions.
6. Output a normal `TraceEvent[]` that the same renderers and playback engine consume.

Show clear, friendly errors for unsupported constructs instead of crashing.

## 6.3 C++ upload (interpreter approach)
- **Parse** with web-tree-sitter + tree-sitter-cpp (WASM). **Run** by walking the syntax tree with our own TypeScript interpreter inside the sandbox worker. Every variable read/write, array index, pointer dereference, allocation and function call emits a `TraceEvent` directly.
- **Simulated memory:** a fake stack and heap of typed cells with addresses, so `new`, `delete`, pointers, `->`, references and `nullptr` behave like C++ and can be drawn (pointers become 3D arrows between nodes). Detect null dereference, dangling pointer use, double delete, out-of-bounds access and memory leaks, and report them as friendly runtime errors. This doubles as a teaching feature and must never crash the app.
- **Supported subset (propose the exact list in Phase 0, then confirm with me):** int/long/float/double/char/bool/string; 1D and 2D arrays; pointers and references; structs and classes (fields, methods, constructors, destructors); `new`/`delete`; functions and recursion; all control flow and operators; `cin`/`cout`/`endl`; `std::vector`, `std::string`, `std::stack`, `std::queue`, `std::pair`, `std::swap`, `std::sort`. Stretch: `std::map`, `std::priority_queue`, simple templates, operator overloading.
- **Unsupported (reject with "Unsupported at line N: ..." and never silently misbehave):** threads, file I/O, `system`, inline assembly, `#include` of anything outside the supported list, preprocessor tricks beyond `#include` and simple `#define`, heavy template metaprogramming.
- **Input:** there is no stdin in the browser, so provide an input box that feeds `cin`.
- **Auto-detect structure:** struct with a self-pointer `next` means linked list; `left`/`right` means tree; `vector<vector<int>>` or an adjacency array means graph; array/vector of numbers means array. The user can override.
- **Fidelity:** the interpreter must match real g++ output on a test corpus. Ask me for 3 to 5 real programs from my DSA course in Phase 0 and use them as the acceptance corpus. Comparing against a local g++ in tests is fine, but the app itself never compiles or runs native code.

# 7. Security guardrails for untrusted code (non-negotiable)

Uploaded code is untrusted. Treat it as hostile.

**Isolation (the real security boundary):**
- Never run user code on the main thread. Never use `eval`, `new Function`, or `setTimeout(string)` in the app itself.
- Run it in a Web Worker hosted inside an `<iframe sandbox="allow-scripts">` (do NOT add `allow-same-origin`), loaded with a strict CSP: `default-src 'none'; script-src 'unsafe-eval' blob:; connect-src 'none'` (adjust minimally, document every exception and why).
- Communicate only via `postMessage` with structured-cloneable data. The main app must validate every incoming message against a schema (e.g. zod) and drop anything malformed.
- C++ is never compiled or run natively. It is interpreted by our own interpreter, inside this same sandboxed worker, over a simulated memory, so uploaded C++ has no access to the real machine by construction. The interpreter itself becomes part of the attack surface, so keep it small and fuzz it.

**Defence in depth (helpful, not the boundary):**
- Before running user code in the worker, remove or shadow `fetch`, `XMLHttpRequest`, `WebSocket`, `importScripts`, `indexedDB`, `caches`, `Worker`, `navigator.sendBeacon`, and similar.
- Static pre-scan that warns on `eval`, `Function(`, dynamic `import()`, `constructor.constructor`, `__proto__`, `globalThis`/`self` tricks. Warnings must not be the only protection.

**Resource limits:**
- Max file size 100 KB, max 2,000 lines.
- Max trace length (default 50,000 events); on hitting it, emit `truncated` and stop.
- Wall-clock watchdog (default 3 s): the main thread calls `worker.terminate()` on timeout.
- Max recursion depth, max array length for proxied inputs, max input size from the form.
- C++ interpreter limits: simulated heap cap (e.g. 16 MB), max stack depth (e.g. 2,000 frames), max executed steps, max output length, max `cin` input size. Reject unsupported `#include`s up front. Any breach ends the run with a clear error.
- If Python/Pyodide is ever added, it runs under the same limits and downloads only after the user opts in.

**Data and display safety:**
- Uploaded files are read as text only, validated by extension, size and encoding. Never sent to any server, never stored beyond the session.
- No `dangerouslySetInnerHTML`, no `innerHTML` with user-derived strings. Any text from user code is treated as plain data.
- No telemetry. Show a visible notice: "Your code runs locally in a sandbox and never leaves your browser."
- Pin dependency versions and run `npm audit`.

**Mandatory sandbox tests** (automated, must pass before Phase 5 is considered done). Each of these hostile samples must be contained, produce a clean error, and leave the app responsive:
- infinite loop; infinite recursion
- huge allocation (e.g. `new Array(1e9)`, string doubling)
- `fetch` / `XMLHttpRequest` / `WebSocket` attempts
- access to `window.parent`, `top`, `document`, `localStorage`, cookies
- prototype pollution attempts
- a worker that floods `postMessage`
- C++ hostile samples: `while(true){}`, infinite recursion, `new int[1000000000]`, double `delete`, null and dangling pointer dereference, out-of-bounds array write, `#include <fstream>` and `system("...")` attempts, 10 MB of `cout` output

# 8. Agent guardrails (how you must work)

- **Plan first.** Your first response must contain NO code: give a short plan, the folder structure, the open risks, and up to 5 clarifying questions. Also propose the exact C++ subset you will support, and ask me for 3 to 5 sample programs from my DSA course. Wait for my answer.
- **Work in phases** (section 9). Do not start the next phase until the current one builds, passes its tests, and I have approved it.
- **Don't invent APIs.** Check installed package versions and their docs for R3F, drei, Pyodide and acorn/Babel. If you are unsure, say so rather than guessing.
- **Stay in scope.** Do not add features I did not ask for. List any assumptions you make.
- **Safe operations only:** work only inside the project directory; no `sudo`, no `rm -rf` outside the project, no force-pushes, no `curl | bash`; no network access except package installs; ask before installing anything heavy or not listed in section 2.
- **No secrets.** Do not create or commit `.env` files or API keys. The project needs none.
- **Honest reporting.** If something is broken, partial, or faked with placeholder logic, say so plainly. Never claim a test passes without running it.
- **Tests:** every algorithm gets unit tests, including a check that replaying its trace reproduces the correct final state.
- **Explain as you go:** for each phase, finish with a 5-line summary of what was built and why, written so I can repeat it in a viva.

# 9. Phases and acceptance criteria

0. **Plan:** plan, folder structure, risks, questions. No code.
1. **Scaffold + viewport:** Vite/React/TS project, Blender-style scene (grid, gizmo, orbit/pan/zoom, camera presets, click-select), dark UI shell.
2. **Trace engine + arrays:** TraceEvent types, playback engine with step back, array renderer, bubble/insertion/merge/quick sort, bottom playback bar, large viewport Play button, operations panel for arrays (insert/delete/search/reverse), narration captions, code panel with line highlight.
3. **Linear + trees:** linked list, stack, queue, BST, AVL rotations, 3D tree layout, with every operation from section 4.1 (insert, delete, search, traversals) animated and playable.
4. **Heap + graphs:** heap, BFS, DFS, Dijkstra, force-directed layout, graph input editor.
5. **Sandbox + JS upload:** the full section 7 isolation, instrumentation pipeline, structure auto-detect, all hostile-sample tests passing. JS is the cheap test bed that proves the pipeline before the C++ work.
6. **C++ upload (the big one), in three steps, each approved separately:**
   - 6a: tree-sitter parsing, interpreter core (types, expressions, control flow, functions, recursion, arrays, `cin`/`cout`), trace emission, array and sorting programs working.
   - 6b: simulated memory, pointers, structs/classes, `new`/`delete`, memory-error detection, linked-list and tree programs visualized with pointer arrows.
   - 6c: the supported STL subset, graph programs, auto-detect with override, C++ hostile-sample tests, and the course-program corpus passing.
7. **Polish + docs:** performance pass, error UX, README, architecture doc (with diagram), demo script, and a report outline (problem, design decisions, trade-offs, limitations, testing evidence).

**Stretch (only if I ask):** Python via Pyodide, shareable trace files, VR/AR view.

# 10. Definition of done

- `npm run build`, `npm run test` and `npm run lint` all pass.
- Works in current Chrome and Firefox.
- Pressing Play animates insert, delete, search and traversal on every built-in structure, and I can orbit the camera freely while it plays.
- All section 7 sandbox tests pass.
- I can upload a bubble sort, a linked-list reversal and a BST insert, written by me in C++, and see them animate correctly with pointers drawn as arrows.
- The sample programs from my DSA course all run with output identical to g++.

Begin with Phase 0 only.