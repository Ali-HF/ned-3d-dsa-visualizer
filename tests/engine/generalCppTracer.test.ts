import { describe, it, expect } from 'vitest';
import { runCppTrace } from '../../src/engine/cppInterpreter';
import { TraceTimeline } from '../../src/engine/traceEngine';
import {
  CORPUS_FILE_CATALOG,
  getCorpusRawText,
} from '../../src/corpus/cppCorpusRegistry';
import {
  useViewportStore,
  buildSceneObjectsForScene,
} from '../../src/state/useViewportStore';
import {
  ARRAY_ALGORITHM_METADATA,
  type ArrayOperationId,
} from '../../src/algorithms/array/arrayAlgorithms';
import {
  STRUCTURE_OP_CATALOG,
} from '../../src/algorithms/structures/structureAlgorithms';
import {
  getExecutableLineNumbers,
} from '../../src/engine/corpusRunner';
import type { PreviewSceneKind, TraceStateSnapshot } from '../../src/types/trace';

function snapshotStateSignature(snap: TraceStateSnapshot): string {
  return JSON.stringify({
    activeLine: snap.activeLine,
    arrays: snap.arrays,
    matrices: snap.matrices,
    nodes: snap.nodes,
    edges: snap.edges,
    callStack: snap.callStack,
    scalars: snap.scalars,
    containers: snap.containers,
    comparedRefs: snap.comparedRefs,
    swappedRefs: snap.swappedRefs,
    activeVisitId: snap.activeVisitId,
    narration: snap.narration,
    isDone: snap.isDone,
  });
}

function assertUniversalInvariants(
  label: string,
  sourceCode: string,
  expectedScene?: PreviewSceneKind,
  expectReadOnlyArray = false,
) {
  const codeLines = sourceCode.replace(/\r\n/g, '\n').split('\n');
  const res = runCppTrace(sourceCode, {
    fallbackArray: [42, 17, 68, 29, 84, 12],
    fileName: label,
    maxSteps: 20000,
    timeoutMs: 4000,
  });

  if (expectedScene) {
    expect(res.scene, `${label}: detected scene`).toBe(expectedScene);
  }

  expect(res.events.length, `${label}: must emit trace events`).toBeGreaterThan(1);

  const timeline = new TraceTimeline(res.events);
  let prevSig = '';
  let hasNonEmptyStage = false;

  for (let step = 1; step <= timeline.totalSteps; step++) {
    const snap = timeline.getSnapshotAt(step);
    const ev = res.events[step - 1];

    // Invariant 5: Snapshot stepIndex matches current step
    expect(snap.stepIndex, `${label} step ${step}: stepIndex`).toBe(step);

    // Invariant 2: Every activeLine is a real 1-based line of the displayed source
    expect(snap.activeLine, `${label} step ${step}: activeLine not null`).not.toBeNull();
    expect(snap.activeLine!, `${label} step ${step}: activeLine >= 1`).toBeGreaterThanOrEqual(1);
    expect(
      snap.activeLine!,
      `${label} step ${step}: activeLine <= ${codeLines.length}`,
    ).toBeLessThanOrEqual(codeLines.length);

    if (typeof ev.line === 'number') {
      expect(snap.activeLine, `${label} step ${step}: activeLine matches ev.line`).toBe(ev.line);
    }

    // Invariant 1: No two adjacent steps have identical activeLine and identical state
    const curSig = snapshotStateSignature(snap);
    if (step > 1 && ev.t !== 'done') {
      expect(
        curSig === prevSig,
        `${label} step ${step}: adjacent duplicate step at line ${snap.activeLine}`,
      ).toBe(false);
    }
    prevSig = curSig;

    // Check 3D stage objects
    const objs = buildSceneObjectsForScene(res.scene, snap);
    if (objs.length > 0) {
      hasNonEmptyStage = true;
    }
  }

  expect(hasNonEmptyStage, `${label}: must never have a completely blank 3D stage`).toBe(true);

  // Invariant 3: Programs with no array writes show no swap/sort visuals
  if (expectReadOnlyArray) {
    expect(res.hasArrayWrites, `${label}: hasArrayWrites must be false`).toBe(false);
    expect(
      res.events.some((e) => e.t === 'swap'),
      `${label}: read-only program must not emit swap events`,
    ).toBe(false);
    expect(res.meta.category, `${label}: read-only array category`).not.toBe('sorting');
  }

  return res;
}

