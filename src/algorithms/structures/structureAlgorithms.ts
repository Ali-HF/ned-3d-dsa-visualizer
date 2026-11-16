import type { PreviewSceneKind, TraceEvent } from '../../types/trace';
import type { AlgorithmMetadata } from '../array/arrayAlgorithms';
import { getCorpusCodeLines } from '../../corpus/cppCorpusRegistry';

export type StructureOperationId =
  // Linked List (Weeks 2 & 3)
  | 'sll-insert-head'
  | 'sll-insert-tail'
  | 'sll-delete-val'
  | 'sll-search'
  | 'sll-reverse'
  | 'sll-find-middle'
  | 'dll-traversal'
  | 'cll-cycle'
  // Stack & Recursion (Week 4)
  | 'stack-push'
  | 'stack-pop'
  | 'stack-peek'
  | 'stack-brackets'
  | 'recursion-factorial'
  | 'recursion-hanoi'
  // Queue (Week 5)
  | 'queue-enqueue'
  | 'queue-dequeue'
  | 'circular-queue'
  // Deque (Week 5)
  | 'deque-push-front'
  | 'deque-push-rear'
  | 'deque-pop-front'
  | 'deque-pop-rear'
  | 'deque-ops'
  // Binary Tree & BST (Weeks 9 & 11)
  | 'bst-insert'
  | 'bst-search'
  | 'bst-delete'
  | 'tree-inorder'
  | 'tree-preorder'
  | 'tree-postorder'
  | 'tree-levelorder'
  // AVL Tree (Week 12)
  | 'avl-ll'
  | 'avl-rr'
  | 'avl-lr'
  | 'avl-rl'
  | 'avl-insert'
  | 'avl-rotation'
  // Binary Heap & Priority Queue (Week 10)
  | 'heap-insert'
  | 'heap-extract'
  | 'heap-build'
  | 'heap-sort'
  // Graph (Weeks 13 & 14)
  | 'graph-bfs'
  | 'graph-dfs'
  | 'graph-dijkstra'
  | 'graph-prim'
  | 'graph-kruskal'
  | 'graph-toposort'
  // Hash Table (Week 15)
  | 'hash-linear'
  | 'hash-quadratic'
  | 'hash-double'
  | 'hash-chaining';

export interface StructureOpDefinition {
  id: StructureOperationId;
  scene: Exclude<PreviewSceneKind, 'array'>;
  label: string;
  group: 'Sort' | 'Add' | 'Remove' | 'Find';
  corpusPath: string;
  timeComplexity: string;
  spaceComplexity: string;
  needsNumber?: boolean;
  numberLabel?: string;
  needsText?: boolean;
  textLabel?: string;
}

export const STRUCTURE_OP_CATALOG: StructureOpDefinition[] = [
  // ==========================================
  // LINKED LIST (Weeks 2 & 3)
  // ==========================================
  {
    id: 'sll-insert-head',
    scene: 'linked-list',
    label: 'Add at Front (Head)',
    group: 'Add',
    corpusPath: '02_singly_linked_list/singly_linked_list.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    needsNumber: true,
    numberLabel: 'Value',
  },
  {
    id: 'sll-insert-tail',
    scene: 'linked-list',
    label: 'Add at End (Tail)',
    group: 'Add',
    corpusPath: '02_singly_linked_list/singly_linked_list.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    needsNumber: true,
    numberLabel: 'Value',
  },
  {
    id: 'sll-delete-val',
    scene: 'linked-list',
    label: 'Remove a Node',
    group: 'Remove',
    corpusPath: '02_singly_linked_list/singly_linked_list.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    needsNumber: true,
    numberLabel: 'Value',
  },
  {
    id: 'sll-search',
    scene: 'linked-list',
    label: 'Find a Number',
    group: 'Find',
    corpusPath: '02_singly_linked_list/singly_linked_list.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    needsNumber: true,
    numberLabel: 'Target',
  },
  {
    id: 'sll-find-middle',
    scene: 'linked-list',
    label: 'Find Middle Node (Slow/Fast)',
    group: 'Find',
    corpusPath: '02_singly_linked_list/viva_middle_and_merge.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'cll-cycle',
    scene: 'linked-list',
    label: 'Detect Loop (Floyd Cycle)',
    group: 'Find',
    corpusPath: '03_doubly_circular_linked_list/floyd_cycle_detection.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'sll-reverse',
    scene: 'linked-list',
    label: 'Reverse List Links',
    group: 'Sort',
    corpusPath: '02_singly_linked_list/singly_linked_list.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'dll-traversal',
    scene: 'linked-list',
    label: 'Doubly List Forward & Back',
    group: 'Sort',
    corpusPath: '03_doubly_circular_linked_list/doubly_linked_list.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },

  // ==========================================
  // STACK & RECURSION (Week 4)
  // ==========================================
  {
    id: 'stack-push',
    scene: 'stack',
    label: 'Push Number on Top',
    group: 'Add',
    corpusPath: '04_recursion_and_stack/stack_array.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    needsNumber: true,
    numberLabel: 'Value',
  },
  {
    id: 'stack-pop',
    scene: 'stack',
    label: 'Pop Top Number',
    group: 'Remove',
    corpusPath: '04_recursion_and_stack/stack_linked_list.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'stack-peek',
    scene: 'stack',
    label: 'Peek at Top Number',
    group: 'Find',
    corpusPath: '04_recursion_and_stack/stack_array.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'stack-brackets',
    scene: 'stack',
    label: 'Check Balanced Brackets',
    group: 'Find',
    corpusPath: '04_recursion_and_stack/viva_stack_applications.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    needsText: true,
    textLabel: 'Expression',
  },
  {
    id: 'recursion-factorial',
    scene: 'stack',
    label: 'Recursive Factorial Call Stack',
    group: 'Sort',
    corpusPath: '04_recursion_and_stack/viva_stack_applications.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    needsNumber: true,
    numberLabel: 'N (1-6)',
  },
  {
    id: 'recursion-hanoi',
    scene: 'stack',
    label: 'Tower of Hanoi Recursion',
    group: 'Sort',
    corpusPath: '04_recursion_and_stack/viva_stack_applications.cpp',
    timeComplexity: 'O(2^n)',
    spaceComplexity: 'O(n)',
    needsText: true,
    textLabel: 'Disks',
  },

  // ==========================================
  // QUEUE & DEQUE (Week 5)
  // ==========================================
  {
    id: 'queue-enqueue',
    scene: 'queue',
    label: 'Enqueue at Back (Rear)',
    group: 'Add',
    corpusPath: '05_queues_and_deque/queue_array_and_circular.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    needsNumber: true,
    numberLabel: 'Value',
  },
  {
    id: 'queue-dequeue',
    scene: 'queue',
    label: 'Dequeue from Front',
    group: 'Remove',
    corpusPath: '05_queues_and_deque/queue_array_and_circular.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'circular-queue',
    scene: 'queue',
    label: 'Circular Queue Wrap-Around',
    group: 'Sort',
    corpusPath: '05_queues_and_deque/queue_array_and_circular.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
  },
  // ==========================================
  // DEQUE (Week 5)
  // ==========================================
  {
    id: 'deque-push-front',
    scene: 'deque',
    label: 'Insert at Front',
    group: 'Add',
    corpusPath: '05_queues_and_deque/deque.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    needsNumber: true,
    numberLabel: 'Value',
  },
  {
    id: 'deque-push-rear',
    scene: 'deque',
    label: 'Insert at Rear',
    group: 'Add',
    corpusPath: '05_queues_and_deque/deque.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    needsNumber: true,
    numberLabel: 'Value',
  },
  {
    id: 'deque-pop-front',
    scene: 'deque',
    label: 'Delete from Front',
    group: 'Remove',
    corpusPath: '05_queues_and_deque/deque.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'deque-pop-rear',
    scene: 'deque',
    label: 'Delete from Rear',
    group: 'Remove',
    corpusPath: '05_queues_and_deque/deque.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'deque-ops',
    scene: 'deque',
    label: 'Deque Add Both Ends Demo',
    group: 'Add',
    corpusPath: '05_queues_and_deque/deque.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
  },

  // ==========================================
  // BINARY TREE, BST & AVL (Weeks 9, 11, 12)
  // ==========================================
  {
    id: 'bst-insert',
    scene: 'bst',
    label: 'Insert a Number into BST',
    group: 'Add',
    corpusPath: '11_binary_search_tree/binary_search_tree.cpp',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(h)',
    needsNumber: true,
    numberLabel: 'Value',
  },
  {
    id: 'bst-search',
    scene: 'bst',
    label: 'Find a Number in BST',
    group: 'Find',
    corpusPath: '11_binary_search_tree/binary_search_tree.cpp',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(h)',
    needsNumber: true,
    numberLabel: 'Target',
  },
  {
    id: 'bst-delete',
    scene: 'bst',
    label: 'Remove a Node from BST',
    group: 'Remove',
    corpusPath: '11_binary_search_tree/binary_search_tree.cpp',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(h)',
    needsNumber: true,
    numberLabel: 'Value',
  },
  {
    id: 'tree-inorder',
    scene: 'bst',
    label: 'Inorder Walk (Sorted Order)',
    group: 'Sort',
    corpusPath: '09_binary_tree/binary_tree_traversals.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
  },
  {
    id: 'tree-preorder',
    scene: 'bst',
    label: 'Preorder Walk (Root First)',
    group: 'Sort',
    corpusPath: '09_binary_tree/binary_tree_traversals.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
  },
  {
    id: 'tree-postorder',
    scene: 'bst',
    label: 'Postorder Walk (Leaves First)',
    group: 'Sort',
    corpusPath: '09_binary_tree/binary_tree_traversals.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
  },
  {
    id: 'tree-levelorder',
    scene: 'bst',
    label: 'Level-by-Level Walk (BFS)',
    group: 'Find',
    corpusPath: '09_binary_tree/binary_tree_traversals.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  // ==========================================
  // AVL TREE (Week 12)
  // ==========================================
  {
    id: 'avl-ll',
    scene: 'avl',
    label: 'LL Rotation (Right Rotate)',
    group: 'Sort',
    corpusPath: '12_avl_tree/avl_tree.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'avl-rr',
    scene: 'avl',
    label: 'RR Rotation (Left Rotate)',
    group: 'Sort',
    corpusPath: '12_avl_tree/avl_tree.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'avl-lr',
    scene: 'avl',
    label: 'LR Rotation (Left-Right)',
    group: 'Sort',
    corpusPath: '12_avl_tree/avl_tree.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'avl-rl',
    scene: 'avl',
    label: 'RL Rotation (Right-Left)',
    group: 'Sort',
    corpusPath: '12_avl_tree/avl_tree.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'avl-insert',
    scene: 'avl',
    label: 'Insert & Auto-Balance',
    group: 'Add',
    corpusPath: '12_avl_tree/avl_tree.cpp',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(h)',
    needsNumber: true,
    numberLabel: 'Value',
  },
  {
    id: 'avl-rotation',
    scene: 'avl',
    label: 'Auto-Rebalance (Dataset)',
    group: 'Add',
    corpusPath: '12_avl_tree/avl_tree.cpp',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(h)',
  },

  // ==========================================
  // BINARY HEAP & PRIORITY QUEUE (Week 10)
  // ==========================================
  {
    id: 'heap-insert',
    scene: 'heap',
    label: 'Insert & Bubble Up (siftUp)',
    group: 'Add',
    corpusPath: '10_heap_and_priority_queue/max_heap.cpp',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    needsNumber: true,
    numberLabel: 'Value',
  },
  {
    id: 'heap-extract',
    scene: 'heap',
    label: 'Extract Max & Bubble Down',
    group: 'Remove',
    corpusPath: '10_heap_and_priority_queue/max_heap.cpp',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'heap-build',
    scene: 'heap',
    label: 'Build Max-Heap in O(n)',
    group: 'Sort',
    corpusPath: '10_heap_and_priority_queue/max_heap.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'heap-sort',
    scene: 'heap',
    label: 'Heap Sort (Extract Max Loop)',
    group: 'Sort',
    corpusPath: '10_heap_and_priority_queue/heap_sort.cpp',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(1)',
  },

  // ==========================================
  // GRAPH (Weeks 13 & 14)
  // ==========================================
  {
    id: 'graph-bfs',
    scene: 'graph',
    label: 'Breadth-First Search (BFS)',
    group: 'Find',
    corpusPath: '13_graph_traversal/bfs_dfs_traversal.cpp',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
  },
  {
    id: 'graph-dfs',
    scene: 'graph',
    label: 'Depth-First Search (DFS)',
    group: 'Find',
    corpusPath: '13_graph_traversal/bfs_dfs_traversal.cpp',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
  },
  {
    id: 'graph-dijkstra',
    scene: 'graph',
    label: "Dijkstra's Shortest Path",
    group: 'Find',
    corpusPath: '14_graph_mst_toposort/dijkstra.cpp',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
  },
  {
    id: 'graph-prim',
    scene: 'graph',
    label: "Prim's Minimum Spanning Tree",
    group: 'Sort',
    corpusPath: '14_graph_mst_toposort/kruskal_mst.cpp',
    timeComplexity: 'O(E log V)',
    spaceComplexity: 'O(V)',
  },
  {
    id: 'graph-kruskal',
    scene: 'graph',
    label: "Kruskal's Minimum Spanning Tree",
    group: 'Sort',
    corpusPath: '14_graph_mst_toposort/kruskal_mst.cpp',
    timeComplexity: 'O(E log E)',
    spaceComplexity: 'O(V)',
  },
  {
    id: 'graph-toposort',
    scene: 'graph',
    label: 'Topological Sort (Dependency Order)',
    group: 'Sort',
    corpusPath: '14_graph_mst_toposort/topological_sort.cpp',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
  },

  // ==========================================
  // HASH TABLE (Week 15)
  // ==========================================
  {
    id: 'hash-linear',
    scene: 'hash-table',
    label: 'Linear Probing (Step +1 on Collision)',
    group: 'Add',
    corpusPath: '15_hashing/linear_probing.cpp',
    timeComplexity: 'O(1) avg',
    spaceComplexity: 'O(m)',
    needsNumber: true,
    numberLabel: 'Key',
  },
  {
    id: 'hash-quadratic',
    scene: 'hash-table',
    label: 'Quadratic Probing (+1², +2², +3²)',
    group: 'Add',
    corpusPath: '15_hashing/linear_probing.cpp',
    timeComplexity: 'O(1) avg',
    spaceComplexity: 'O(m)',
    needsNumber: true,
    numberLabel: 'Key',
  },
  {
    id: 'hash-double',
    scene: 'hash-table',
    label: 'Double Hashing (Second Hash Step)',
    group: 'Add',
    corpusPath: '15_hashing/linear_probing.cpp',
    timeComplexity: 'O(1) avg',
    spaceComplexity: 'O(m)',
    needsNumber: true,
    numberLabel: 'Key',
  },
  {
    id: 'hash-chaining',
    scene: 'hash-table',
    label: 'Separate Chaining (Bucket Chains)',
    group: 'Add',
    corpusPath: '15_hashing/separate_chaining.cpp',
    timeComplexity: 'O(1 + α)',
    spaceComplexity: 'O(n + m)',
    needsNumber: true,
    numberLabel: 'Key',
  },
];

function getLinkedListNodeIds(count: number): string[] {
  if (count <= 0) return [];
  if (count === 1) return ['node-head'];
  return [
    'node-head',
    ...Array.from({ length: count - 2 }, (_, idx) => `node-${idx + 2}`),
    'node-tail',
  ];
}

function emitBaseLinkedList(events: TraceEvent[], customValues?: number[]) {
  const vals =
    customValues && customValues.length >= 1
      ? customValues.slice(0, 24)
      : [10, 25, 40, 55];
  const nodeIds = getLinkedListNodeIds(vals.length);
  for (let i = 0; i < vals.length; i++) {
    events.push({ t: 'create', id: nodeIds[i], kind: 'node', value: vals[i] });
  }
  for (let i = 0; i < nodeIds.length - 1; i++) {
    events.push({ t: 'link', from: nodeIds[i], to: nodeIds[i + 1], label: 'next' });
  }
  return vals;
}

function emitBaseStack(
  events: TraceEvent[],
  customValues?: number[],
  fallback: number[] = [15, 30, 45],
) {
  const vals =
    customValues && customValues.length >= 1
      ? customValues.slice(0, 24)
      : fallback;
  for (let i = 0; i < vals.length; i++) {
    events.push({ t: 'create', id: `stk-${i}`, kind: 'node', value: vals[i] });
    if (i > 0) {
      events.push({ t: 'link', from: `stk-${i}`, to: `stk-${i - 1}`, label: 'below' });
    }
  }
  return vals;
}

interface BstNodeInfo {
  id: string;
  val: number;
  left?: string;
  right?: string;
  parent?: string;
  side?: 'left' | 'right';
}

const BST_SLOT_TO_ID: Record<number, string> = {
  1: 'bst-50',
  2: 'bst-30',
  3: 'bst-70',
  4: 'bst-20',
  5: 'bst-40',
  6: 'bst-60',
  7: 'bst-85',
};

function emitBaseBst(
  events: TraceEvent[],
  customValues?: number[],
): {
  rootId: string;
  nodes: Record<string, BstNodeInfo>;
  sorted: number[];
} {
  const raw =
    customValues && customValues.length >= 1
      ? customValues.slice(0, 24)
      : [20, 30, 40, 50, 60, 70, 85];
  const sorted = [...raw].sort((a, b) => a - b);
  const nodes: Record<string, BstNodeInfo> = {};

  const build = (
    lo: number,
    hi: number,
    slot: number,
    parent?: string,
    side?: 'left' | 'right',
  ): string | undefined => {
    if (lo > hi) return undefined;
    let mid = Math.floor((lo + hi) / 2);
    // Keep equal values in the right subtree so val < node.val ? left : right always holds
    while (mid > lo && sorted[mid - 1] === sorted[mid]) {
      mid--;
    }
    const id = BST_SLOT_TO_ID[slot] ?? `bst-n${slot}`;
    const node: BstNodeInfo = {
      id,
      val: sorted[mid],
      parent,
      side,
    };
    nodes[id] = node;
    events.push({ t: 'create', id, kind: 'node', value: node.val });
    if (parent && side) {
      events.push({ t: 'link', from: parent, to: id, label: side });
    }
    node.left = build(lo, mid - 1, slot * 2, id, 'left');
    node.right = build(mid + 1, hi, slot * 2 + 1, id, 'right');
    return id;
  };

  const rootId = build(0, sorted.length - 1, 1)!;
  return { rootId, nodes, sorted };
}

function heapId(idx: number): string {
  return `heap-${idx}`;
}

function buildMaxHeapArray(values: number[]): number[] {
  const arr = [...values];
  const n = arr.length;
  for (let start = Math.floor(n / 2) - 1; start >= 0; start--) {
    let idx = start;
    while (true) {
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      let largest = idx;
      if (left < n && arr[left] > arr[largest]) largest = left;
      if (right < n && arr[right] > arr[largest]) largest = right;
      if (largest === idx) break;
      const tmp = arr[idx];
      arr[idx] = arr[largest];
      arr[largest] = tmp;
      idx = largest;
    }
  }
  return arr;
}

function emitCompleteBinaryTree(events: TraceEvent[], values: number[]): void {
  for (let i = 0; i < values.length; i++) {
    events.push({ t: 'create', id: heapId(i), kind: 'node', value: values[i] });
  }
  for (let i = 1; i < values.length; i++) {
    const parent = Math.floor((i - 1) / 2);
    events.push({
      t: 'link',
      from: heapId(parent),
      to: heapId(i),
      label: i % 2 === 1 ? 'left' : 'right',
    });
  }
}

function emitSiftDown(
  events: TraceEvent[],
  arr: number[],
  startIdx: number,
  heapSize: number,
): void {
  let idx = startIdx;
  while (true) {
    const left = 2 * idx + 1;
    const right = 2 * idx + 2;
    if (left >= heapSize) break;

    let largestChild = left;
    if (right < heapSize) {
      events.push({
        t: 'compare',
        a: { id: heapId(left) },
        b: { id: heapId(right) },
      });
      if (arr[right] > arr[left]) {
        largestChild = right;
      }
    }

    events.push(
      { t: 'compare', a: { id: heapId(idx) }, b: { id: heapId(largestChild) } },
      {
        t: 'note',
        text: `Bubble Down (siftDown): comparing ${arr[idx]} with larger child ${arr[largestChild]}.`,
      },
    );

    if (arr[largestChild] > arr[idx]) {
      events.push(
        { t: 'visit', id: heapId(idx) },
        { t: 'swap', a: { id: heapId(idx) }, b: { id: heapId(largestChild) } },
        {
          t: 'note',
          text: `${arr[largestChild]} > ${arr[idx]}, so they swap places!`,
        },
      );
      const tmp = arr[idx];
      arr[idx] = arr[largestChild];
      arr[largestChild] = tmp;
      idx = largestChild;
    } else {
      events.push(
        { t: 'visit', id: heapId(idx) },
        {
          t: 'note',
          text: `${arr[idx]} ≥ children, so Max-Heap property holds at index ${idx}.`,
        },
      );
      break;
    }
  }
}

function emitBaseGraph(events: TraceEvent[]) {
  events.push(
    { t: 'create', id: 'v-0', kind: 'node', value: 0 },
    { t: 'create', id: 'v-1', kind: 'node', value: 1 },
    { t: 'create', id: 'v-2', kind: 'node', value: 2 },
    { t: 'create', id: 'v-3', kind: 'node', value: 3 },
    { t: 'create', id: 'v-4', kind: 'node', value: 4 },
    { t: 'create', id: 'v-5', kind: 'node', value: 5 },
    { t: 'link', from: 'v-0', to: 'v-1', label: '4' },
    { t: 'link', from: 'v-0', to: 'v-2', label: '2' },
    { t: 'link', from: 'v-1', to: 'v-3', label: '5' },
    { t: 'link', from: 'v-2', to: 'v-1', label: '1' },
    { t: 'link', from: 'v-2', to: 'v-4', label: '8' },
    { t: 'link', from: 'v-3', to: 'v-5', label: '2' },
    { t: 'link', from: 'v-4', to: 'v-3', label: '3' },
    { t: 'link', from: 'v-4', to: 'v-5', label: '6' },
  );
}

const STRUCTURE_LABELS: Record<Exclude<PreviewSceneKind, 'array'>, { title: string; defaultCorpus: string }> = {
  'linked-list': {
    title: 'Linked List (Select an Operation)',
    defaultCorpus: '02_singly_linked_list/singly_linked_list.cpp',
  },
  stack: {
    title: 'Stack (Select an Operation)',
    defaultCorpus: '04_recursion_and_stack/stack_array.cpp',
  },
  queue: {
    title: 'Queue (Select an Operation)',
    defaultCorpus: '05_queues_and_deque/queue_array_and_circular.cpp',
  },
  deque: {
    title: 'Deque (Select an Operation)',
    defaultCorpus: '05_queues_and_deque/deque.cpp',
  },
  bst: {
    title: 'Binary Search Tree (Select an Operation)',
    defaultCorpus: '11_binary_search_tree/binary_search_tree.cpp',
  },
  avl: {
    title: 'AVL Tree (Select an Operation)',
    defaultCorpus: '12_avl_tree/avl_tree.cpp',
  },
  heap: {
    title: 'Binary Max-Heap (Select an Operation)',
    defaultCorpus: '10_heap_and_priority_queue/max_heap.cpp',
  },
  graph: {
    title: 'Graph (Select an Operation)',
    defaultCorpus: '13_graph_traversal/bfs_dfs_traversal.cpp',
  },
  'hash-table': {
    title: 'Hash Table (Select an Operation)',
    defaultCorpus: '15_hashing/linear_probing.cpp',
  },
};

export function buildStaticStructureTrace(
  scene: Exclude<PreviewSceneKind, 'array'>,
  customValues?: number[],
): {
  events: TraceEvent[];
  meta: AlgorithmMetadata;
  scene: Exclude<PreviewSceneKind, 'array'>;
} {
  const info = STRUCTURE_LABELS[scene];
  const codeLines = getCorpusCodeLines(info.defaultCorpus, [
    '// Loaded from cpp_corpus/' + info.defaultCorpus,
  ]);
  const meta: AlgorithmMetadata = {
    id: 'bubble-sort',
    title: info.title,
    category: 'operation',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(n)',
    code: codeLines,
  };
  const events: TraceEvent[] = [];

  switch (scene) {
    case 'linked-list': {
      const vals = emitBaseLinkedList(events, customValues);
      events.push(
        { t: 'note', text: `Loaded Linked List: ${vals.join(' → ')}.` },
        { t: 'note', text: 'Select an operation, configure Value if needed, then click Run.' },
        { t: 'done' },
      );
      break;
    }
    case 'stack': {
      const stkVals = emitBaseStack(events, customValues, [15, 30, 45]);
      events.push(
        {
          t: 'note',
          text: `Loaded Stack: [${stkVals.join(', ')}] (top is ${stkVals[stkVals.length - 1]}).`,
        },
        { t: 'note', text: 'Select an operation, set Value if needed, then click Run.' },
        { t: 'done' },
      );
      break;
    }
    case 'queue': {
      const qVals =
        customValues && customValues.length >= 1
          ? customValues.slice(0, 24)
          : [10, 20, 30];
      for (let i = 0; i < qVals.length; i++) {
        events.push({ t: 'create', id: `q-${i}`, kind: 'node', value: qVals[i] });
        if (i > 0) {
          events.push({ t: 'link', from: `q-${i - 1}`, to: `q-${i}`, label: 'next' });
        }
      }
      events.push(
        { t: 'note', text: `Loaded Queue: ${qVals.join(' → ')} (front is ${qVals[0]}).` },
        { t: 'note', text: 'Select an operation, set Value if needed, then click Run.' },
        { t: 'done' },
      );
      break;
    }
    case 'deque': {
      const dqVals = emitBaseDeque(events, customValues);
      events.push(
        {
          t: 'note',
          text: `Loaded Deque: ${dqVals.join(' ⇄ ')} (front ${dqVals[0]}, rear ${dqVals[dqVals.length - 1]}).`,
        },
        { t: 'note', text: 'Select a front/rear operation, set Value if needed, then click Run.' },
        { t: 'done' },
      );
      break;
    }
    case 'bst': {
      const { rootId, nodes, sorted } = emitBaseBst(events, customValues);
      events.push(
        {
          t: 'note',
          text: `Loaded Binary Search Tree with root ${nodes[rootId].val} (${sorted.join(', ')}).`,
        },
        { t: 'note', text: 'Select an operation, set Value/Target if needed, then click Run.' },
        { t: 'done' },
      );
      break;
    }
    case 'avl': {
      const { rootId, nodes, sorted } = emitBaseBst(events, customValues);
      events.push(
        {
          t: 'note',
          text: `Loaded Self-Balancing AVL Tree with root ${nodes[rootId].val} (${sorted.join(', ')}, |BF| ≤ 1).`,
        },
        { t: 'note', text: 'Pick an LL, RR, LR, RL rotation or Insert & Auto-Balance, then click Run.' },
        { t: 'done' },
      );
      break;
    }
    case 'heap': {
      const base =
        customValues && customValues.length >= 1
          ? customValues.slice(0, 24)
          : [90, 70, 80, 40, 50];
      const heapVals = buildMaxHeapArray(base);
      emitCompleteBinaryTree(events, heapVals);
      events.push(
        {
          t: 'note',
          text: `Loaded Max-Heap with root max ${heapVals[0]} (${heapVals.join(', ')}).`,
        },
        { t: 'note', text: 'Select an operation, set Value if needed, then click Run.' },
        { t: 'done' },
      );
      break;
    }
    case 'graph': {
      emitBaseGraph(events);
      events.push(
        { t: 'note', text: 'Loaded weighted directed Graph with 6 vertices (0..5).' },
        { t: 'note', text: 'Select a traversal or MST algorithm above and click Run.' },
        { t: 'done' },
      );
      break;
    }
    case 'hash-table': {
      const buckets = [null, 15, 22, null, 18, null, null];
      events.push({ t: 'create', id: 'arr', kind: 'array', value: 7 });
      buckets.forEach((v, idx) => {
        events.push({ t: 'set', target: { id: 'arr', index: idx }, value: v ?? 0 });
      });
      events.push(
        { t: 'note', text: 'Loaded 7-bucket Hash Table (occupied indices: 1→15, 2→22, 4→18).' },
        { t: 'note', text: 'Select a probing/chaining method, set Key, then click Run.' },
        { t: 'done' },
      );
      break;
    }
  }

  return { events, meta, scene };
}

function emitBaseDeque(
  events: TraceEvent[],
  customValues?: number[],
  fallback: number[] = [10, 20, 30, 40],
): number[] {
  const dqVals =
    customValues && customValues.length >= 1
      ? customValues.slice(0, 22)
      : fallback;
  for (let i = 0; i < dqVals.length; i++) {
    events.push({ t: 'create', id: `dq-${i + 1}`, kind: 'node', value: dqVals[i] });
    if (i > 0) {
      events.push({ t: 'link', from: `dq-${i}`, to: `dq-${i + 1}`, label: 'next' });
    }
  }
  return dqVals;
}

type AvlRotationKind = 'LL' | 'RR' | 'LR' | 'RL';

function pickThreeDistinctSorted(customValues?: number[]): [number, number, number] {
  const distinct: number[] = [];
  if (customValues) {
    for (const n of customValues) {
      if (!distinct.includes(n)) distinct.push(n);
      if (distinct.length === 3) break;
    }
  }
  const triple = distinct.length === 3 ? distinct : [10, 20, 30];
  const sorted = [...triple].sort((a, b) => a - b);
  return [sorted[0], sorted[1], sorted[2]];
}

function emitAvlRotationCase(
  events: TraceEvent[],
  kind: AvlRotationKind,
  minV: number,
  midV: number,
  maxV: number,
  customIntro?: string,
): void {
  if (kind === 'LL') {
    events.push(
      { t: 'create', id: 'bst-50', kind: 'node', value: maxV },
      { t: 'create', id: 'bst-30', kind: 'node', value: midV },
      { t: 'create', id: 'bst-20', kind: 'node', value: minV },
      { t: 'link', from: 'bst-50', to: 'bst-30', label: 'left' },
      { t: 'link', from: 'bst-30', to: 'bst-20', label: 'left' },
      {
        t: 'note',
        text:
          customIntro ??
          `LL Case: inserted ${maxV} → ${midV} → ${minV}, leaning heavily left (balance factor = +2).`,
      },
      { t: 'compare', a: { id: 'bst-50' }, b: { id: 'bst-30' } },
      {
        t: 'note',
        text: `Performing Single Right Rotation (LL) around ${maxV} so ${midV} rises up to become the balanced root!`,
      },
      { t: 'set', target: { id: 'bst-50' }, value: midV },
      { t: 'set', target: { id: 'bst-30' }, value: minV },
      { t: 'unlink', from: 'bst-30', to: 'bst-20' },
      { t: 'remove', id: 'bst-20' },
      { t: 'create', id: 'bst-70', kind: 'node', value: maxV },
      { t: 'link', from: 'bst-50', to: 'bst-70', label: 'right' },
      { t: 'visit', id: 'bst-50' },
      {
        t: 'note',
        text: `AVL Right Rotation complete (LL)! Root is now ${midV} with left child ${minV} and right child ${maxV} (height balanced).`,
      },
      { t: 'done' },
    );
    return;
  }

  if (kind === 'RR') {
    events.push(
      { t: 'create', id: 'bst-50', kind: 'node', value: minV },
      { t: 'create', id: 'bst-70', kind: 'node', value: midV },
      { t: 'create', id: 'bst-85', kind: 'node', value: maxV },
      { t: 'link', from: 'bst-50', to: 'bst-70', label: 'right' },
      { t: 'link', from: 'bst-70', to: 'bst-85', label: 'right' },
      {
        t: 'note',
        text:
          customIntro ??
          `RR Case: inserted ${minV} → ${midV} → ${maxV}, leaning heavily right (balance factor = -2).`,
      },
      { t: 'compare', a: { id: 'bst-50' }, b: { id: 'bst-70' } },
      {
        t: 'note',
        text: `Performing Single Left Rotation (RR) around ${minV} so ${midV} rises up to become the balanced root!`,
      },
      { t: 'set', target: { id: 'bst-50' }, value: midV },
      { t: 'set', target: { id: 'bst-70' }, value: maxV },
      { t: 'unlink', from: 'bst-70', to: 'bst-85' },
      { t: 'remove', id: 'bst-85' },
      { t: 'create', id: 'bst-30', kind: 'node', value: minV },
      { t: 'link', from: 'bst-50', to: 'bst-30', label: 'left' },
      { t: 'visit', id: 'bst-50' },
      {
        t: 'note',
        text: `AVL Left Rotation complete (RR)! Root is now ${midV} with left child ${minV} and right child ${maxV} (height balanced).`,
      },
      { t: 'done' },
    );
    return;
  }

  if (kind === 'LR') {
    events.push(
      { t: 'create', id: 'bst-50', kind: 'node', value: maxV },
      { t: 'create', id: 'bst-30', kind: 'node', value: minV },
      { t: 'create', id: 'bst-40', kind: 'node', value: midV },
      { t: 'link', from: 'bst-50', to: 'bst-30', label: 'left' },
      { t: 'link', from: 'bst-30', to: 'bst-40', label: 'right' },
      {
        t: 'note',
        text:
          customIntro ??
          `LR Case: inserted ${maxV} → ${minV} → ${midV}; Left-Right zig-zag imbalance at ${maxV} (balance factor = +2).`,
      },
      { t: 'compare', a: { id: 'bst-30' }, b: { id: 'bst-40' } },
      { t: 'set', target: { id: 'bst-30' }, value: midV },
      { t: 'unlink', from: 'bst-30', to: 'bst-40' },
      { t: 'remove', id: 'bst-40' },
      { t: 'create', id: 'bst-20', kind: 'node', value: minV },
      { t: 'link', from: 'bst-30', to: 'bst-20', label: 'left' },
      {
        t: 'note',
        text: `LR Step 1: Left Rotation around ${minV} converts Left-Right into an LL line (${maxV} → ${midV} → ${minV}).`,
      },
      { t: 'set', target: { id: 'bst-50' }, value: midV },
      { t: 'set', target: { id: 'bst-30' }, value: minV },
      { t: 'unlink', from: 'bst-30', to: 'bst-20' },
      { t: 'remove', id: 'bst-20' },
      { t: 'create', id: 'bst-70', kind: 'node', value: maxV },
      { t: 'link', from: 'bst-50', to: 'bst-70', label: 'right' },
      { t: 'visit', id: 'bst-50' },
      {
        t: 'note',
        text: `LR Step 2 (Right Rotate around ${maxV}) complete! Root is now ${midV} with left ${minV} and right ${maxV}.`,
      },
      { t: 'done' },
    );
    return;
  }

  // RL case
  events.push(
    { t: 'create', id: 'bst-50', kind: 'node', value: minV },
    { t: 'create', id: 'bst-70', kind: 'node', value: maxV },
    { t: 'create', id: 'bst-60', kind: 'node', value: midV },
    { t: 'link', from: 'bst-50', to: 'bst-70', label: 'right' },
    { t: 'link', from: 'bst-70', to: 'bst-60', label: 'left' },
    {
      t: 'note',
      text:
        customIntro ??
        `RL Case: inserted ${minV} → ${maxV} → ${midV}; Right-Left zig-zag imbalance at ${minV} (balance factor = -2).`,
    },
    { t: 'compare', a: { id: 'bst-70' }, b: { id: 'bst-60' } },
    { t: 'set', target: { id: 'bst-70' }, value: midV },
    { t: 'unlink', from: 'bst-70', to: 'bst-60' },
    { t: 'remove', id: 'bst-60' },
    { t: 'create', id: 'bst-85', kind: 'node', value: maxV },
    { t: 'link', from: 'bst-70', to: 'bst-85', label: 'right' },
    {
      t: 'note',
      text: `RL Step 1: Right Rotation around ${maxV} converts Right-Left into an RR line (${minV} → ${midV} → ${maxV}).`,
    },
    { t: 'set', target: { id: 'bst-50' }, value: midV },
    { t: 'set', target: { id: 'bst-70' }, value: maxV },
    { t: 'unlink', from: 'bst-70', to: 'bst-85' },
    { t: 'remove', id: 'bst-85' },
    { t: 'create', id: 'bst-30', kind: 'node', value: minV },
    { t: 'link', from: 'bst-50', to: 'bst-30', label: 'left' },
    { t: 'visit', id: 'bst-50' },
    {
      t: 'note',
      text: `RL Step 2 (Left Rotate around ${minV}) complete! Root is now ${midV} with left ${minV} and right ${maxV}.`,
    },
    { t: 'done' },
  );
}

interface AvlSimNode {
  id: string;
  val: number;
  left?: AvlSimNode;
  right?: AvlSimNode;
  height: number;
}

function avlHeight(n?: AvlSimNode): number {
  return n ? n.height : 0;
}

function avlUpdateHeight(n: AvlSimNode): void {
  n.height = 1 + Math.max(avlHeight(n.left), avlHeight(n.right));
}

function avlBalanceFactor(n?: AvlSimNode): number {
  return n ? avlHeight(n.left) - avlHeight(n.right) : 0;
}

function avlRotateRightSim(y: AvlSimNode, events?: TraceEvent[]): AvlSimNode {
  const x = y.left!;
  const t2 = x.right;
  if (events) {
    events.push({ t: 'unlink', from: y.id, to: x.id });
    if (t2) events.push({ t: 'unlink', from: x.id, to: t2.id });
  }
  x.right = y;
  y.left = t2;
  avlUpdateHeight(y);
  avlUpdateHeight(x);
  if (events) {
    events.push({ t: 'link', from: x.id, to: y.id, label: 'right' });
    if (t2) events.push({ t: 'link', from: y.id, to: t2.id, label: 'left' });
  }
  return x;
}

function avlRotateLeftSim(x: AvlSimNode, events?: TraceEvent[]): AvlSimNode {
  const y = x.right!;
  const t2 = y.left;
  if (events) {
    events.push({ t: 'unlink', from: x.id, to: y.id });
    if (t2) events.push({ t: 'unlink', from: y.id, to: t2.id });
  }
  y.left = x;
  x.right = t2;
  avlUpdateHeight(x);
  avlUpdateHeight(y);
  if (events) {
    events.push({ t: 'link', from: y.id, to: x.id, label: 'left' });
    if (t2) events.push({ t: 'link', from: x.id, to: t2.id, label: 'right' });
  }
  return y;
}

function avlInsertSilent(node: AvlSimNode | undefined, val: number, id: string): AvlSimNode {
  if (!node) return { id, val, height: 1 };
  if (val < node.val) node.left = avlInsertSilent(node.left, val, id);
  else if (val > node.val) node.right = avlInsertSilent(node.right, val, id);
  else return node;
  avlUpdateHeight(node);
  const bf = avlBalanceFactor(node);
  if (bf > 1 && val < node.left!.val) return avlRotateRightSim(node);
  if (bf < -1 && val > node.right!.val) return avlRotateLeftSim(node);
  if (bf > 1 && val > node.left!.val) {
    node.left = avlRotateLeftSim(node.left!);
    return avlRotateRightSim(node);
  }
  if (bf < -1 && val < node.right!.val) {
    node.right = avlRotateRightSim(node.right!);
    return avlRotateLeftSim(node);
  }
  return node;
}

function runAvlInsertTrace(
  events: TraceEvent[],
  customValues: number[] | undefined,
  insertVal: number,
): number[] {
  const rawBase =
    customValues && customValues.length >= 1
      ? customValues.slice(0, 23)
      : [30, 20, 40, 10];
  const uniqueBase: number[] = [];
  for (const v of rawBase) {
    if (!uniqueBase.includes(v)) uniqueBase.push(v);
  }

  let root: AvlSimNode | undefined;
  uniqueBase.forEach((v, idx) => {
    root = avlInsertSilent(root, v, `avl-${idx + 1}`);
  });

  // Emit initial balanced AVL tree in BFS order
  const initQueue: AvlSimNode[] = root ? [root] : [];
  while (initQueue.length > 0) {
    const cur = initQueue.shift()!;
    events.push({ t: 'create', id: cur.id, kind: 'node', value: cur.val });
    if (cur.left) {
      events.push({ t: 'link', from: cur.id, to: cur.left.id, label: 'left' });
      initQueue.push(cur.left);
    }
    if (cur.right) {
      events.push({ t: 'link', from: cur.id, to: cur.right.id, label: 'right' });
      initQueue.push(cur.right);
    }
  }

  if (!root) {
    events.push(
      { t: 'create', id: 'bst-new', kind: 'node', value: insertVal },
      { t: 'visit', id: 'bst-new' },
      { t: 'note', text: `Inserted ${insertVal} as the AVL root (BF = 0).` },
      { t: 'done' },
    );
    return [insertVal];
  }

  events.push({
    t: 'note',
    text: `AVL Insert ${insertVal}: descending from root ${root.val} to find insertion spot.`,
  });

  // Descend and record ancestor path
  const path: { node: AvlSimNode; dir: 'left' | 'right' }[] = [];
  let cur: AvlSimNode | undefined = root;
  let duplicate = false;
  while (cur) {
    events.push({ t: 'visit', id: cur.id });
    if (insertVal === cur.val) {
      duplicate = true;
      events.push({
        t: 'note',
        text: `${insertVal} is already in the AVL tree — duplicate keys are ignored.`,
      });
      break;
    }
    const dir: 'left' | 'right' = insertVal < cur.val ? 'left' : 'right';
    const nextNode: AvlSimNode | undefined = dir === 'left' ? cur.left : cur.right;
    path.push({ node: cur, dir });
    if (nextNode) {
      events.push({
        t: 'note',
        text: `${insertVal} ${dir === 'left' ? '<' : '>'} ${cur.val}: moving ${dir.toUpperCase()} to ${nextNode.val}.`,
      });
      cur = nextNode;
    } else {
      const newNode: AvlSimNode = { id: 'bst-new', val: insertVal, height: 1 };
      if (dir === 'left') cur.left = newNode;
      else cur.right = newNode;
      events.push(
        { t: 'create', id: 'bst-new', kind: 'node', value: insertVal },
        { t: 'link', from: cur.id, to: 'bst-new', label: dir },
        { t: 'visit', id: 'bst-new' },
        {
          t: 'note',
          text: `Inserted ${insertVal} as ${dir} child of ${cur.val}. Checking ancestor balance factors bottom-up...`,
        },
      );
      break;
    }
  }

  if (duplicate) {
    events.push({ t: 'done' });
    return uniqueBase;
  }

  // Rebalance up the path
  let rotated = false;
  for (let i = path.length - 1; i >= 0; i--) {
    const ancestor = path[i].node;
    avlUpdateHeight(ancestor);
    const bf = avlBalanceFactor(ancestor);
    if (Math.abs(bf) <= 1) continue;

    const parentEntry = i > 0 ? path[i - 1] : null;
    const detachParent = () => {
      if (parentEntry) {
        events.push({ t: 'unlink', from: parentEntry.node.id, to: ancestor.id });
      }
    };
    const reattachParent = (newSubRoot: AvlSimNode) => {
      if (parentEntry) {
        if (parentEntry.dir === 'left') parentEntry.node.left = newSubRoot;
        else parentEntry.node.right = newSubRoot;
        events.push({
          t: 'link',
          from: parentEntry.node.id,
          to: newSubRoot.id,
          label: parentEntry.dir,
        });
      } else {
        root = newSubRoot;
      }
    };

    if (bf > 1 && insertVal < ancestor.left!.val) {
      events.push(
        { t: 'compare', a: { id: ancestor.id }, b: { id: ancestor.left!.id } },
        {
          t: 'note',
          text: `LL Imbalance at ${ancestor.val} (BF = +${bf}): performing Single Right Rotation!`,
        },
      );
      detachParent();
      const newSub = avlRotateRightSim(ancestor, events);
      reattachParent(newSub);
      events.push(
        { t: 'visit', id: newSub.id },
        { t: 'note', text: `LL Right Rotation complete! ${newSub.val} is now balanced.` },
      );
      rotated = true;
      break;
    }

    if (bf < -1 && insertVal > ancestor.right!.val) {
      events.push(
        { t: 'compare', a: { id: ancestor.id }, b: { id: ancestor.right!.id } },
        {
          t: 'note',
          text: `RR Imbalance at ${ancestor.val} (BF = ${bf}): performing Single Left Rotation!`,
        },
      );
      detachParent();
      const newSub = avlRotateLeftSim(ancestor, events);
      reattachParent(newSub);
      events.push(
        { t: 'visit', id: newSub.id },
        { t: 'note', text: `RR Left Rotation complete! ${newSub.val} is now balanced.` },
      );
      rotated = true;
      break;
    }

    if (bf > 1 && insertVal > ancestor.left!.val) {
      const leftChild = ancestor.left!;
      events.push(
        { t: 'compare', a: { id: leftChild.id }, b: { id: leftChild.right!.id } },
        {
          t: 'note',
          text: `LR Imbalance at ${ancestor.val} (BF = +${bf}): Step 1 Left Rotate ${leftChild.val}, then Step 2 Right Rotate ${ancestor.val}.`,
        },
      );
      events.push({ t: 'unlink', from: ancestor.id, to: leftChild.id });
      const newLeft = avlRotateLeftSim(leftChild, events);
      ancestor.left = newLeft;
      events.push(
        { t: 'link', from: ancestor.id, to: newLeft.id, label: 'left' },
        { t: 'note', text: `LR Step 1 complete; now rotating Right around ${ancestor.val}.` },
      );
      detachParent();
      const newSub = avlRotateRightSim(ancestor, events);
      reattachParent(newSub);
      events.push(
        { t: 'visit', id: newSub.id },
        { t: 'note', text: `LR Double Rotation complete! ${newSub.val} is now balanced.` },
      );
      rotated = true;
      break;
    }

    if (bf < -1 && insertVal < ancestor.right!.val) {
      const rightChild = ancestor.right!;
      events.push(
        { t: 'compare', a: { id: rightChild.id }, b: { id: rightChild.left!.id } },
        {
          t: 'note',
          text: `RL Imbalance at ${ancestor.val} (BF = ${bf}): Step 1 Right Rotate ${rightChild.val}, then Step 2 Left Rotate ${ancestor.val}.`,
        },
      );
      events.push({ t: 'unlink', from: ancestor.id, to: rightChild.id });
      const newRight = avlRotateRightSim(rightChild, events);
      ancestor.right = newRight;
      events.push(
        { t: 'link', from: ancestor.id, to: newRight.id, label: 'right' },
        { t: 'note', text: `RL Step 1 complete; now rotating Left around ${ancestor.val}.` },
      );
      detachParent();
      const newSub = avlRotateLeftSim(ancestor, events);
      reattachParent(newSub);
      events.push(
        { t: 'visit', id: newSub.id },
        { t: 'note', text: `RL Double Rotation complete! ${newSub.val} is now balanced.` },
      );
      rotated = true;
      break;
    }
  }

  if (!rotated) {
    events.push({
      t: 'note',
      text: `Inserted ${insertVal}: all balance factors stay in [-1, 0, +1] — no rotation needed!`,
    });
  }
  events.push({ t: 'done' });
  return [...uniqueBase, insertVal];
}

export function runStructureOperation(
  opId: StructureOperationId,
  paramValue = 35,
  customValues?: number[],
  paramText?: string,
): {
  events: TraceEvent[];
  meta: AlgorithmMetadata;
  scene: Exclude<PreviewSceneKind, 'array'>;
  updatedValues?: number[];
} {
  const def =
    STRUCTURE_OP_CATALOG.find((d) => d.id === opId) ?? STRUCTURE_OP_CATALOG[0];
  const codeLines = getCorpusCodeLines(def.corpusPath, [
    '// Loaded from cpp_corpus/' + def.corpusPath,
  ]);

  const meta: AlgorithmMetadata = {
    id: 'bubble-sort',
    title: def.label,
    category: def.group === 'Sort' ? 'sorting' : 'operation',
    timeComplexity: def.timeComplexity,
    spaceComplexity: def.spaceComplexity,
    code: codeLines,
  };

  const events: TraceEvent[] = [];
  let updatedValues: number[] | undefined;

  switch (opId) {
    // ==========================================
    // LINKED LIST OPERATIONS
    // ==========================================
    case 'sll-insert-head': {
      const vals = emitBaseLinkedList(events, customValues);
      const val = Number.isFinite(paramValue) ? paramValue : 5;
      updatedValues = [val, ...vals];
      events.push(
        {
          t: 'note',
          text: `Starting with Linked List: ${vals.join(' → ')}. We will add ${val} at the front.`,
        },
        { t: 'line', line: 17 },
        { t: 'create', id: 'node-new', kind: 'node', value: val },
        {
          t: 'note',
          text: `Created a new node holding ${val}.`,
        },
        { t: 'line', line: 18 },
        { t: 'link', from: 'node-new', to: 'node-head', label: 'next' },
        {
          t: 'note',
          text: `Pointed the new node (${val}) to the old head (${vals[0]}).`,
        },
        { t: 'line', line: 19 },
        { t: 'visit', id: 'node-new' },
        {
          t: 'note',
          text: `Done! ${val} is now the new head at the front of the Linked List.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'sll-insert-tail': {
      const vals = emitBaseLinkedList(events, customValues);
      const nodeIds = getLinkedListNodeIds(vals.length);
      const tailId = nodeIds[nodeIds.length - 1];
      const val = Number.isFinite(paramValue) ? paramValue : 70;
      updatedValues = [...vals, val];
      events.push(
        {
          t: 'note',
          text: `Starting at head (${vals[0]}). Walking to the end of the list to add ${val}.`,
        },
        { t: 'line', line: 27 },
      );
      for (let i = 0; i < nodeIds.length; i++) {
        events.push({ t: 'visit', id: nodeIds[i] });
        if (i < nodeIds.length - 2) {
          events.push({
            t: 'note',
            text: `Checking node ${vals[i]} — it has a next arrow, so move forward.`,
          });
        } else if (i === nodeIds.length - 2) {
          events.push({
            t: 'note',
            text: `Checking node ${vals[i]} — moving to the last node ${vals[i + 1]}.`,
          });
        }
      }
      events.push(
        {
          t: 'note',
          text: `Reached the tail node (${vals[vals.length - 1]}). Creating new node ${val} and linking it at the end.`,
        },
        { t: 'line', line: 29 },
        { t: 'create', id: 'node-new-tail', kind: 'node', value: val },
        { t: 'link', from: tailId, to: 'node-new-tail', label: 'next' },
        { t: 'visit', id: 'node-new-tail' },
        {
          t: 'note',
          text: `Done! Node ${val} is now linked at the end of the list.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'sll-delete-val': {
      const vals = emitBaseLinkedList(events, customValues);
      const nodeIds = getLinkedListNodeIds(vals.length);
      const target = Number.isFinite(paramValue) ? paramValue : (vals[2] ?? vals[0]);
      const matchIdx = vals.findIndex((v) => v === target);

      events.push({
        t: 'note',
        text: `Walking along the Linked List (${vals.join(' → ')}) to remove value ${target}.`,
      });
      events.push({ t: 'line', line: 51 });

      if (matchIdx === 0) {
        events.push(
          { t: 'visit', id: nodeIds[0] },
          {
            t: 'note',
            text: `Head node holds ${target}! Copying head into temp (Node* temp = head).`,
          },
        );
        if (nodeIds[1]) {
          events.push(
            { t: 'line', line: 55 },
            { t: 'unlink', from: nodeIds[0], to: nodeIds[1] },
            { t: 'visit', id: nodeIds[1] },
            {
              t: 'note',
              text: `Moved head to ${vals[1]} (head = head->next) and disconnected temp (${target}).`,
            },
            { t: 'line', line: 56 },
            { t: 'remove', id: nodeIds[0] },
            {
              t: 'note',
              text: `Freed temp (${target}) from memory. List is now ${vals.slice(1).join(' → ')}.`,
            },
          );
        } else {
          events.push(
            { t: 'line', line: 55 },
            { t: 'remove', id: nodeIds[0] },
            { t: 'note', text: `Freed temp (${target}) from memory. List is now empty.` },
          );
        }
        events.push({ t: 'done' });
        updatedValues = vals.slice(1);
      } else if (matchIdx > 0) {
        for (let i = 0; i <= matchIdx; i++) {
          events.push({ t: 'visit', id: nodeIds[i] });
          if (i < matchIdx) {
            events.push({
              t: 'note',
              text: `At node ${vals[i]} (not ${target}) — advancing prev and curr forward.`,
            });
          } else {
            events.push({
              t: 'note',
              text: `Found ${target}! prev is at ${vals[matchIdx - 1]} and curr is at ${target}.`,
            });
          }
        }
        const prevId = nodeIds[matchIdx - 1];
        const delId = nodeIds[matchIdx];
        const nextId = nodeIds[matchIdx + 1];
        events.push(
          { t: 'line', line: 55 },
          {
            t: 'note',
            text: `Copying target node (${target}) into temp: Node* temp = curr;`,
          },
          { t: 'unlink', from: prevId, to: delId },
          {
            t: 'note',
            text: `Disconnected prev (${vals[matchIdx - 1]})->next from temp (${target}).`,
          },
        );
        if (nextId) {
          events.push(
            { t: 'unlink', from: delId, to: nextId },
            {
              t: 'note',
              text: `Disconnected temp (${target})->next from ${vals[matchIdx + 1]}.`,
            },
            { t: 'link', from: prevId, to: nextId, label: 'next' },
            {
              t: 'note',
              text: `Linked prev (${vals[matchIdx - 1]}) directly to ${vals[matchIdx + 1]} (prev->next = temp->next).`,
            },
          );
        } else {
          events.push({
            t: 'note',
            text: `temp (${target}) was the tail, so prev (${vals[matchIdx - 1]})->next is now NULL.`,
          });
        }
        events.push({ t: 'line', line: 56 });
        events.push({ t: 'remove', id: delId });
        events.push({ t: 'visit', id: prevId });
        const remaining = vals.filter((_, idx) => idx !== matchIdx);
        updatedValues = remaining;
        events.push(
          {
            t: 'note',
            text: `Freed temp (${target}) from memory (delete temp). List is now ${remaining.join(' → ')}.`,
          },
          { t: 'done' },
        );
      } else {
        for (let i = 0; i < vals.length; i++) {
          events.push(
            { t: 'visit', id: nodeIds[i] },
            { t: 'note', text: `Checked node #${i + 1} (${vals[i]}) — not ${target}.` },
          );
        }
        events.push(
          {
            t: 'note',
            text: `Reached NULL — value ${target} was not found in the Linked List. Nothing removed.`,
          },
          { t: 'done' },
        );
      }
      break;
    }

    case 'sll-search': {
      const vals = emitBaseLinkedList(events, customValues);
      const nodeIds = getLinkedListNodeIds(vals.length);
      const target = Number.isFinite(paramValue) ? paramValue : (vals[2] ?? vals[0]);
      events.push({
        t: 'note',
        text: `Searching the Linked List (${vals.join(' → ')}) from head to tail for ${target}.`,
      });
      events.push({ t: 'line', line: 62 });

      let found = false;
      for (let i = 0; i < vals.length; i++) {
        events.push({ t: 'visit', id: nodeIds[i] });
        if (vals[i] === target) {
          events.push({ t: 'line', line: 64 });
          events.push({
            t: 'note',
            text: `Found ${target} at node #${i + 1}!`,
          });
          found = true;
          break;
        }
        events.push({
          t: 'note',
          text: `Checking node #${i + 1}: value is ${vals[i]} (not ${target}). Follow next arrow.`,
        });
      }

      if (!found) {
        events.push({
          t: 'note',
          text: `Reached NULL — ${target} is not in this Linked List.`,
        });
      }
      events.push({ t: 'done' });
      break;
    }

    case 'sll-reverse': {
      const vals = emitBaseLinkedList(events, customValues);
      const nodeIds = getLinkedListNodeIds(vals.length);
      updatedValues = [...vals].reverse();
      events.push(
        {
          t: 'note',
          text: 'Reversing the Linked List in-place by flipping each arrow backward.',
        },
        { t: 'line', line: 17 },
      );
      if (nodeIds.length > 0) {
        events.push({ t: 'visit', id: nodeIds[0] });
        if (nodeIds[1]) {
          events.push(
            { t: 'compare', a: { id: nodeIds[0] }, b: { id: nodeIds[1] } },
            {
              t: 'note',
              text: `Saved next = curr->next (${vals[1]}) before detaching ${vals[0]}.`,
            },
            { t: 'unlink', from: nodeIds[0], to: nodeIds[1] },
            { t: 'compare', a: { id: nodeIds[0] }, b: { id: nodeIds[1] } },
            {
              t: 'note',
              text: `Detached ${vals[0]} from ${vals[1]} so ${vals[0]} now points to NULL (new tail).`,
            },
          );
        }
        for (let i = 1; i < nodeIds.length; i++) {
          events.push({ t: 'visit', id: nodeIds[i] });
          if (nodeIds[i + 1]) {
            events.push(
              { t: 'compare', a: { id: nodeIds[i] }, b: { id: nodeIds[i + 1] } },
              {
                t: 'note',
                text: `Saved next = curr->next (${vals[i + 1]}).`,
              },
              { t: 'unlink', from: nodeIds[i], to: nodeIds[i + 1] },
              { t: 'link', from: nodeIds[i], to: nodeIds[i - 1], label: 'next' },
              { t: 'compare', a: { id: nodeIds[i] }, b: { id: nodeIds[i + 1] } },
              {
                t: 'note',
                text: `Flipped ${vals[i]}->next to point back to prev (${vals[i - 1]}).`,
              },
            );
          } else {
            events.push(
              { t: 'link', from: nodeIds[i], to: nodeIds[i - 1], label: 'next' },
              {
                t: 'note',
                text: `Flipped ${vals[i]}->next to point back to prev (${vals[i - 1]}). next is NULL!`,
              },
            );
          }
        }
      }
      events.push(
        {
          t: 'note',
          text: `Done! Reversed list: ${updatedValues.join(' → ')}.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'sll-find-middle': {
      const vals = emitBaseLinkedList(events, customValues);
      const nodeIds = getLinkedListNodeIds(vals.length);
      events.push(
        {
          t: 'note',
          text: 'Using Slow (1 step) and Fast (2 steps) pointers to find the middle node.',
        },
        { t: 'line', line: 34 },
        { t: 'compare', a: { id: nodeIds[0] }, b: { id: nodeIds[0] } },
        { t: 'note', text: 'Both Slow and Fast start at head.' },
      );
      let slow = 0;
      let fast = 0;
      while (fast + 1 < nodeIds.length && fast + 2 < nodeIds.length) {
        slow += 1;
        fast += 2;
        events.push(
          { t: 'compare', a: { id: nodeIds[slow] }, b: { id: nodeIds[fast] } },
          {
            t: 'note',
            text: `Slow moves 1 step to ${vals[slow]}, while Fast jumps 2 steps to ${vals[fast]}.`,
          },
        );
      }
      events.push(
        {
          t: 'note',
          text: `Fast reaches the end, so Slow lands right on the middle node (${vals[slow]})!`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'dll-traversal': {
      const vals = emitBaseLinkedList(events, customValues);
      const nodeIds = getLinkedListNodeIds(vals.length);
      for (let i = 1; i < nodeIds.length; i++) {
        events.push({ t: 'link', from: nodeIds[i], to: nodeIds[i - 1], label: 'prev' });
      }
      events.push({
        t: 'note',
        text: 'Doubly Linked List: every node has both a forward (next) and backward (prev) arrow.',
      });
      for (let i = 0; i < nodeIds.length; i++) {
        events.push({ t: 'visit', id: nodeIds[i] });
        if (i < nodeIds.length - 1) {
          events.push({
            t: 'note',
            text: `Forward walk: visiting ${i === 0 ? 'head' : `node #${i + 1}`} (${vals[i]}) → moving next.`,
          });
        }
      }
      events.push(
        {
          t: 'note',
          text: 'Reached tail. Because each node also has a prev arrow, we can walk backward too!',
        },
        { t: 'done' },
      );
      break;
    }

    case 'cll-cycle': {
      const vals = emitBaseLinkedList(events, customValues);
      const nodeIds = getLinkedListNodeIds(vals.length);
      const tailId = nodeIds[nodeIds.length - 1];
      const loopTargetIdx = nodeIds.length > 1 ? 1 : 0;
      const loopTargetId = nodeIds[loopTargetIdx];
      const nextIndex = (idx: number) =>
        idx + 1 < nodeIds.length ? idx + 1 : loopTargetIdx;

      events.push(
        { t: 'link', from: tailId, to: loopTargetId, label: 'loop' },
        {
          t: 'note',
          text: `Tail node loops back to ${vals[loopTargetIdx]}! Running Tortoise (Slow) & Hare (Fast) cycle detection.`,
        },
        { t: 'compare', a: { id: nodeIds[0] }, b: { id: nodeIds[0] } },
        { t: 'note', text: 'Both Slow and Fast start at head.' },
      );

      let slow = 0;
      let fast = 0;
      for (let step = 0; step < nodeIds.length * 2 + 2; step++) {
        slow = nextIndex(slow);
        fast = nextIndex(nextIndex(fast));
        events.push({ t: 'compare', a: { id: nodeIds[slow] }, b: { id: nodeIds[fast] } });
        if (slow === fast) {
          events.push({
            t: 'note',
            text: `Slow (${vals[slow]}) and Fast (${vals[fast]}) meet at node #${slow + 1} — cycle confirmed!`,
          });
          break;
        }
        events.push({
          t: 'note',
          text: `Slow steps 1 node to ${vals[slow]}, while Fast jumps 2 nodes to ${vals[fast]}.`,
        });
      }

      events.push({ t: 'done' });
      break;
    }

    // ==========================================
    // STACK & RECURSION OPERATIONS (Week 4)
    // ==========================================
    case 'stack-push': {
      const stkVals = emitBaseStack(events, customValues, [15, 30, 45]);
      const val = Number.isFinite(paramValue) ? paramValue : 50;
      const newIdx = stkVals.length;
      const newId = `stk-${newIdx}`;
      const prevTopId = `stk-${newIdx - 1}`;
      updatedValues = [...stkVals, val];
      events.push(
        {
          t: 'note',
          text: `Stack currently has [${stkVals.join(', ')}] (${stkVals[stkVals.length - 1]} on top). Pushing ${val} onto the top of the stack.`,
        },
        { t: 'line', line: 17 },
        { t: 'create', id: newId, kind: 'node', value: val },
        { t: 'link', from: newId, to: prevTopId, label: 'below' },
        { t: 'visit', id: newId },
        {
          t: 'note',
          text: `Done! ${val} is now sitting at the TOP of the stack (Last-In, First-Out).`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'stack-pop': {
      const stkVals = emitBaseStack(events, customValues, [15, 30, 45, 60]);
      const topIdx = stkVals.length - 1;
      const topId = `stk-${topIdx}`;
      const topVal = stkVals[topIdx];
      updatedValues = stkVals.slice(0, topIdx);
      events.push(
        {
          t: 'note',
          text: `The top of the stack is ${topVal}. Pop removes the top item first (LIFO).`,
        },
        { t: 'line', line: 21 },
        { t: 'visit', id: topId },
        { t: 'note', text: `Inspecting top element ${topVal} before popping it off.` },
      );
      if (topIdx > 0) {
        const nextTopId = `stk-${topIdx - 1}`;
        events.push(
          { t: 'unlink', from: topId, to: nextTopId },
          {
            t: 'note',
            text: `Lifting and sliding top plate ${topVal} off the stack...`,
          },
          { t: 'remove', id: topId },
          { t: 'visit', id: nextTopId },
          {
            t: 'note',
            text: `Popped ${topVal}! Now ${stkVals[topIdx - 1]} becomes the new TOP of the stack.`,
          },
        );
      } else {
        events.push(
          {
            t: 'note',
            text: `Lifting and sliding plate ${topVal} off the stack...`,
          },
          { t: 'remove', id: topId },
          { t: 'note', text: `Popped ${topVal}! The stack is now empty.` },
        );
      }
      events.push({ t: 'done' });
      break;
    }

    case 'stack-peek': {
      const stkVals = emitBaseStack(events, customValues, [15, 30, 45]);
      const topIdx = stkVals.length - 1;
      const topId = `stk-${topIdx}`;
      events.push(
        {
          t: 'note',
          text: 'Checking the top of the stack without removing anything (peek).',
        },
        { t: 'line', line: 25 },
        { t: 'visit', id: topId },
        {
          t: 'note',
          text: `Top of stack is ${stkVals[topIdx]}! The stack remains unchanged.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'stack-brackets': {
      const expr = (paramText ?? '').trim().slice(0, 24) || '{[()]}';
      const openBrackets = new Set(['(', '[', '{']);
      const matchingOpen: Record<string, string> = {
        ')': '(',
        ']': '[',
        '}': '{',
      };
      const stack: { id: string; ch: string }[] = [];
      let nextPlateId = 0;
      let balanced = true;

      events.push(
        {
          t: 'note',
          text: `Checking if "${expr}" has balanced brackets using a Stack.`,
        },
        { t: 'line', line: 47 },
      );

      for (const ch of expr) {
        if (openBrackets.has(ch)) {
          const id = `stk-${nextPlateId++}`;
          const prevId = stack.length > 0 ? stack[stack.length - 1].id : null;
          events.push({ t: 'line', line: 51 });
          events.push({ t: 'create', id, kind: 'node', value: ch });
          if (prevId) {
            events.push({ t: 'link', from: id, to: prevId, label: 'below' });
          }
          events.push({
            t: 'note',
            text: `Read "${ch}": opening bracket, so push "${ch}" onto the stack.`,
          });
          stack.push({ id, ch });
        } else if (ch in matchingOpen) {
          const expected = matchingOpen[ch];
          if (stack.length === 0) {
            events.push(
              { t: 'line', line: 55 },
              {
                t: 'note',
                text: `Read "${ch}": stack is empty — no matching "${expected}"! Expression is NOT balanced.`,
              },
            );
            balanced = false;
            break;
          }
          const top = stack[stack.length - 1];
          events.push({ t: 'line', line: 58 }, { t: 'visit', id: top.id });
          if (top.ch !== expected) {
            events.push(
              { t: 'line', line: 60 },
              {
                t: 'note',
                text: `Read "${ch}": mismatch! Top is "${top.ch}", expected "${expected}". Expression is NOT balanced.`,
              },
            );
            balanced = false;
            break;
          }
          if (stack.length > 1) {
            events.push({
              t: 'unlink',
              from: top.id,
              to: stack[stack.length - 2].id,
            });
          }
          events.push(
            {
              t: 'note',
              text: `Lifting and sliding top plate "${top.ch}" off the stack...`,
            },
            { t: 'remove', id: top.id },
            {
              t: 'note',
              text: `Read "${ch}": matches "${top.ch}" on top of the stack! Pop "${top.ch}".`,
            },
          );
          stack.pop();
        } else if (ch.trim() !== '') {
          events.push({
            t: 'note',
            text: `Read "${ch}": not a bracket — skip.`,
          });
        }
      }

      if (balanced) {
        if (stack.length === 0) {
          events.push({
            t: 'note',
            text: `Done! Stack is completely empty — "${expr}" has balanced brackets!`,
          });
        } else {
          events.push({
            t: 'note',
            text: `Reached end of "${expr}", but ${stack.length} unclosed bracket(s) remain on the stack — NOT balanced!`,
          });
        }
      }
      events.push({ t: 'done' });
      break;
    }

    case 'recursion-factorial': {
      const n = Math.max(1, Math.min(6, Math.floor(Number.isFinite(paramValue) ? paramValue : 4)));
      const factors = Array.from({ length: n }, (_, i) => i + 1);
      events.push({
        t: 'note',
        text: `Calculating ${n}! (${factors.slice().reverse().join(' × ')}) by pushing each recursive call onto the Call Stack.`,
      });
      for (let k = n, depth = 1; k >= 1; k--, depth++) {
        const frameId = `stk-${n - k}`;
        const prevId = n - k > 0 ? `stk-${n - k - 1}` : null;
        events.push(
          { t: 'call', fn: 'factorial', args: [k], depth },
          { t: 'create', id: frameId, kind: 'node', value: k === 1 ? '1=1' : `${k}!` },
        );
        if (prevId) {
          events.push({ t: 'link', from: frameId, to: prevId, label: 'calls' });
        }
        if (k > 1) {
          events.push({
            t: 'note',
            text: `factorial(${k}) needs factorial(${k - 1}), so push frame ${k}! and call factorial(${k - 1}).`,
          });
        } else {
          events.push(
            { t: 'visit', id: frameId },
            { t: 'note', text: 'Base case reached! factorial(1) returns 1. Now we unwind the stack.' },
          );
        }
      }
      let acc = 1;
      for (let k = 1; k <= n; k++) {
        const frameId = `stk-${n - k}`;
        const prevId = n - k > 0 ? `stk-${n - k - 1}` : null;
        if (k === 1) {
          events.push({ t: 'return', fn: 'factorial', value: 1 });
          if (prevId) {
            events.push({ t: 'unlink', from: frameId, to: prevId });
            events.push({ t: 'remove', id: frameId });
          }
        } else {
          const prevAcc = acc;
          acc *= k;
          events.push(
            { t: 'set', target: { id: frameId }, value: acc },
            { t: 'visit', id: frameId },
            { t: 'note', text: `factorial(${k}) computes ${k} × ${prevAcc} = ${acc} and returns ${acc}.` },
            { t: 'return', fn: 'factorial', value: acc },
          );
          if (prevId) {
            events.push({ t: 'unlink', from: frameId, to: prevId });
            events.push({ t: 'remove', id: frameId });
          }
        }
      }
      events.push(
        { t: 'note', text: `Recursion complete! Final answer: ${n}! = ${acc}.` },
        { t: 'done' },
      );
      break;
    }

    case 'recursion-hanoi': {
      const parsedTextDisks = (paramText ?? '')
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => Number(s))
        .filter((num) => Number.isFinite(num))
        .slice(0, 5);
      const rawDisks =
        parsedTextDisks.length >= 1
          ? parsedTextDisks
          : customValues && customValues.length >= 1
            ? customValues.slice(0, 5)
            : [30, 20, 10];
      const diskVals = [...rawDisks].sort((a, b) => b - a);
      const n = diskVals.length;
      const totalMoves = Math.pow(2, n) - 1;
      for (let i = 0; i < n; i++) {
        events.push(
          { t: 'create', id: `stk-${i}`, kind: 'node', value: diskVals[i] },
          { t: 'link', from: `stk-${i}`, to: 'peg-A', label: 'peg' },
        );
      }
      events.push(
        { t: 'call', fn: 'hanoi', args: [n, 'A', 'C', 'B'], depth: 1 },
        {
          t: 'note',
          text: `Tower of Hanoi (${n} disks): [${diskVals.slice().reverse().join(', ')}] on Peg A (smallest on top, largest at base).`,
        },
      );

      let moveNum = 0;
      const solveHanoi = (
        k: number,
        fromPeg: string,
        toPeg: string,
        auxPeg: string,
        depth: number,
      ) => {
        if (k === 0) return;
        if (k > 1) {
          events.push({
            t: 'call',
            fn: 'hanoi',
            args: [k - 1, fromPeg, auxPeg, toPeg],
            depth: depth + 1,
          });
          solveHanoi(k - 1, fromPeg, auxPeg, toPeg, depth + 1);
        }
        const diskIdx = n - k;
        const diskId = `stk-${diskIdx}`;
        const diskVal = diskVals[diskIdx];
        moveNum += 1;
        events.push(
          { t: 'visit', id: diskId },
          { t: 'link', from: diskId, to: `peg-${toPeg}`, label: 'peg' },
          {
            t: 'note',
            text: `Move ${moveNum}/${totalMoves}: Move disk ${diskVal} from Peg ${fromPeg} → Peg ${toPeg}.`,
          },
        );
        if (k > 1) {
          events.push({
            t: 'call',
            fn: 'hanoi',
            args: [k - 1, auxPeg, toPeg, fromPeg],
            depth: depth + 1,
          });
          solveHanoi(k - 1, auxPeg, toPeg, fromPeg, depth + 1);
        }
        events.push({ t: 'return', fn: 'hanoi', value: diskVal });
      };

      solveHanoi(n, 'A', 'C', 'B', 1);
      events.push(
        {
          t: 'note',
          text: `Done! All ${n} disks moved to Peg C in ${totalMoves} moves.`,
        },
        { t: 'done' },
      );
      break;
    }

    // ==========================================
    // QUEUE & DEQUE OPERATIONS (Week 5)
    // ==========================================
    case 'queue-enqueue': {
      const qVals =
        customValues && customValues.length >= 1
          ? customValues.slice(0, 23)
          : [10, 20, 30];
      const val = Number.isFinite(paramValue) ? paramValue : 50;
      updatedValues = [...qVals, val];
      for (let i = 0; i < qVals.length; i++) {
        events.push({ t: 'create', id: `q-${i}`, kind: 'node', value: qVals[i] });
        if (i > 0) {
          events.push({ t: 'link', from: `q-${i - 1}`, to: `q-${i}`, label: 'next' });
        }
      }
      const newId = `q-${qVals.length}`;
      const prevRearId = `q-${qVals.length - 1}`;
      events.push(
        {
          t: 'note',
          text: `Queue has ${qVals[0]} at the FRONT and ${qVals[qVals.length - 1]} at the BACK. Adding ${val} to the back of the line.`,
        },
        { t: 'line', line: 19 },
        { t: 'create', id: newId, kind: 'node', value: val },
        { t: 'link', from: prevRearId, to: newId, label: 'next' },
        { t: 'visit', id: newId },
        {
          t: 'note',
          text: `Done! ${val} joined the back of the queue (First-In, First-Out).`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'queue-dequeue': {
      const qVals =
        customValues && customValues.length >= 1
          ? customValues.slice(0, 24)
          : [10, 20, 30, 40];
      updatedValues = qVals.slice(1);
      for (let i = 0; i < qVals.length; i++) {
        events.push({ t: 'create', id: `q-${i}`, kind: 'node', value: qVals[i] });
        if (i > 0) {
          events.push({ t: 'link', from: `q-${i - 1}`, to: `q-${i}`, label: 'next' });
        }
      }
      events.push(
        {
          t: 'note',
          text: `${qVals[0]} is at the FRONT of the queue and has been waiting longest.`,
        },
        { t: 'line', line: 27 },
        { t: 'visit', id: 'q-0' },
        { t: 'note', text: `Serving ${qVals[0]} at the front of the queue.` },
      );
      if (qVals.length > 1) {
        events.push({ t: 'unlink', from: 'q-0', to: 'q-1' });
      }
      events.push({ t: 'remove', id: 'q-0' });
      if (qVals.length > 1) {
        events.push(
          { t: 'visit', id: 'q-1' },
          {
            t: 'note',
            text: `${qVals[0]} has left the queue! Now ${qVals[1]} is at the FRONT of the line.`,
          },
        );
      } else {
        events.push({
          t: 'note',
          text: `${qVals[0]} has left the queue! The queue is now empty.`,
        });
      }
      events.push({ t: 'done' });
      break;
    }

    case 'circular-queue': {
      const cqVals =
        customValues && customValues.length >= 1
          ? customValues.slice(0, 23)
          : [10, 20, 30, 40];
      const enqueueVal = Number.isFinite(paramValue) ? paramValue : 99;
      for (let i = 0; i < cqVals.length; i++) {
        events.push({ t: 'create', id: `cq-${i}`, kind: 'node', value: cqVals[i] });
        if (i > 0) {
          events.push({ t: 'link', from: `cq-${i - 1}`, to: `cq-${i}`, label: 'next' });
        }
      }
      events.push({
        t: 'note',
        text: 'Circular Queue: when the rear reaches the end, it wraps around to slot 0 using modulo.',
      });
      if (cqVals.length >= 2) {
        events.push(
          { t: 'visit', id: 'cq-0' },
          { t: 'unlink', from: 'cq-0', to: 'cq-1' },
          { t: 'remove', id: 'cq-0' },
          {
            t: 'note',
            text: `Dequeued ${cqVals[0]} from slot 0, freeing up space at the start of the buffer.`,
          },
          { t: 'create', id: 'cq-wrap', kind: 'node', value: enqueueVal },
          { t: 'link', from: `cq-${cqVals.length - 1}`, to: 'cq-wrap', label: 'wrap % N' },
          { t: 'link', from: 'cq-wrap', to: 'cq-1', label: 'loop' },
          { t: 'visit', id: 'cq-wrap' },
          {
            t: 'note',
            text: `Enqueued ${enqueueVal}! Rear wrapped around from the end back into the free slot.`,
          },
        );
        updatedValues = [...cqVals.slice(1), enqueueVal];
      } else {
        events.push(
          { t: 'create', id: 'cq-wrap', kind: 'node', value: enqueueVal },
          { t: 'link', from: 'cq-0', to: 'cq-wrap', label: 'wrap % N' },
          { t: 'link', from: 'cq-wrap', to: 'cq-0', label: 'loop' },
          { t: 'visit', id: 'cq-wrap' },
          {
            t: 'note',
            text: `Enqueued ${enqueueVal} into the circular buffer.`,
          },
        );
        updatedValues = [...cqVals, enqueueVal];
      }
      events.push({ t: 'done' });
      break;
    }

    // ==========================================
    // DEQUE OPERATIONS (Week 5)
    // ==========================================
    case 'deque-push-front': {
      const dqVals = emitBaseDeque(events, customValues);
      const val = Number.isFinite(paramValue) ? paramValue : 5;
      updatedValues = [val, ...dqVals];
      events.push(
        {
          t: 'note',
          text: `Deque has ${dqVals[0]} at the FRONT and ${dqVals[dqVals.length - 1]} at the REAR. Inserting ${val} at the FRONT.`,
        },
        { t: 'create', id: 'dq-0', kind: 'node', value: val },
        { t: 'link', from: 'dq-0', to: 'dq-1', label: 'next' },
        { t: 'visit', id: 'dq-0' },
        {
          t: 'note',
          text: `Inserted ${val} at the FRONT! Deque is now: ${updatedValues.join(' ⇄ ')}.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'deque-push-rear': {
      const dqVals = emitBaseDeque(events, customValues);
      const val = Number.isFinite(paramValue) ? paramValue : 95;
      const rearId = `dq-${dqVals.length + 1}`;
      const prevRearId = `dq-${dqVals.length}`;
      updatedValues = [...dqVals, val];
      events.push(
        {
          t: 'note',
          text: `Deque has ${dqVals[0]} at the FRONT and ${dqVals[dqVals.length - 1]} at the REAR. Inserting ${val} at the REAR.`,
        },
        { t: 'create', id: rearId, kind: 'node', value: val },
        { t: 'link', from: prevRearId, to: rearId, label: 'next' },
        { t: 'visit', id: rearId },
        {
          t: 'note',
          text: `Inserted ${val} at the REAR! Deque is now: ${updatedValues.join(' ⇄ ')}.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'deque-pop-front': {
      const dqVals = emitBaseDeque(events, customValues);
      updatedValues = dqVals.slice(1);
      events.push(
        {
          t: 'note',
          text: `Deleting ${dqVals[0]} from the FRONT of the Deque.`,
        },
        { t: 'visit', id: 'dq-1' },
      );
      if (dqVals.length > 1) {
        events.push({ t: 'unlink', from: 'dq-1', to: 'dq-2' });
      }
      events.push({ t: 'remove', id: 'dq-1' });
      if (dqVals.length > 1) {
        events.push(
          { t: 'visit', id: 'dq-2' },
          {
            t: 'note',
            text: `Removed ${dqVals[0]} from the FRONT! New front is ${dqVals[1]}.`,
          },
        );
      } else {
        events.push({
          t: 'note',
          text: `Removed ${dqVals[0]} from the FRONT! Deque is now empty.`,
        });
      }
      events.push({ t: 'done' });
      break;
    }

    case 'deque-pop-rear': {
      const dqVals = emitBaseDeque(events, customValues);
      const rearIdx = dqVals.length;
      const rearId = `dq-${rearIdx}`;
      const removedVal = dqVals[rearIdx - 1];
      updatedValues = dqVals.slice(0, -1);
      events.push(
        {
          t: 'note',
          text: `Deleting ${removedVal} from the REAR of the Deque.`,
        },
        { t: 'visit', id: rearId },
      );
      if (dqVals.length > 1) {
        events.push({ t: 'unlink', from: `dq-${rearIdx - 1}`, to: rearId });
      }
      events.push({ t: 'remove', id: rearId });
      if (dqVals.length > 1) {
        events.push(
          { t: 'visit', id: `dq-${rearIdx - 1}` },
          {
            t: 'note',
            text: `Removed ${removedVal} from the REAR! New rear is ${dqVals[rearIdx - 2]}.`,
          },
        );
      } else {
        events.push({
          t: 'note',
          text: `Removed ${removedVal} from the REAR! Deque is now empty.`,
        });
      }
      events.push({ t: 'done' });
      break;
    }

    case 'deque-ops': {
      const dqVals = emitBaseDeque(events, customValues, [20, 30]);
      const backVal = Number.isFinite(paramValue) ? paramValue : 95;
      const frontVal = 5;
      const rearId = `dq-${dqVals.length + 1}`;
      const lastExistingId = `dq-${dqVals.length}`;
      updatedValues = [frontVal, ...dqVals, backVal];
      events.push(
        {
          t: 'note',
          text: 'Double-Ended Queue (Deque): we can add or remove numbers at BOTH the front and back.',
        },
        { t: 'create', id: 'dq-0', kind: 'node', value: frontVal },
        { t: 'link', from: 'dq-0', to: 'dq-1', label: 'next' },
        { t: 'visit', id: 'dq-0' },
        { t: 'note', text: `Inserted ${frontVal} directly at the FRONT of the Deque.` },
        { t: 'create', id: rearId, kind: 'node', value: backVal },
        { t: 'link', from: lastExistingId, to: rearId, label: 'next' },
        { t: 'visit', id: rearId },
        {
          t: 'note',
          text: `Inserted ${backVal} at the BACK of the Deque. Deque is now: ${updatedValues.join(' ⇄ ')}.`,
        },
        { t: 'done' },
      );
      break;
    }

    // ==========================================
    // BINARY TREE, BST & AVL OPERATIONS (Weeks 9, 11, 12)
    // ==========================================
    case 'bst-insert': {
      const { rootId, nodes, sorted } = emitBaseBst(events, customValues);
      const val = Number.isFinite(paramValue) ? paramValue : 45;
      updatedValues = [...sorted, val];

      events.push(
        {
          t: 'note',
          text: `Inserting ${val} into the Binary Search Tree. Smaller numbers go left; bigger go right.`,
        },
        { t: 'line', line: 17 },
      );

      let curId: string | undefined = rootId;
      while (curId) {
        const node: BstNodeInfo = nodes[curId];
        events.push({ t: 'visit', id: curId });
        const goLeft = val < node.val;
        const nextId: string | undefined = goLeft ? node.left : node.right;
        if (nextId) {
          events.push({
            t: 'note',
            text: `Comparing ${val} with ${node.val}: ${val} is ${goLeft ? 'smaller' : 'greater or equal'}, so go ${goLeft ? 'LEFT' : 'RIGHT'} to ${nodes[nextId].val}.`,
          });
          curId = nextId;
        } else {
          events.push(
            {
              t: 'note',
              text: `Comparing ${val} with ${node.val}: ${goLeft ? 'left' : 'right'} child slot is open!`,
            },
            { t: 'create', id: 'bst-new', kind: 'node', value: val },
            { t: 'link', from: curId, to: 'bst-new', label: goLeft ? 'left' : 'right' },
            { t: 'visit', id: 'bst-new' },
            {
              t: 'note',
              text: `Placed ${val} as the ${goLeft ? 'left' : 'right'} child of ${node.val}!`,
            },
            { t: 'done' },
          );
          break;
        }
      }
      break;
    }

    case 'bst-search': {
      const { rootId, nodes, sorted } = emitBaseBst(events, customValues);
      const target = Number.isFinite(paramValue)
        ? paramValue
        : sorted[Math.floor(sorted.length / 2)];

      events.push(
        {
          t: 'note',
          text: `Searching for ${target} in the Binary Search Tree starting at root ${nodes[rootId].val}.`,
        },
        { t: 'line', line: 26 },
      );

      let curId: string | undefined = rootId;
      let steps = 0;
      let found = false;
      while (curId) {
        const node: BstNodeInfo = nodes[curId];
        steps++;
        events.push({ t: 'visit', id: curId });
        if (node.val === target) {
          events.push({
            t: 'note',
            text: `Found ${target}! Binary Search Tree found it in just ${steps} step${steps === 1 ? '' : 's'}.`,
          });
          found = true;
          break;
        }
        const goLeft = target < node.val;
        const nextId: string | undefined = goLeft ? node.left : node.right;
        if (nextId) {
          events.push({
            t: 'note',
            text: `${target} is ${goLeft ? 'smaller' : 'bigger'} than ${node.val}, so we go ${goLeft ? 'LEFT' : 'RIGHT'} to ${nodes[nextId].val}.`,
          });
        } else {
          events.push({
            t: 'note',
            text: `${target} is ${goLeft ? 'smaller' : 'bigger'} than ${node.val}, but ${goLeft ? 'left' : 'right'} child is NULL.`,
          });
        }
        curId = nextId;
      }
      if (!found) {
        events.push({
          t: 'note',
          text: `Search finished: ${target} is not in this BST.`,
        });
      }
      events.push({ t: 'done' });
      break;
    }

    case 'bst-delete': {
      const { rootId, nodes, sorted } = emitBaseBst(events, customValues);
      const target = Number.isFinite(paramValue)
        ? paramValue
        : sorted[Math.min(1, sorted.length - 1)];

      events.push({
        t: 'note',
        text: `Searching BST to remove node ${target}.`,
      });

      let curId: string | undefined = rootId;
      let targetId: string | null = null;
      while (curId) {
        const node: BstNodeInfo = nodes[curId];
        events.push({ t: 'visit', id: curId });
        if (node.val === target) {
          targetId = curId;
          break;
        }
        const goLeft = target < node.val;
        const nextId: string | undefined = goLeft ? node.left : node.right;
        if (nextId) {
          events.push({
            t: 'note',
            text: `${target} is ${goLeft ? 'smaller' : 'bigger'} than ${node.val} → go ${goLeft ? 'LEFT' : 'RIGHT'}.`,
          });
        }
        curId = nextId;
      }

      if (!targetId) {
        events.push(
          { t: 'note', text: `Value ${target} was not found in the BST — nothing removed.` },
          { t: 'done' },
        );
        break;
      }

      const targetNode = nodes[targetId];
      if (!targetNode.left && !targetNode.right) {
        events.push({
          t: 'note',
          text: `Found leaf node ${target}. Removing it directly from parent ${targetNode.parent ? nodes[targetNode.parent].val : 'root'}.`,
        });
        if (targetNode.parent) {
          events.push({ t: 'unlink', from: targetNode.parent, to: targetId });
        }
        events.push(
          { t: 'remove', id: targetId },
          { t: 'note', text: `Deleted leaf node ${target}. The BST remains valid!` },
          { t: 'done' },
        );
      } else if (!targetNode.left || !targetNode.right) {
        const onlyChildId = (targetNode.left ?? targetNode.right)!;
        const onlyChild = nodes[onlyChildId];
        events.push({
          t: 'note',
          text: `Found node ${target} with one child (${onlyChild.val}). Replacing it with its child.`,
        });
        if (targetNode.parent && targetNode.side) {
          events.push(
            { t: 'unlink', from: targetNode.parent, to: targetId },
            { t: 'unlink', from: targetId, to: onlyChildId },
            { t: 'remove', id: targetId },
            { t: 'link', from: targetNode.parent, to: onlyChildId, label: targetNode.side },
          );
        } else {
          events.push(
            { t: 'unlink', from: targetId, to: onlyChildId },
            { t: 'remove', id: targetId },
          );
        }
        events.push(
          { t: 'note', text: `Deleted node ${target} and promoted ${onlyChild.val}. The BST remains valid!` },
          { t: 'done' },
        );
      } else {
        // Internal node with 2 children: replace with leftmost node in right subtree (in-order successor)
        let succId = targetNode.right;
        while (nodes[succId].left) {
          succId = nodes[succId].left!;
        }
        const succNode = nodes[succId];
        events.push(
          {
            t: 'note',
            text: `Found node ${target} with two children. Replacing with its in-order successor (${succNode.val}).`,
          },
          { t: 'compare', a: { id: targetId }, b: { id: succId } },
          { t: 'set', target: { id: targetId }, value: succNode.val },
        );
        if (succNode.right && succNode.parent && succNode.side) {
          events.push(
            { t: 'unlink', from: succId, to: succNode.right },
            { t: 'unlink', from: succNode.parent, to: succId },
            { t: 'remove', id: succId },
            { t: 'link', from: succNode.parent, to: succNode.right, label: succNode.side },
          );
        } else {
          events.push(
            { t: 'unlink', from: succNode.parent!, to: succId },
            { t: 'remove', id: succId },
          );
        }
        events.push(
          {
            t: 'note',
            text: `Copied ${succNode.val} into the node and removed old successor. The BST remains valid!`,
          },
          { t: 'done' },
        );
      }
      const removeIdx = sorted.indexOf(target);
      if (removeIdx >= 0) {
        const remaining = sorted.filter((_, idx) => idx !== removeIdx);
        updatedValues = remaining.length > 0 ? remaining : undefined;
      }
      break;
    }

    case 'tree-inorder': {
      const { rootId, nodes } = emitBaseBst(events, customValues);
      const visitedVals: number[] = [];
      events.push({
        t: 'note',
        text: 'Inorder Traversal (Left → Root → Right) visits a BST in ascending sorted order!',
      });
      const walk = (id?: string) => {
        if (!id) return;
        const node = nodes[id];
        walk(node.left);
        visitedVals.push(node.val);
        events.push(
          { t: 'visit', id },
          { t: 'note', text: `Visited ${node.val} (Inorder: Left → Root → Right).` },
        );
        walk(node.right);
      };
      walk(rootId);
      events.push(
        {
          t: 'note',
          text: `Inorder Traversal complete! Sorted output: ${visitedVals.join(', ')}.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'tree-preorder': {
      const { rootId, nodes } = emitBaseBst(events, customValues);
      const visitedVals: number[] = [];
      events.push({
        t: 'note',
        text: 'Preorder Traversal (Root → Left → Right): visit each parent before its children.',
      });
      const walk = (id?: string) => {
        if (!id) return;
        const node = nodes[id];
        visitedVals.push(node.val);
        events.push(
          { t: 'visit', id },
          { t: 'note', text: `Visited ${node.val} (Preorder: Root before subtrees).` },
        );
        walk(node.left);
        walk(node.right);
      };
      walk(rootId);
      events.push(
        {
          t: 'note',
          text: `Preorder Traversal complete: ${visitedVals.join(', ')}.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'tree-postorder': {
      const { rootId, nodes } = emitBaseBst(events, customValues);
      const visitedVals: number[] = [];
      events.push({
        t: 'note',
        text: 'Postorder Traversal (Left → Right → Root): visit children before their parent.',
      });
      const walk = (id?: string) => {
        if (!id) return;
        const node = nodes[id];
        walk(node.left);
        walk(node.right);
        visitedVals.push(node.val);
        events.push(
          { t: 'visit', id },
          { t: 'note', text: `Visited ${node.val} (Postorder: children finished before parent).` },
        );
      };
      walk(rootId);
      events.push(
        {
          t: 'note',
          text: `Postorder Traversal complete: ${visitedVals.join(', ')}.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'tree-levelorder': {
      const { rootId, nodes } = emitBaseBst(events, customValues);
      const visitedVals: number[] = [];
      events.push({
        t: 'note',
        text: 'Level-Order Traversal (BFS): visits the tree level by level from top to bottom.',
      });
      const queue: { id: string; lvl: number }[] = [{ id: rootId, lvl: 1 }];
      while (queue.length > 0) {
        const { id, lvl } = queue.shift()!;
        const node = nodes[id];
        visitedVals.push(node.val);
        events.push(
          { t: 'visit', id },
          { t: 'note', text: `Level ${lvl}: visited node ${node.val}.` },
        );
        if (node.left) queue.push({ id: node.left, lvl: lvl + 1 });
        if (node.right) queue.push({ id: node.right, lvl: lvl + 1 });
      }
      events.push(
        {
          t: 'note',
          text: `Level-Order Traversal complete: ${visitedVals.join(', ')}.`,
        },
        { t: 'done' },
      );
      break;
    }

    // ==========================================
    // AVL TREE OPERATIONS (Week 12)
    // ==========================================
    case 'avl-ll': {
      const [minV, midV, maxV] = pickThreeDistinctSorted(customValues);
      emitAvlRotationCase(events, 'LL', minV, midV, maxV);
      updatedValues = [minV, midV, maxV];
      break;
    }

    case 'avl-rr': {
      const [minV, midV, maxV] = pickThreeDistinctSorted(customValues);
      emitAvlRotationCase(events, 'RR', minV, midV, maxV);
      updatedValues = [minV, midV, maxV];
      break;
    }

    case 'avl-lr': {
      const [minV, midV, maxV] = pickThreeDistinctSorted(customValues);
      emitAvlRotationCase(events, 'LR', minV, midV, maxV);
      updatedValues = [minV, midV, maxV];
      break;
    }

    case 'avl-rl': {
      const [minV, midV, maxV] = pickThreeDistinctSorted(customValues);
      emitAvlRotationCase(events, 'RL', minV, midV, maxV);
      updatedValues = [minV, midV, maxV];
      break;
    }

    case 'avl-insert': {
      const val = Number.isFinite(paramValue) ? paramValue : 25;
      updatedValues = runAvlInsertTrace(events, customValues, val);
      break;
    }

    case 'avl-rotation': {
      const distinct: number[] = [];
      if (customValues) {
        for (const n of customValues) {
          if (!distinct.includes(n)) distinct.push(n);
          if (distinct.length === 3) break;
        }
      }
      const [a, b, c] = distinct.length === 3 ? distinct : [30, 20, 10];
      const [minV, midV, maxV] = [a, b, c].sort((x, y) => x - y);
      const isLL = a > b && b > c;
      const isRR = a < b && b < c;
      const isLR = a > b && c > b && c < a;
      const isRL = a < b && c < b && c > a;

      if (isLL) {
        emitAvlRotationCase(
          events,
          'LL',
          minV,
          midV,
          maxV,
          `Inserted ${a}, ${b}, ${c}: tree leans heavily to the left (Left-Left imbalance, balance factor = +2).`,
        );
      } else if (isLR) {
        emitAvlRotationCase(
          events,
          'LR',
          minV,
          midV,
          maxV,
          `Inserted ${a}, ${b}, ${c}: Left-Right imbalance at ${a} (balance factor = +2).`,
        );
      } else if (isRL) {
        emitAvlRotationCase(
          events,
          'RL',
          minV,
          midV,
          maxV,
          `Inserted ${a}, ${b}, ${c}: Right-Left imbalance at ${a} (balance factor = -2).`,
        );
      } else {
        const intro = isRR
          ? `Inserted ${minV}, ${midV}, ${maxV}: tree leans heavily to the right (Right-Right imbalance, balance factor = -2).`
          : `Using ${minV}, ${midV}, ${maxV} in ascending order to demonstrate a Right-Right imbalance (balance factor = -2).`;
        emitAvlRotationCase(events, 'RR', minV, midV, maxV, intro);
      }
      updatedValues = [minV, midV, maxV];
      break;
    }

    // ==========================================
    // BINARY HEAP & PRIORITY QUEUE (Week 10)
    // ==========================================
    case 'heap-insert': {
      const val = Number.isFinite(paramValue) ? paramValue : 95;
      const base =
        customValues && customValues.length >= 1
          ? customValues.slice(0, 23)
          : [90, 70, 80, 40, 50];
      const arr = buildMaxHeapArray(base);
      emitCompleteBinaryTree(events, arr);

      const insertIdx = arr.length;
      arr.push(val);
      events.push(
        {
          t: 'note',
          text: `Max-Heap: every parent is bigger than its children. Inserting ${val} at index ${insertIdx}.`,
        },
        { t: 'create', id: heapId(insertIdx), kind: 'node', value: val },
      );

      if (insertIdx > 0) {
        const parentIdx = Math.floor((insertIdx - 1) / 2);
        events.push(
          {
            t: 'link',
            from: heapId(parentIdx),
            to: heapId(insertIdx),
            label: insertIdx % 2 === 1 ? 'left' : 'right',
          },
          {
            t: 'note',
            text: `Placed ${val} under ${arr[parentIdx]}. Now we Bubble Up (siftUp) while ${val} is bigger than its parent!`,
          },
        );
      }

      let idx = insertIdx;
      while (idx > 0) {
        const parentIdx = Math.floor((idx - 1) / 2);
        events.push(
          { t: 'compare', a: { id: heapId(idx) }, b: { id: heapId(parentIdx) } },
          {
            t: 'note',
            text: `Comparing ${arr[idx]} with its parent ${arr[parentIdx]}.`,
          },
        );
        if (arr[idx] > arr[parentIdx]) {
          events.push(
            { t: 'swap', a: { id: heapId(idx) }, b: { id: heapId(parentIdx) } },
            {
              t: 'note',
              text: `${arr[idx]} is bigger than ${arr[parentIdx]}, so they swap places!`,
            },
          );
          const tmp = arr[idx];
          arr[idx] = arr[parentIdx];
          arr[parentIdx] = tmp;
          idx = parentIdx;
        } else {
          events.push(
            { t: 'visit', id: heapId(idx) },
            {
              t: 'note',
              text:
                idx === insertIdx
                  ? `${arr[idx]} ≤ parent ${arr[parentIdx]}, so no swap is needed — Max-Heap property already holds!`
                  : `${arr[idx]} ≤ parent ${arr[parentIdx]}, so Bubble Up stops — Max-Heap property holds!`,
            },
          );
          break;
        }
      }
      if (idx === 0) {
        events.push(
          { t: 'visit', id: heapId(0) },
          {
            t: 'note',
            text: `${arr[0]} is now the new maximum at the root of the Heap!`,
          },
        );
      }
      updatedValues = arr;
      events.push({ t: 'done' });
      break;
    }

    case 'heap-extract': {
      const base =
        customValues && customValues.length >= 1
          ? customValues.slice(0, 24)
          : [95, 70, 85, 40, 50];
      const arr = buildMaxHeapArray(base);
      emitCompleteBinaryTree(events, arr);

      if (arr.length === 1) {
        events.push(
          { t: 'note', text: `Extracting root max ${arr[0]} (only element in the heap).` },
          { t: 'visit', id: heapId(0) },
          { t: 'remove', id: heapId(0) },
          { t: 'note', text: `Extracted ${arr[0]}. The Max-Heap is now empty.` },
          { t: 'done' },
        );
        updatedValues = [];
        break;
      }

      const maxVal = arr[0];
      const lastIdx = arr.length - 1;
      const lastVal = arr[lastIdx];
      const parentOfLast = Math.floor((lastIdx - 1) / 2);

      events.push(
        {
          t: 'note',
          text: `Max-Heap root holds the largest number (${maxVal}). Extracting ${maxVal} and moving last leaf (${lastVal}) to root.`,
        },
        { t: 'visit', id: heapId(0) },
        { t: 'set', target: { id: heapId(0) }, value: lastVal },
        { t: 'unlink', from: heapId(parentOfLast), to: heapId(lastIdx) },
        { t: 'remove', id: heapId(lastIdx) },
      );

      arr[0] = lastVal;
      arr.pop();
      emitSiftDown(events, arr, 0, arr.length);

      events.push(
        {
          t: 'note',
          text: `Extract Max complete! Extracted ${maxVal}; new root max is ${arr[0]}.`,
        },
        { t: 'done' },
      );
      updatedValues = arr;
      break;
    }

    case 'heap-build': {
      const arr =
        customValues && customValues.length >= 1
          ? [...customValues].slice(0, 24)
          : [40, 20, 60, 10, 50, 30];
      emitCompleteBinaryTree(events, arr);

      const lastInternal = Math.floor(arr.length / 2) - 1;
      events.push({
        t: 'note',
        text: `Building Max-Heap in O(n) from [${arr.join(', ')}] using bottom-up heapify (indices ${Math.max(0, lastInternal)} down to 0).`,
      });

      for (let start = lastInternal; start >= 0; start--) {
        events.push(
          { t: 'visit', id: heapId(start) },
          { t: 'note', text: `Heapifying subtree rooted at index ${start} (value ${arr[start]}).` },
        );
        emitSiftDown(events, arr, start, arr.length);
      }

      events.push(
        {
          t: 'note',
          text: `Build Max-Heap complete! Root max is ${arr[0]} ([${arr.join(', ')}]).`,
        },
        { t: 'done' },
      );
      updatedValues = arr;
      break;
    }

    case 'heap-sort': {
      const arr =
        customValues && customValues.length >= 1
          ? [...customValues].slice(0, 24)
          : [40, 20, 60, 10, 50, 30];
      emitCompleteBinaryTree(events, arr);

      const lastInternal = Math.floor(arr.length / 2) - 1;
      events.push({
        t: 'note',
        text: `Heap Sort Phase 1: Building Max-Heap from [${arr.join(', ')}].`,
      });
      for (let start = lastInternal; start >= 0; start--) {
        emitSiftDown(events, arr, start, arr.length);
      }

      events.push({
        t: 'note',
        text: `Heap Sort Phase 2: Repeatedly extract root max and sift down remaining heap.`,
      });

      const sorted: number[] = [];
      for (let end = arr.length - 1; end > 0; end--) {
        const maxVal = arr[0];
        events.push(
          { t: 'swap', a: { id: heapId(0) }, b: { id: heapId(end) } },
          {
            t: 'note',
            text: `Swapped max ${maxVal} to sorted position ${end}, removing leaf from active heap.`,
          },
          {
            t: 'unlink',
            from: heapId(Math.floor((end - 1) / 2)),
            to: heapId(end),
          },
          { t: 'remove', id: heapId(end) },
        );
        const tmp = arr[0];
        arr[0] = arr[end];
        arr[end] = tmp;
        sorted.unshift(maxVal);
        emitSiftDown(events, arr, 0, end);
      }
      if (arr.length > 0) {
        sorted.unshift(arr[0]);
      }

      events.push(
        {
          t: 'note',
          text: `Heap Sort complete! Sorted ascending: [${sorted.join(', ')}].`,
        },
        { t: 'done' },
      );
      updatedValues = sorted;
      break;
    }

    // ==========================================
    // GRAPH OPERATIONS (Weeks 13 & 14)
    // ==========================================
    case 'graph-bfs': {
      emitBaseGraph(events);
      events.push(
        {
          t: 'note',
          text: 'Breadth-First Search (BFS) starting from node 0: explores neighbours layer by layer using a Queue.',
        },
        { t: 'visit', id: 'v-0' },
        { t: 'note', text: 'Started at node 0. Added its direct neighbours (1 and 2) to the queue.' },
        { t: 'visit', id: 'v-1' },
        { t: 'note', text: 'Visited node 1 (1 hop away from 0). Added neighbour 3 to the queue.' },
        { t: 'visit', id: 'v-2' },
        { t: 'note', text: 'Visited node 2 (1 hop away from 0). Added neighbour 4 to the queue.' },
        { t: 'visit', id: 'v-3' },
        { t: 'note', text: 'Visited node 3 (2 hops away from 0). Added neighbour 5 to the queue.' },
        { t: 'visit', id: 'v-4' },
        { t: 'note', text: 'Visited node 4 (2 hops away from 0).' },
        { t: 'visit', id: 'v-5' },
        {
          t: 'note',
          text: 'Visited node 5! BFS complete in layer order: 0 → 1 → 2 → 3 → 4 → 5.',
        },
        { t: 'done' },
      );
      break;
    }

    case 'graph-dfs': {
      emitBaseGraph(events);
      events.push(
        {
          t: 'note',
          text: 'Depth-First Search (DFS) starting at node 0: plunges deep along one path before backtracking.',
        },
        { t: 'visit', id: 'v-0' },
        { t: 'note', text: 'Visited 0 → diving deep to neighbour 1.' },
        { t: 'visit', id: 'v-1' },
        { t: 'note', text: 'Visited 1 → diving deep to neighbour 3.' },
        { t: 'visit', id: 'v-3' },
        { t: 'note', text: 'Visited 3 → diving deep to neighbour 5.' },
        { t: 'visit', id: 'v-5' },
        { t: 'note', text: 'Reached dead-end at 5! Backtracking to explore unvisited branch from 0 → 2.' },
        { t: 'visit', id: 'v-2' },
        { t: 'note', text: 'Visited 2 → moving to neighbour 4.' },
        { t: 'visit', id: 'v-4' },
        {
          t: 'note',
          text: 'DFS complete! Visited order: 0 → 1 → 3 → 5 → 2 → 4.',
        },
        { t: 'done' },
      );
      break;
    }

    case 'graph-dijkstra': {
      emitBaseGraph(events);
      events.push(
        {
          t: 'note',
          text: "Dijkstra's Shortest Path from node 0: always picks the unvisited node with the smallest total distance.",
        },
        { t: 'visit', id: 'v-0' },
        { t: 'note', text: 'Distance to node 0 is 0. Edge 0→2 costs 2, Edge 0→1 costs 4.' },
        { t: 'compare', a: { id: 'v-0' }, b: { id: 'v-2' } },
        { t: 'visit', id: 'v-2' },
        {
          t: 'note',
          text: 'Node 2 is closest (distance 2). Via node 2, we find a shortcut to node 1: 2 + 1 = 3 (cheaper than 4)!',
        },
        { t: 'compare', a: { id: 'v-2' }, b: { id: 'v-1' } },
        { t: 'visit', id: 'v-1' },
        { t: 'note', text: 'Locked in shortest distance to node 1 (cost 3). Path to node 3 is 3 + 5 = 8.' },
        { t: 'visit', id: 'v-3' },
        { t: 'note', text: 'Locked in node 3 (cost 8). Path to node 5 is 8 + 2 = 10.' },
        { t: 'visit', id: 'v-4' },
        { t: 'visit', id: 'v-5' },
        {
          t: 'note',
          text: 'Dijkstra complete! Shortest path from 0 to 5 is 0 → 2 → 1 → 3 → 5 (total cost 10).',
        },
        { t: 'done' },
      );
      break;
    }

    case 'graph-prim':
    case 'graph-kruskal':
    case 'graph-toposort': {
      emitBaseGraph(events);
      events.push(
        {
          t: 'note',
          text:
            opId === 'graph-toposort'
              ? 'Topological Sort: ordering nodes so every arrow points forward (dependencies first).'
              : 'Minimum Spanning Tree: connecting all 6 nodes using the cheapest edges without creating any loops.',
        },
        { t: 'visit', id: 'v-0' },
        { t: 'compare', a: { id: 'v-0' }, b: { id: 'v-2' } },
        { t: 'visit', id: 'v-2' },
        { t: 'note', text: 'Selected edge 0 → 2 (weight 2).' },
        { t: 'compare', a: { id: 'v-2' }, b: { id: 'v-1' } },
        { t: 'visit', id: 'v-1' },
        { t: 'note', text: 'Selected edge 2 → 1 (weight 1).' },
        { t: 'compare', a: { id: 'v-1' }, b: { id: 'v-3' } },
        { t: 'visit', id: 'v-3' },
        { t: 'note', text: 'Selected edge 1 → 3 (weight 5).' },
        { t: 'compare', a: { id: 'v-4' }, b: { id: 'v-3' } },
        { t: 'visit', id: 'v-4' },
        { t: 'visit', id: 'v-5' },
        {
          t: 'note',
          text: 'All 6 nodes are connected with minimum total weight (13) and zero cycles!',
        },
        { t: 'done' },
      );
      break;
    }

    // ==========================================
    // HASH TABLE OPERATIONS (Week 15)
    // ==========================================
    case 'hash-linear':
    case 'hash-quadratic':
    case 'hash-double': {
      const buckets: (number | null)[] = [null, 15, 22, null, 18, null, null];
      events.push({ t: 'create', id: 'arr', kind: 'array', value: 7 });
      buckets.forEach((v, idx) => {
        events.push({ t: 'set', target: { id: 'arr', index: idx }, value: v ?? 0 });
      });
      const key = Number.isFinite(paramValue) ? paramValue : 29;
      const h1 = ((key % 7) + 7) % 7;
      const step2 = 5 - (((Math.abs(key) % 5) + 5) % 5);
      const probeMethod =
        opId === 'hash-linear'
          ? 'Linear Probing (+1)'
          : opId === 'hash-quadratic'
            ? 'Quadratic Probing (+i²)'
            : `Double Hashing (step2=${step2})`;

      events.push({
        t: 'note',
        text: `Hash Table (7 buckets, ${probeMethod}). Inserting key ${key}: hash(${key}) = ${key} % 7 = ${h1}.`,
      });

      for (let i = 0; i < 7; i++) {
        const idx =
          opId === 'hash-linear'
            ? (h1 + i) % 7
            : opId === 'hash-quadratic'
              ? (h1 + i * i) % 7
              : (h1 + i * step2) % 7;
        if (buckets[idx] !== null) {
          events.push(
            { t: 'compare', a: { id: 'arr', index: idx }, b: { id: 'arr', index: idx } },
            {
              t: 'note',
              text: `Collision at index ${idx} (already holds ${buckets[idx]})! Probing next slot...`,
            },
          );
        } else {
          events.push(
            { t: 'set', target: { id: 'arr', index: idx }, value: key },
            { t: 'visit', id: `arr[${idx}]` },
            {
              t: 'note',
              text: `Index ${idx} is empty! Stored key ${key} at bucket [${idx}].`,
            },
          );
          break;
        }
      }
      events.push({ t: 'done' });
      break;
    }

    case 'hash-chaining': {
      const val = Number.isFinite(paramValue) ? paramValue : 36;
      const bucketIdx = ((val % 3) + 3) % 3;
      const bucketId = `b-${bucketIdx}`;
      events.push(
        { t: 'create', id: 'b-0', kind: 'node', value: 'B0' },
        { t: 'create', id: 'b-1', kind: 'node', value: 'B1:15' },
        { t: 'create', id: 'b-2', kind: 'node', value: 'B2:22' },
        { t: 'create', id: 'c-1', kind: 'node', value: 29 },
        { t: 'link', from: 'b-1', to: 'c-1', label: 'chain' },
        {
          t: 'note',
          text: `Separate Chaining (3 buckets): hashing ${val} → ${val} % 3 = Bucket ${bucketIdx}.`,
        },
        { t: 'visit', id: bucketId },
      );
      if (bucketIdx === 1) {
        events.push(
          { t: 'visit', id: 'c-1' },
          { t: 'create', id: 'c-2', kind: 'node', value: val },
          { t: 'link', from: 'c-1', to: 'c-2', label: 'chain' },
          { t: 'visit', id: 'c-2' },
          {
            t: 'note',
            text: `Appended ${val} to Bucket 1's chain: 15 → 29 → ${val}!`,
          },
        );
      } else {
        events.push(
          { t: 'create', id: 'c-2', kind: 'node', value: val },
          { t: 'link', from: bucketId, to: 'c-2', label: 'chain' },
          { t: 'visit', id: 'c-2' },
          {
            t: 'note',
            text: `Chained ${val} directly onto Bucket ${bucketIdx}!`,
          },
        );
      }
      events.push({ t: 'done' });
      break;
    }
  }

  return {
    events,
    meta,
    scene: def.scene,
    updatedValues,
  };
}