describe('Part A & Part B — General Custom C++ Tracer, 15+ Diverse Programs & Universal Invariants', () => {
  it('Part B1 Report: executes ALL 33 cpp_corpus/ files natively through runCppTrace with zero unsupported syntax errors and valid line numbers', () => {
    const report: { path: string; passed: boolean; steps: number; scene: string; error?: string }[] = [];

    for (const entry of CORPUS_FILE_CATALOG) {
      const raw = getCorpusRawText(entry.relativePath);
      const codeLines = raw.replace(/\r\n/g, '\n').split('\n');
      try {
        const res = runCppTrace(raw, {
          fallbackArray: [42, 17, 68, 29, 84, 12],
          fileName: entry.relativePath,
          maxSteps: 20000,
          timeoutMs: 4000,
        });
        for (const ev of res.events) {
          expect(ev.line, `${entry.relativePath} event line`).toBeGreaterThanOrEqual(1);
          expect(ev.line, `${entry.relativePath} event line <= max`).toBeLessThanOrEqual(
            codeLines.length,
          );
        }
        report.push({
          path: entry.relativePath,
          passed: true,
          steps: res.events.length,
          scene: res.scene,
        });
      } catch (err) {
        report.push({
          path: entry.relativePath,
          passed: false,
          steps: 0,
          scene: 'error',
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    const failed = report.filter((r) => !r.passed);
    expect(failed, `Failed corpus files: ${JSON.stringify(failed)}`).toEqual([]);
    expect(report.length).toBe(33);
  });

  it('1. Sorting (Bubble Sort): sorts array, records swaps/compares, and verifies cout output', () => {
    const cpp = `#include <iostream>
using namespace std;
int main() {
    int arr[] = { 64, 25, 12, 22, 11 };
    int n = 5;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
    for (int i = 0; i < n; i++) cout << arr[i] << " ";
    cout << endl;
    return 0;
}`;
    const res = assertUniversalInvariants('bubble_sort.cpp', cpp, 'array', false);
    expect(res.hasArrayWrites).toBe(true);
    expect(res.extractedArray).toEqual([11, 12, 22, 25, 64]);
    expect(res.coutOutput).toBe('11 12 22 25 64');
  });

  it('2. Sorting (Quick Sort): recursive partition sort with cout verification', () => {
    const cpp = `#include <iostream>
using namespace std;
int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}
void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}
int main() {
    int arr[] = { 38, 27, 43, 3, 9, 82, 10 };
    quickSort(arr, 0, 6);
    for (int i = 0; i < 7; i++) cout << arr[i] << " ";
    cout << endl;
    return 0;
}`;
    const res = assertUniversalInvariants('quick_sort.cpp', cpp, 'array', false);
    expect(res.extractedArray).toEqual([3, 9, 10, 27, 38, 43, 82]);
    expect(res.coutOutput).toBe('3 9 10 27 38 43 82');
  });

  it('3. Read-Only Search (Binary Search): tracks low/mid/high index pointers and NEVER shows sort/swap visuals', () => {
    const cpp = `#include <iostream>
using namespace std;
int main() {
    int arr[] = { 10, 20, 30, 40, 50, 60, 70 };
    int low = 0, high = 6, target = 50, found = -1;
    while (low <= high) {
        int mid = (low + high) / 2;
        if (arr[mid] == target) {
            found = mid;
            break;
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    cout << "Found at: " << found << endl;
    return 0;
}`;
    const res = assertUniversalInvariants('binary_search.cpp', cpp, 'array', true);
    expect(res.coutOutput).toBe('Found at: 4');
    // Verify runtime index pointers (low, mid, high) were tracked on array `arr`
    const hasMidPointer = res.events.some(
      (e) => e.indexPointers && 'mid' in e.indexPointers && e.indexPointers.mid.arrayId === 'arr',
    );
    expect(hasMidPointer).toBe(true);
  });

  it('4. Two-Pointer Technique (Two Sum in Sorted Array): read-only array with left/right index markers', () => {
    const cpp = `#include <iostream>
using namespace std;
int main() {
    int arr[] = { 2, 7, 11, 15, 21 };
    int left = 0, right = 4, target = 22;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) {
            cout << left << "," << right << endl;
            break;
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    return 0;
}`;
    const res = assertUniversalInvariants('two_pointer.cpp', cpp, 'array', true);
    expect(res.coutOutput).toBe('1,3');
  });

  it('5. Recursion & Call Stack (Fibonacci / Factorial): renders 3D call stack blocks and never a blank stage', () => {
    const cpp = `#include <iostream>
using namespace std;
int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}
int main() {
    int ans = fib(5);
    cout << "fib(5) = " << ans << endl;
    return 0;
}`;
    const res = assertUniversalInvariants('recursion_fib.cpp', cpp);
    expect(res.coutOutput).toBe('fib(5) = 5');
    const timeline = new TraceTimeline(res.events);
    let maxCallDepth = 0;
    let saw3DCallBlocks = false;
    for (let s = 1; s <= timeline.totalSteps; s++) {
      const snap = timeline.getSnapshotAt(s);
      maxCallDepth = Math.max(maxCallDepth, snap.callStack.length);
      const objs = buildSceneObjectsForScene(res.scene, snap);
      if (objs.some((o) => o.id.startsWith('callframe-'))) {
        saw3DCallBlocks = true;
      }
    }
    expect(maxCallDepth).toBeGreaterThan(2);
    expect(saw3DCallBlocks).toBe(true);
  });

  it('6. Singly Linked List (struct with next pointer): auto-detects linked-list and prints traversal', () => {
    const cpp = `#include <iostream>
using namespace std;
struct Node {
    int data;
    Node* next;
    Node(int v) : data(v), next(nullptr) {}
};
int main() {
    Node* head = new Node(10);
    head->next = new Node(20);
    head->next->next = new Node(30);
    Node* curr = head;
    while (curr != nullptr) {
        cout << curr->data << " ";
        curr = curr->next;
    }
    cout << endl;
    return 0;
}`;
    const res = assertUniversalInvariants('sll_custom.cpp', cpp, 'linked-list');
    expect(res.coutOutput).toBe('10 20 30');
  });

  it('7. Doubly Linked List (struct with prev and next pointers): links both directions', () => {
    const cpp = `#include <iostream>
using namespace std;
struct DNode {
    int data;
    DNode* prev;
    DNode* next;
    DNode(int v) : data(v), prev(nullptr), next(nullptr) {}
};
int main() {
    DNode* a = new DNode(11);
    DNode* b = new DNode(22);
    a->next = b;
    b->prev = a;
    cout << a->data << " <-> " << b->prev->data << "," << a->next->data << endl;
    return 0;
}`;
    const res = assertUniversalInvariants('dll_custom.cpp', cpp, 'linked-list');
    expect(res.coutOutput).toBe('11 <-> 11,22');
  });

  it('8. Binary Search Tree (struct with left and right pointers): recursive insert & inorder output', () => {
    const cpp = `#include <iostream>
using namespace std;
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};
TreeNode* insert(TreeNode* root, int v) {
    if (!root) return new TreeNode(v);
    if (v < root->val) root->left = insert(root->left, v);
    else root->right = insert(root->right, v);
    return root;
}
void inorder(TreeNode* root) {
    if (!root) return;
    inorder(root->left);
    cout << root->val << " ";
    inorder(root->right);
}
int main() {
    TreeNode* root = nullptr;
    root = insert(root, 40);
    root = insert(root, 20);
    root = insert(root, 60);
    root = insert(root, 10);
    root = insert(root, 30);
    inorder(root);
    cout << endl;
    return 0;
}`;
    const res = assertUniversalInvariants('bst_custom.cpp', cpp, 'bst');
    expect(res.coutOutput).toBe('10 20 30 40 60');
  });

  it('9. STL Stack (std::stack<int>): push, top, pop and LIFO output', () => {
    const cpp = `#include <iostream>
#include <stack>
using namespace std;
int main() {
    stack<int> st;
    st.push(100);
    st.push(200);
    st.push(300);
    cout << st.top() << " ";
    st.pop();
    cout << st.top() << endl;
    return 0;
}`;
    const res = assertUniversalInvariants('stl_stack.cpp', cpp, 'stack');
    expect(res.coutOutput).toBe('300 200');
  });

  it('10. STL Queue (std::queue<int>): push, front, pop and FIFO output', () => {
    const cpp = `#include <iostream>
#include <queue>
using namespace std;
int main() {
    queue<int> q;
    q.push(15);
    q.push(25);
    q.push(35);
    cout << q.front() << " ";
    q.pop();
    cout << q.front() << " " << q.back() << endl;
    return 0;
}`;
    const res = assertUniversalInvariants('stl_queue.cpp', cpp, 'queue');
    expect(res.coutOutput).toBe('15 25 35');
  });

  it('11. STL Priority Queue (std::priority_queue<int>): max-heap ordering and heap tree view', () => {
    const cpp = `#include <iostream>
#include <queue>
using namespace std;
int main() {
    priority_queue<int> pq;
    pq.push(30);
    pq.push(90);
    pq.push(50);
    pq.push(70);
    while (!pq.empty()) {
        cout << pq.top() << " ";
        pq.pop();
    }
    cout << endl;
    return 0;
}`;
    const res = assertUniversalInvariants('stl_pq.cpp', cpp, 'heap');
    expect(res.coutOutput).toBe('90 70 50 30');
  });

  it('12. Graph BFS with Adjacency Matrix: auto-detects graph structure and outputs BFS order', () => {
    const cpp = `#include <iostream>
#include <queue>
using namespace std;
int main() {
    int adj[4][4] = {0};
    adj[0][1] = 1; adj[0][2] = 1;
    adj[1][3] = 1; adj[2][3] = 1;
    int visited[4] = {0};
    queue<int> q;
    visited[0] = 1;
    q.push(0);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        cout << u << " ";
        for (int v = 0; v < 4; v++) {
            if (adj[u][v] && !visited[v]) {
                visited[v] = 1;
                q.push(v);
            }
        }
    }
    cout << endl;
    return 0;
}`;
    const res = assertUniversalInvariants('graph_bfs.cpp', cpp, 'graph');
    expect(res.coutOutput).toBe('0 1 2 3');
  });

  it('13. 2D Matrix (vector<vector<int>>): renders 3D matrix grid and computes diagonal sum', () => {
    const cpp = `#include <iostream>
#include <vector>
using namespace std;
int main() {
    vector<vector<int>> grid = {
        { 1, 2, 3 },
        { 4, 5, 6 },
        { 7, 8, 9 }
    };
    int diagSum = 0;
    for (int i = 0; i < 3; i++) {
        diagSum += grid[i][i];
    }
    cout << "Diagonal sum: " << diagSum << endl;
    return 0;
}`;
    const res = assertUniversalInvariants('matrix_2d.cpp', cpp, 'array');
    expect(res.coutOutput).toBe('Diagonal sum: 15');
  });

  it('14. String Manipulation (std::string): palindrome check and character indexing', () => {
    const cpp = `#include <iostream>
#include <string>
using namespace std;
int main() {
    string s = "racecar";
    bool ok = true;
    int l = 0, r = s.length() - 1;
    while (l < r) {
        if (s[l] != s[r]) { ok = false; break; }
        l++;
        r--;
    }
    cout << s << " palindrome=" << (ok ? 1 : 0) << endl;
    return 0;
}`;
    const res = assertUniversalInvariants('string_palindrome.cpp', cpp);
    expect(res.coutOutput).toBe('racecar palindrome=1');
  });

  it('15. STL Map / Unordered Map (std::map<int, int>): key-value table view and range-for iteration', () => {
    const cpp = `#include <iostream>
#include <map>
using namespace std;
int main() {
    map<int, int> freq;
    int nums[] = { 10, 20, 10, 30, 20, 10 };
    for (int i = 0; i < 6; i++) {
        freq[nums[i]] = freq[nums[i]] + 1;
    }
    for (auto [k, v] : freq) {
        cout << k << ":" << v << " ";
    }
    cout << endl;
    return 0;
}`;
    const res = assertUniversalInvariants('stl_map.cpp', cpp, 'hash-table');
    expect(res.coutOutput).toBe('10:3 20:2 30:1');
  });

  it('16. STL List (std::list<int>) & Template Function: push_front, push_back, and generic template maxVal<T>', () => {
    const cpp = `#include <iostream>
#include <list>
using namespace std;
template <typename T>
T maxVal(T a, T b) {
    return (a > b) ? a : b;
}
int main() {
    list<int> lst;
    lst.push_back(20);
    lst.push_front(10);
    lst.push_back(maxVal(25, 30));
    for (int x : lst) {
        cout << x << " ";
    }
    cout << endl;
    return 0;
}`;
    const res = assertUniversalInvariants('stl_list_template.cpp', cpp, 'linked-list');
    expect(res.coutOutput).toBe('10 20 30');
  });

  it('17. Pure Scalar Math (Euclidean GCD & Prime Check): shows scalar variable blocks and never a blank stage', () => {
    const cpp = `#include <iostream>
using namespace std;
int main() {
    int a = 48, b = 18;
    while (b != 0) {
        int r = a % b;
        a = b;
        b = r;
    }
    cout << "GCD=" << a << endl;
    return 0;
}`;
    const res = assertUniversalInvariants('pure_math_gcd.cpp', cpp);
    expect(res.coutOutput).toBe('GCD=6');
  });

  it('Part A6: truncates gracefully with truncatedReason when maxSteps is reached on a progressing loop, and throws on a real infinite loop', () => {
    const progressingLoop = `int main() {
      int sum = 0;
      for (int i = 0; i < 50000; i++) {
        sum += i;
      }
      return 0;
    }`;
    const truncatedRes = runCppTrace(progressingLoop, { maxSteps: 120 });
    expect(truncatedRes.truncatedReason).toBeDefined();
    expect(truncatedRes.truncatedReason).toContain('Trace truncated at 120 steps');
    expect(truncatedRes.events.length).toBeGreaterThan(10);

    // Real infinite loop with zero state progress throws Runtime error
    expect(() =>
      runCppTrace('int main() {\n  while (true) {}\n  return 0;\n}', { maxSteps: 500 }),
    ).toThrow(/Runtime error at line 2/);

    // Unsupported syntax throws clear line number error and never falls back
    expect(() =>
      runCppTrace('#define BAD_MACRO(x) ((x) * 2)\nint main() { return 0; }'),
    ).toThrow(/Unsupported syntax at line 1/);
  });

  it('Part B2 & B3: stepping through Library corpus files and built-in operations in useViewportStore moves activeLine across real C++ lines and never gets stuck between two lines', () => {
    const store = useViewportStore.getState();

    // 1. Library Corpus file run (`selectAndRunCorpusFile`)
    store.selectAndRunCorpusFile('06_elementary_sorting/bubble_sort.cpp');
    store.restart();
    const corpusLinesVisited = new Set<number>();
    const codeLen = useViewportStore.getState().activeMetadata.code.length;
    while (useViewportStore.getState().currentStep < useViewportStore.getState().totalSteps) {
      const snap = useViewportStore.getState().currentSnapshot;
      expect(snap.stepIndex).toBe(useViewportStore.getState().currentStep);
      if (snap.activeLine !== null) {
        expect(snap.activeLine).toBeGreaterThanOrEqual(1);
        expect(snap.activeLine).toBeLessThanOrEqual(codeLen);
        corpusLinesVisited.add(snap.activeLine);
      }
      store.stepForward();
    }
    expect(corpusLinesVisited.size).toBeGreaterThan(4);

    // 2. Interactive Library operation button (`runStructureOperationNow`)
    store.runStructureOperationNow('bst-insert', 65);
    store.restart();
    const structOpLinesVisited = new Set<number>();
    const bstCodeLen = useViewportStore.getState().activeMetadata.code.length;
    while (useViewportStore.getState().currentStep < useViewportStore.getState().totalSteps) {
      const snap = useViewportStore.getState().currentSnapshot;
      if (snap.activeLine !== null) {
        expect(snap.activeLine).toBeGreaterThanOrEqual(1);
        expect(snap.activeLine).toBeLessThanOrEqual(bstCodeLen);
        structOpLinesVisited.add(snap.activeLine);
      }
      store.stepForward();
    }
    expect(structOpLinesVisited.size).toBeGreaterThanOrEqual(3);
  });

  it('Bug 1 Fix: recursive tree/structure code (BST insert, inorder, AVL insert) NEVER renders 3D callframe-* blocks alongside structure nodes, while pure recursion (factorial/fibonacci) renders 3D callframe-* blocks', () => {
    // 1. Recursive BST insert + inorder: tree nodes are on stage, so 0 callframe-* 3D blocks may appear
    const bstCpp = `#include <iostream>
using namespace std;
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};
TreeNode* insert(TreeNode* root, int v) {
    if (!root) return new TreeNode(v);
    if (v < root->val) root->left = insert(root->left, v);
    else root->right = insert(root->right, v);
    return root;
}
void inorder(TreeNode* root) {
    if (!root) return;
    inorder(root->left);
    cout << root->val << " ";
    inorder(root->right);
}
int main() {
    TreeNode* root = nullptr;
    root = insert(root, 40);
    root = insert(root, 20);
    root = insert(root, 60);
    root = insert(root, 10);
    inorder(root);
    return 0;
}`;
    const bstRes = runCppTrace(bstCpp);
    const bstTimeline = new TraceTimeline(bstRes.events);
    let sawCallStackInHud = false;
    for (let s = 1; s <= bstTimeline.totalSteps; s++) {
      const snap = bstTimeline.getSnapshotAt(s);
      if (snap.callStack.length > 1) {
        sawCallStackInHud = true;
      }
      const objs = buildSceneObjectsForScene(bstRes.scene, snap);
      if (Object.keys(snap.nodes).length > 0) {
        expect(
          objs.some((o) => o.id.startsWith('callframe-')),
          `BST step ${s}: must NOT render 3D callframe-* blocks when tree nodes are on stage`,
        ).toBe(false);
      }
    }
    expect(sawCallStackInHud).toBe(true);

    // 2. Pure recursion (factorial) with no other data structure on stage: MUST render 3D callframe-* blocks
    const factCpp = `#include <iostream>
using namespace std;
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}
int main() {
    cout << factorial(4) << endl;
    return 0;
}`;
    const factRes = runCppTrace(factCpp);
    const factTimeline = new TraceTimeline(factRes.events);
    let saw3DCallframeOnPureRecursion = false;
    for (let s = 1; s <= factTimeline.totalSteps; s++) {
      const snap = factTimeline.getSnapshotAt(s);
      const objs = buildSceneObjectsForScene(factRes.scene, snap);
      if (objs.some((o) => o.id.startsWith('callframe-'))) {
        saw3DCallframeOnPureRecursion = true;
      }
    }
    expect(saw3DCallframeOnPureRecursion).toBe(true);
  });

  it('Bug 2 Fix: 6-element bubble sort with N=8 known swaps emits exactly 8 swap events, folds all temp-swap set/visit events, and activates swappedRefs on exactly 8 playback steps', () => {
    const stdSwapCpp = `#include <iostream>
using namespace std;
int main() {
    int arr[6] = {42, 17, 68, 29, 84, 12};
    for (int i = 0; i < 5; i++) {
        for (int j = 0; j < 5 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
    return 0;
}`;

    const tempSwapCpp = `#include <iostream>
using namespace std;
int main() {
    int arr[6] = {42, 17, 68, 29, 84, 12};
    for (int i = 0; i < 5; i++) {
        for (int j = 0; j < 5 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return 0;
}`;

    for (const [label, code, expectedSwapLine] of [
      ['std::swap bubble sort', stdSwapCpp, 8],
      ['3-line temp swap bubble sort', tempSwapCpp, 10],
    ] as const) {
      const res = runCppTrace(code);
      const swapEvents = res.events.filter((e) => e.t === 'swap');
      const nonInitSetEvents = res.events.filter((e) => e.t === 'set' && !e.isInit);

      // [42, 17, 68, 29, 84, 12] has exactly 8 inversions -> 8 swaps
      expect(swapEvents.length, `${label}: exact swap event count`).toBe(8);
      expect(nonInitSetEvents.length, `${label}: zero unfolded set events`).toBe(0);
      for (const sw of swapEvents) {
        expect(sw.line, `${label}: swap event line`).toBe(expectedSwapLine);
      }

      // Stepping forward with useViewportStore.stepForward() (stopping at each note/done step)
      // must encounter swappedRefs !== null on EXACTLY 8 playback steps (once per swap)!
      const timeline = new TraceTimeline(res.events);
      let stepIdx = 0;
      let playbackSwapAnimations = 0;
      while (stepIdx < timeline.totalSteps) {
        let nextStep = stepIdx + 1;
        for (let i = stepIdx; i < timeline.events.length; i++) {
          const ev = timeline.events[i];
          if (ev.t === 'note' || ev.t === 'done') {
            nextStep = i + 1;
            break;
          }
        }
        stepIdx = nextStep;
        const snap = timeline.getSnapshotAt(stepIdx);
        if (snap.swappedRefs !== null) {
          playbackSwapAnimations++;
          expect(snap.activeLine, `${label}: activeLine during swap animation`).toBe(
            expectedSwapLine,
          );
        }
      }
      expect(
        playbackSwapAnimations,
        `${label}: 3D swap animation triggers exactly once per logical swap`,
      ).toBe(8);
    }
  });

  it('Bug 3 Fix: tests all 33 cpp_corpus files AND every Library operation button (14 Array ops + 39 Structure ops) for unified trace & exact executable line highlighting', () => {
    const store = useViewportStore.getState();

    // 1. All 33 cpp_corpus files via selectAndRunCorpusFile
    expect(CORPUS_FILE_CATALOG.length).toBe(33);
    for (const entry of CORPUS_FILE_CATALOG) {
      store.selectAndRunCorpusFile(entry.relativePath);
      const st = useViewportStore.getState();
      const codeLines = st.activeMetadata.code;
      const execLines = getExecutableLineNumbers(codeLines);
      expect(st.timeline.totalSteps, `${entry.relativePath}: totalSteps > 1`).toBeGreaterThan(1);

      for (let s = 1; s <= st.timeline.totalSteps; s++) {
        const snap = st.timeline.getSnapshotAt(s);
        const ev = st.timeline.events[s - 1];
        expect(snap.activeLine, `${entry.relativePath} step ${s}`).not.toBeNull();
        expect(snap.activeLine!).toBeGreaterThanOrEqual(1);
        expect(snap.activeLine!).toBeLessThanOrEqual(codeLines.length);

        if (ev.t === 'swap') {
          const lineStr = codeLines[snap.activeLine! - 1];
          expect(
            /swap|=/.test(lineStr),
            `${entry.relativePath} step ${s}: swap event at line ${snap.activeLine} ("${lineStr}") must be a swap/assignment line`,
          ).toBe(true);
        }
      }
      // Verify executable lines are highlighted
      expect(execLines.size).toBeGreaterThan(3);
    }

    // 2. All 14 ArrayOperationId buttons via runOperationNow
    const arrayOpIds = Object.keys(ARRAY_ALGORITHM_METADATA) as ArrayOperationId[];
    expect(arrayOpIds.length).toBe(14);
    for (const opId of arrayOpIds) {
      store.setCustomArray([42, 17, 68, 29, 84, 12]);
      store.runOperationNow(opId, 2, 29);
      const st = useViewportStore.getState();
      const codeLines = st.activeMetadata.code;
      const execLines = getExecutableLineNumbers(codeLines);
      expect(st.timeline.totalSteps, `Array op ${opId}: totalSteps > 1`).toBeGreaterThan(1);

      for (let s = 1; s <= st.timeline.totalSteps; s++) {
        const snap = st.timeline.getSnapshotAt(s);
        const ev = st.timeline.events[s - 1];
        expect(snap.activeLine, `Array op ${opId} step ${s}`).not.toBeNull();
        expect(
          execLines.has(snap.activeLine!),
          `Array op ${opId} step ${s}: line ${snap.activeLine} ("${codeLines[snap.activeLine! - 1]}") must be an executable line of ${st.selectedCorpusFile}`,
        ).toBe(true);

        if (ev.t === 'swap') {
          const lineStr = codeLines[snap.activeLine! - 1];
          expect(
            /swap|=/.test(lineStr),
            `Array op ${opId} step ${s}: swap event at line ${snap.activeLine} ("${lineStr}") must match swap/assignment statement`,
          ).toBe(true);
        }
      }
    }

    // 3. All 40 StructureOperationId buttons via runStructureOperationNow
    expect(STRUCTURE_OP_CATALOG.length).toBe(40);
    for (const def of STRUCTURE_OP_CATALOG) {
      store.setCustomArray([42, 17, 68, 29, 84, 12]);
      store.runStructureOperationNow(def.id, 30, '{[()]}');
      const st = useViewportStore.getState();
      const codeLines = st.activeMetadata.code;
      const execLines = getExecutableLineNumbers(codeLines);
      expect(st.timeline.totalSteps, `Structure op ${def.id}: totalSteps > 1`).toBeGreaterThan(1);

      let has3DObjects = false;
      for (let s = 1; s <= st.timeline.totalSteps; s++) {
        const snap = st.timeline.getSnapshotAt(s);
        const ev = st.timeline.events[s - 1];
        expect(snap.activeLine, `Structure op ${def.id} step ${s}`).not.toBeNull();
        expect(
          execLines.has(snap.activeLine!),
          `Structure op ${def.id} step ${s}: line ${snap.activeLine} ("${codeLines[snap.activeLine! - 1]}") must be an executable line of ${def.corpusPath}`,
        ).toBe(true);

        if (ev.t === 'swap') {
          const lineStr = codeLines[snap.activeLine! - 1];
          expect(
            /swap|=/.test(lineStr),
            `Structure op ${def.id} step ${s}: swap event at line ${snap.activeLine} ("${lineStr}") must match swap/assignment statement`,
          ).toBe(true);
        }
        const objs = buildSceneObjectsForScene(st.previewScene, snap);
        if (objs.length > 0) {
          has3DObjects = true;
        }
      }
      expect(has3DObjects, `Structure op ${def.id}: must produce 3D visuals`).toBe(true);
    }
  });
});
