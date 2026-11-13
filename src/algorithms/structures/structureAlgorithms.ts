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
  // Queue & Deque (Week 5)
  | 'queue-enqueue'
  | 'queue-dequeue'
  | 'circular-queue'
  | 'deque-ops'
  // Binary Tree, BST & AVL (Weeks 9, 11, 12)
  | 'bst-insert'
  | 'bst-search'
  | 'bst-delete'
  | 'tree-inorder'
  | 'tree-preorder'
  | 'tree-postorder'
  | 'tree-levelorder'
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
  {
    id: 'deque-ops',
    scene: 'queue',
    label: 'Deque Add & Remove Both Ends',
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
  {
    id: 'avl-rotation',
    scene: 'bst',
    label: 'AVL Tree Rebalance Rotation',
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

function emitBaseBst(events: TraceEvent[], customValues?: number[]) {
  let sorted = [20, 30, 40, 50, 60, 70, 85];
  if (customValues && customValues.length >= 3) {
    const padded = [...customValues];
    while (padded.length < 7) {
      padded.push((padded[padded.length - 1] ?? 50) + 12);
    }
    sorted = padded.slice(0, 7).sort((a, b) => a - b);
  }
  const [v20, v30, v40, v50, v60, v70, v85] = sorted;
  events.push(
    { t: 'create', id: 'bst-50', kind: 'node', value: v50 },
    { t: 'create', id: 'bst-30', kind: 'node', value: v30 },
    { t: 'create', id: 'bst-70', kind: 'node', value: v70 },
    { t: 'create', id: 'bst-20', kind: 'node', value: v20 },
    { t: 'create', id: 'bst-40', kind: 'node', value: v40 },
    { t: 'create', id: 'bst-60', kind: 'node', value: v60 },
    { t: 'create', id: 'bst-85', kind: 'node', value: v85 },
    { t: 'link', from: 'bst-50', to: 'bst-30', label: 'left' },
    { t: 'link', from: 'bst-50', to: 'bst-70', label: 'right' },
    { t: 'link', from: 'bst-30', to: 'bst-20', label: 'left' },
    { t: 'link', from: 'bst-30', to: 'bst-40', label: 'right' },
    { t: 'link', from: 'bst-70', to: 'bst-60', label: 'left' },
    { t: 'link', from: 'bst-70', to: 'bst-85', label: 'right' },
  );
  return sorted;
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
  bst: {
    title: 'Binary Search Tree (Select an Operation)',
    defaultCorpus: '11_binary_search_tree/binary_search_tree.cpp',
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
      const stkVals =
        customValues && customValues.length >= 3
          ? customValues.slice(0, 3)
          : [15, 30, 45];
      events.push(
        { t: 'create', id: 'stk-0', kind: 'node', value: stkVals[0] },
        { t: 'create', id: 'stk-1', kind: 'node', value: stkVals[1] },
        { t: 'create', id: 'stk-2', kind: 'node', value: stkVals[2] },
        { t: 'link', from: 'stk-1', to: 'stk-0', label: 'below' },
        { t: 'link', from: 'stk-2', to: 'stk-1', label: 'below' },
        { t: 'note', text: `Loaded Stack: [${stkVals.join(', ')}] (top is ${stkVals[2]}).` },
        { t: 'note', text: 'Select an operation, set Value if needed, then click Run.' },
        { t: 'done' },
      );
      break;
    }
    case 'queue': {
      const qVals =
        customValues && customValues.length >= 3
          ? customValues.slice(0, 3)
          : [10, 20, 30];
      events.push(
        { t: 'create', id: 'q-0', kind: 'node', value: qVals[0] },
        { t: 'create', id: 'q-1', kind: 'node', value: qVals[1] },
        { t: 'create', id: 'q-2', kind: 'node', value: qVals[2] },
        { t: 'link', from: 'q-0', to: 'q-1', label: 'next' },
        { t: 'link', from: 'q-1', to: 'q-2', label: 'next' },
        { t: 'note', text: `Loaded Queue: ${qVals.join(' → ')} (front is ${qVals[0]}).` },
        { t: 'note', text: 'Select an operation, set Value if needed, then click Run.' },
        { t: 'done' },
      );
      break;
    }
    case 'bst': {
      const sorted = emitBaseBst(events, customValues);
      events.push(
        { t: 'note', text: `Loaded Binary Search Tree with root ${sorted[3]} (${sorted.join(', ')}).` },
        { t: 'note', text: 'Select an operation, set Value/Target if needed, then click Run.' },
        { t: 'done' },
      );
      break;
    }
    case 'heap': {
      const heapVals =
        customValues && customValues.length >= 5
          ? [...customValues].slice(0, 5).sort((a, b) => b - a)
          : [90, 70, 80, 40, 50];
      events.push(
        { t: 'create', id: 'bst-50', kind: 'node', value: heapVals[0] },
        { t: 'create', id: 'bst-30', kind: 'node', value: heapVals[1] },
        { t: 'create', id: 'bst-70', kind: 'node', value: heapVals[2] },
        { t: 'create', id: 'bst-20', kind: 'node', value: heapVals[3] },
        { t: 'create', id: 'bst-40', kind: 'node', value: heapVals[4] },
        { t: 'link', from: 'bst-50', to: 'bst-30', label: 'left' },
        { t: 'link', from: 'bst-50', to: 'bst-70', label: 'right' },
        { t: 'link', from: 'bst-30', to: 'bst-20', label: 'left' },
        { t: 'link', from: 'bst-30', to: 'bst-40', label: 'right' },
        { t: 'note', text: `Loaded Max-Heap with root max ${heapVals[0]}.` },
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

export function runStructureOperation(
  opId: StructureOperationId,
  paramValue = 35,
  customValues?: number[],
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
            { t: 'unlink', from: nodeIds[0], to: nodeIds[1] },
            {
              t: 'note',
              text: `Detached ${vals[0]} from ${vals[1]} so ${vals[0]} now points to nothing (it becomes the new tail).`,
            },
          );
        }
        for (let i = 1; i < nodeIds.length; i++) {
          events.push({ t: 'visit', id: nodeIds[i] });
          if (nodeIds[i + 1]) {
            events.push({ t: 'unlink', from: nodeIds[i], to: nodeIds[i + 1] });
          }
          events.push(
            { t: 'link', from: nodeIds[i], to: nodeIds[i - 1], label: 'next' },
            {
              t: 'note',
              text: `Flipped arrow so ${vals[i]} now points back to ${vals[i - 1]}.`,
            },
          );
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
      const stkVals =
        customValues && customValues.length >= 3
          ? customValues.slice(0, 3)
          : [15, 30, 45];
      const val = Number.isFinite(paramValue) ? paramValue : 50;
      updatedValues = [...stkVals, val];
      events.push(
        { t: 'create', id: 'stk-0', kind: 'node', value: stkVals[0] },
        { t: 'create', id: 'stk-1', kind: 'node', value: stkVals[1] },
        { t: 'create', id: 'stk-2', kind: 'node', value: stkVals[2] },
        { t: 'link', from: 'stk-1', to: 'stk-0', label: 'below' },
        { t: 'link', from: 'stk-2', to: 'stk-1', label: 'below' },
        {
          t: 'note',
          text: `Stack currently has ${stkVals[0]}, ${stkVals[1]}, and ${stkVals[2]} on top. Pushing ${val} onto the top of the stack.`,
        },
        { t: 'line', line: 17 },
        { t: 'create', id: 'stk-3', kind: 'node', value: val },
        { t: 'link', from: 'stk-3', to: 'stk-2', label: 'below' },
        { t: 'visit', id: 'stk-3' },
        {
          t: 'note',
          text: `Done! ${val} is now sitting at the TOP of the stack (Last-In, First-Out).`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'stack-pop': {
      const stkVals =
        customValues && customValues.length >= 4
          ? customValues.slice(0, 4)
          : [15, 30, 45, 60];
      updatedValues = stkVals.slice(0, 3);
      events.push(
        { t: 'create', id: 'stk-0', kind: 'node', value: stkVals[0] },
        { t: 'create', id: 'stk-1', kind: 'node', value: stkVals[1] },
        { t: 'create', id: 'stk-2', kind: 'node', value: stkVals[2] },
        { t: 'create', id: 'stk-3', kind: 'node', value: stkVals[3] },
        { t: 'link', from: 'stk-1', to: 'stk-0', label: 'below' },
        { t: 'link', from: 'stk-2', to: 'stk-1', label: 'below' },
        { t: 'link', from: 'stk-3', to: 'stk-2', label: 'below' },
        {
          t: 'note',
          text: `The top of the stack is ${stkVals[3]}. Pop removes the top item first (LIFO).`,
        },
        { t: 'line', line: 21 },
        { t: 'visit', id: 'stk-3' },
        { t: 'note', text: `Inspecting top element ${stkVals[3]} before popping it off.` },
        { t: 'unlink', from: 'stk-3', to: 'stk-2' },
        { t: 'remove', id: 'stk-3' },
        { t: 'visit', id: 'stk-2' },
        {
          t: 'note',
          text: `Popped ${stkVals[3]}! Now ${stkVals[2]} becomes the new TOP of the stack.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'stack-peek': {
      const stkVals =
        customValues && customValues.length >= 3
          ? customValues.slice(0, 3)
          : [15, 30, 45];
      events.push(
        { t: 'create', id: 'stk-0', kind: 'node', value: stkVals[0] },
        { t: 'create', id: 'stk-1', kind: 'node', value: stkVals[1] },
        { t: 'create', id: 'stk-2', kind: 'node', value: stkVals[2] },
        { t: 'link', from: 'stk-1', to: 'stk-0', label: 'below' },
        { t: 'link', from: 'stk-2', to: 'stk-1', label: 'below' },
        {
          t: 'note',
          text: 'Checking the top of the stack without removing anything (peek).',
        },
        { t: 'line', line: 25 },
        { t: 'visit', id: 'stk-2' },
        {
          t: 'note',
          text: `Top of stack is ${stkVals[2]}! The stack remains unchanged.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'stack-brackets': {
      events.push(
        {
          t: 'note',
          text: 'Checking if "{ [ ( ) ] }" has balanced brackets using a Stack.',
        },
        { t: 'create', id: 'stk-0', kind: 'node', value: '{' },
        { t: 'note', text: 'Read "{": opening bracket, so push "{" onto the stack.' },
        { t: 'create', id: 'stk-1', kind: 'node', value: '[' },
        { t: 'link', from: 'stk-1', to: 'stk-0', label: 'below' },
        { t: 'note', text: 'Read "[": opening bracket, so push "[" onto the stack.' },
        { t: 'create', id: 'stk-2', kind: 'node', value: '(' },
        { t: 'link', from: 'stk-2', to: 'stk-1', label: 'below' },
        { t: 'note', text: 'Read "(": opening bracket, so push "(" onto the stack.' },
        { t: 'visit', id: 'stk-2' },
        { t: 'unlink', from: 'stk-2', to: 'stk-1' },
        { t: 'remove', id: 'stk-2' },
        { t: 'note', text: 'Read ")": matches "(" on top of the stack! Pop "(".' },
        { t: 'visit', id: 'stk-1' },
        { t: 'unlink', from: 'stk-1', to: 'stk-0' },
        { t: 'remove', id: 'stk-1' },
        { t: 'note', text: 'Read "]": matches "[" on top of the stack! Pop "[".' },
        { t: 'visit', id: 'stk-0' },
        { t: 'remove', id: 'stk-0' },
        {
          t: 'note',
          text: 'Read "}": matches "{"! Stack is now completely empty — brackets are balanced!',
        },
        { t: 'done' },
      );
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
      events.push(
        { t: 'create', id: 'stk-0', kind: 'node', value: 30 },
        { t: 'create', id: 'stk-1', kind: 'node', value: 20 },
        { t: 'create', id: 'stk-2', kind: 'node', value: 10 },
        { t: 'link', from: 'stk-0', to: 'peg-A', label: 'peg' },
        { t: 'link', from: 'stk-1', to: 'peg-A', label: 'peg' },
        { t: 'link', from: 'stk-2', to: 'peg-A', label: 'peg' },
        { t: 'call', fn: 'hanoi', args: [3, 'A', 'C', 'B'], depth: 1 },
        {
          t: 'note',
          text: 'Tower of Hanoi: 3 graduated disks on Peg A (10 smallest on top, 20 middle, 30 largest at base).',
        },
        { t: 'call', fn: 'hanoi', args: [2, 'A', 'B', 'C'], depth: 2 },
        { t: 'call', fn: 'hanoi', args: [1, 'A', 'C', 'B'], depth: 3 },
        { t: 'visit', id: 'stk-2' },
        { t: 'link', from: 'stk-2', to: 'peg-C', label: 'peg' },
        { t: 'note', text: 'Move 1/7: Move smallest disk (10) from Peg A → Peg C.' },
        { t: 'return', fn: 'hanoi', value: 10 },
        { t: 'visit', id: 'stk-1' },
        { t: 'link', from: 'stk-1', to: 'peg-B', label: 'peg' },
        { t: 'note', text: 'Move 2/7: Move middle disk (20) from Peg A → Peg B.' },
        { t: 'call', fn: 'hanoi', args: [1, 'C', 'B', 'A'], depth: 3 },
        { t: 'visit', id: 'stk-2' },
        { t: 'link', from: 'stk-2', to: 'peg-B', label: 'peg' },
        { t: 'note', text: 'Move 3/7: Move smallest disk (10) from Peg C → Peg B (on top of 20).' },
        { t: 'return', fn: 'hanoi', value: 10 },
        { t: 'return', fn: 'hanoi', value: 20 },
        { t: 'visit', id: 'stk-0' },
        { t: 'link', from: 'stk-0', to: 'peg-C', label: 'peg' },
        {
          t: 'note',
          text: 'Move 4/7: Move largest disk (30) from Peg A → destination Peg C!',
        },
        { t: 'call', fn: 'hanoi', args: [2, 'B', 'C', 'A'], depth: 2 },
        { t: 'call', fn: 'hanoi', args: [1, 'B', 'A', 'C'], depth: 3 },
        { t: 'visit', id: 'stk-2' },
        { t: 'link', from: 'stk-2', to: 'peg-A', label: 'peg' },
        { t: 'note', text: 'Move 5/7: Move smallest disk (10) from Peg B → Peg A.' },
        { t: 'return', fn: 'hanoi', value: 10 },
        { t: 'visit', id: 'stk-1' },
        { t: 'link', from: 'stk-1', to: 'peg-C', label: 'peg' },
        { t: 'note', text: 'Move 6/7: Move middle disk (20) from Peg B → Peg C (on top of 30).' },
        { t: 'call', fn: 'hanoi', args: [1, 'A', 'C', 'B'], depth: 3 },
        { t: 'visit', id: 'stk-2' },
        { t: 'link', from: 'stk-2', to: 'peg-C', label: 'peg' },
        {
          t: 'note',
          text: 'Move 7/7: Move smallest disk (10) from Peg A → Peg C! All 3 disks are now stacked on Peg C.',
        },
        { t: 'return', fn: 'hanoi', value: 10 },
        { t: 'return', fn: 'hanoi', value: 20 },
        { t: 'return', fn: 'hanoi', value: 30 },
        { t: 'done' },
      );
      break;
    }

    // ==========================================
    // QUEUE & DEQUE OPERATIONS (Week 5)
    // ==========================================
    case 'queue-enqueue': {
      const qVals =
        customValues && customValues.length >= 3
          ? customValues.slice(0, 3)
          : [10, 20, 30];
      const val = Number.isFinite(paramValue) ? paramValue : 50;
      updatedValues = [...qVals, val];
      events.push(
        { t: 'create', id: 'q-0', kind: 'node', value: qVals[0] },
        { t: 'create', id: 'q-1', kind: 'node', value: qVals[1] },
        { t: 'create', id: 'q-2', kind: 'node', value: qVals[2] },
        { t: 'link', from: 'q-0', to: 'q-1', label: 'next' },
        { t: 'link', from: 'q-1', to: 'q-2', label: 'next' },
        {
          t: 'note',
          text: `Queue has ${qVals[0]} at the FRONT and ${qVals[2]} at the BACK. Adding ${val} to the back of the line.`,
        },
        { t: 'line', line: 19 },
        { t: 'create', id: 'q-3', kind: 'node', value: val },
        { t: 'link', from: 'q-2', to: 'q-3', label: 'next' },
        { t: 'visit', id: 'q-3' },
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
        customValues && customValues.length >= 4
          ? customValues.slice(0, 4)
          : [10, 20, 30, 40];
      updatedValues = qVals.slice(1);
      events.push(
        { t: 'create', id: 'q-0', kind: 'node', value: qVals[0] },
        { t: 'create', id: 'q-1', kind: 'node', value: qVals[1] },
        { t: 'create', id: 'q-2', kind: 'node', value: qVals[2] },
        { t: 'create', id: 'q-3', kind: 'node', value: qVals[3] },
        { t: 'link', from: 'q-0', to: 'q-1', label: 'next' },
        { t: 'link', from: 'q-1', to: 'q-2', label: 'next' },
        { t: 'link', from: 'q-2', to: 'q-3', label: 'next' },
        {
          t: 'note',
          text: `${qVals[0]} is at the FRONT of the queue and has been waiting longest.`,
        },
        { t: 'line', line: 27 },
        { t: 'visit', id: 'q-0' },
        { t: 'note', text: `Serving ${qVals[0]} at the front of the queue.` },
        { t: 'unlink', from: 'q-0', to: 'q-1' },
        { t: 'remove', id: 'q-0' },
        { t: 'visit', id: 'q-1' },
        {
          t: 'note',
          text: `${qVals[0]} has left the queue! Now ${qVals[1]} is at the FRONT of the line.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'circular-queue': {
      events.push(
        { t: 'create', id: 'cq-0', kind: 'node', value: 10 },
        { t: 'create', id: 'cq-1', kind: 'node', value: 20 },
        { t: 'create', id: 'cq-2', kind: 'node', value: 30 },
        { t: 'create', id: 'cq-3', kind: 'node', value: 40 },
        { t: 'link', from: 'cq-0', to: 'cq-1', label: 'next' },
        { t: 'link', from: 'cq-1', to: 'cq-2', label: 'next' },
        { t: 'link', from: 'cq-2', to: 'cq-3', label: 'next' },
        {
          t: 'note',
          text: 'Circular Queue: when the rear reaches the end, it wraps around to slot 0 using modulo.',
        },
        { t: 'visit', id: 'cq-0' },
        { t: 'unlink', from: 'cq-0', to: 'cq-1' },
        { t: 'remove', id: 'cq-0' },
        { t: 'note', text: 'Dequeued 10 from slot 0, freeing up space at the start of the buffer.' },
        { t: 'create', id: 'cq-wrap', kind: 'node', value: 99 },
        { t: 'link', from: 'cq-3', to: 'cq-wrap', label: 'wrap % N' },
        { t: 'link', from: 'cq-wrap', to: 'cq-1', label: 'loop' },
        { t: 'visit', id: 'cq-wrap' },
        {
          t: 'note',
          text: 'Enqueued 99! Rear wrapped around from the end back into the free slot.',
        },
        { t: 'done' },
      );
      break;
    }

    case 'deque-ops': {
      events.push(
        { t: 'create', id: 'q-1', kind: 'node', value: 20 },
        { t: 'create', id: 'q-2', kind: 'node', value: 30 },
        { t: 'link', from: 'q-1', to: 'q-2', label: 'next' },
        {
          t: 'note',
          text: 'Double-Ended Queue (Deque): we can add or remove numbers at BOTH the front and back.',
        },
        { t: 'create', id: 'q-0', kind: 'node', value: 5 },
        { t: 'link', from: 'q-0', to: 'q-1', label: 'front' },
        { t: 'visit', id: 'q-0' },
        { t: 'note', text: 'Inserted 5 directly at the FRONT of the Deque.' },
        { t: 'create', id: 'q-3', kind: 'node', value: 95 },
        { t: 'link', from: 'q-2', to: 'q-3', label: 'rear' },
        { t: 'visit', id: 'q-3' },
        {
          t: 'note',
          text: 'Inserted 95 at the BACK of the Deque. Deque is now: 5, 20, 30, 95.',
        },
        { t: 'done' },
      );
      break;
    }

    // ==========================================
    // BINARY TREE, BST & AVL OPERATIONS (Weeks 9, 11, 12)
    // ==========================================
    case 'bst-insert': {
      const sorted = emitBaseBst(events, customValues);
      const val = Number.isFinite(paramValue) ? paramValue : 45;
      updatedValues = [...sorted.slice(0, 6), val];

      const treeNodes: Record<string, { val: number; left?: string; right?: string }> = {
        'bst-50': { val: sorted[3], left: 'bst-30', right: 'bst-70' },
        'bst-30': { val: sorted[1], left: 'bst-20', right: 'bst-40' },
        'bst-70': { val: sorted[5], left: 'bst-60', right: 'bst-85' },
        'bst-20': { val: sorted[0] },
        'bst-40': { val: sorted[2] },
        'bst-60': { val: sorted[4] },
        'bst-85': { val: sorted[6] },
      };

      events.push(
        {
          t: 'note',
          text: `Inserting ${val} into the Binary Search Tree. Smaller numbers go left; bigger go right.`,
        },
        { t: 'line', line: 17 },
      );

      let curId = 'bst-50';
      while (curId) {
        const node = treeNodes[curId];
        events.push({ t: 'visit', id: curId });
        const goLeft = val < node.val;
        const nextId = goLeft ? node.left : node.right;
        if (nextId) {
          events.push({
            t: 'note',
            text: `Comparing ${val} with ${node.val}: ${val} is ${goLeft ? 'smaller' : 'greater or equal'}, so go ${goLeft ? 'LEFT' : 'RIGHT'} to ${treeNodes[nextId].val}.`,
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
      const sorted = emitBaseBst(events, customValues);
      const target = Number.isFinite(paramValue) ? paramValue : sorted[4];
      const treeNodes: Record<string, { val: number; left?: string; right?: string }> = {
        'bst-50': { val: sorted[3], left: 'bst-30', right: 'bst-70' },
        'bst-30': { val: sorted[1], left: 'bst-20', right: 'bst-40' },
        'bst-70': { val: sorted[5], left: 'bst-60', right: 'bst-85' },
        'bst-20': { val: sorted[0] },
        'bst-40': { val: sorted[2] },
        'bst-60': { val: sorted[4] },
        'bst-85': { val: sorted[6] },
      };

      events.push(
        {
          t: 'note',
          text: `Searching for ${target} in the Binary Search Tree starting at root ${sorted[3]}.`,
        },
        { t: 'line', line: 26 },
      );

      let curId: string | undefined = 'bst-50';
      let steps = 0;
      let found = false;
      while (curId) {
        const node: { val: number; left?: string; right?: string } = treeNodes[curId];
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
            text: `${target} is ${goLeft ? 'smaller' : 'bigger'} than ${node.val}, so we go ${goLeft ? 'LEFT' : 'RIGHT'} to ${treeNodes[nextId].val}.`,
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
      const sorted = emitBaseBst(events, customValues);
      const target = Number.isFinite(paramValue) ? paramValue : sorted[1];
      const treeNodes: Record<
        string,
        { val: number; left?: string; right?: string; parent?: string; side?: 'left' | 'right' }
      > = {
        'bst-50': { val: sorted[3], left: 'bst-30', right: 'bst-70' },
        'bst-30': { val: sorted[1], left: 'bst-20', right: 'bst-40', parent: 'bst-50', side: 'left' },
        'bst-70': { val: sorted[5], left: 'bst-60', right: 'bst-85', parent: 'bst-50', side: 'right' },
        'bst-20': { val: sorted[0], parent: 'bst-30', side: 'left' },
        'bst-40': { val: sorted[2], parent: 'bst-30', side: 'right' },
        'bst-60': { val: sorted[4], parent: 'bst-70', side: 'left' },
        'bst-85': { val: sorted[6], parent: 'bst-70', side: 'right' },
      };

      events.push({
        t: 'note',
        text: `Searching BST to remove node ${target}.`,
      });

      let curId: string | undefined = 'bst-50';
      let targetId: string | null = null;
      while (curId) {
        const node: { val: number; left?: string; right?: string } = treeNodes[curId];
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

      const targetNode = treeNodes[targetId];
      if (!targetNode.left && !targetNode.right) {
        events.push({
          t: 'note',
          text: `Found leaf node ${target}. Removing it directly from parent ${targetNode.parent ? treeNodes[targetNode.parent].val : 'root'}.`,
        });
        if (targetNode.parent) {
          events.push({ t: 'unlink', from: targetNode.parent, to: targetId });
        }
        events.push(
          { t: 'remove', id: targetId },
          { t: 'note', text: `Deleted leaf node ${target}. The BST remains valid!` },
          { t: 'done' },
        );
      } else {
        // Internal node with 2 children: replace with leftmost node in right subtree (in-order successor)
        let succId = targetNode.right!;
        while (treeNodes[succId].left) {
          succId = treeNodes[succId].left!;
        }
        const succNode = treeNodes[succId];
        events.push(
          {
            t: 'note',
            text: `Found node ${target} with two children. Replacing with its in-order successor (${succNode.val}).`,
          },
          { t: 'compare', a: { id: targetId }, b: { id: succId } },
          { t: 'set', target: { id: targetId }, value: succNode.val },
          { t: 'unlink', from: succNode.parent!, to: succId },
          { t: 'remove', id: succId },
          {
            t: 'note',
            text: `Copied ${succNode.val} into the node and removed old leaf. The BST remains valid!`,
          },
          { t: 'done' },
        );
      }
      const removeIdx = sorted.indexOf(target);
      if (removeIdx >= 0) {
        updatedValues = sorted.filter((_, idx) => idx !== removeIdx);
      }
      break;
    }

    case 'tree-inorder': {
      const sorted = emitBaseBst(events, customValues);
      const order: [string, number, string][] = [
        ['bst-20', sorted[0], `Leftmost leaf ${sorted[0]} first.`],
        ['bst-30', sorted[1], `Then parent ${sorted[1]}.`],
        ['bst-40', sorted[2], `Then right child ${sorted[2]}.`],
        ['bst-50', sorted[3], `Now the main root ${sorted[3]}.`],
        ['bst-60', sorted[4], `Left child of right subtree: ${sorted[4]}.`],
        ['bst-70', sorted[5], `Parent of right subtree: ${sorted[5]}.`],
        ['bst-85', sorted[6], `Rightmost leaf ${sorted[6]}.`],
      ];
      events.push({
        t: 'note',
        text: 'Inorder Traversal (Left → Root → Right) visits a BST in ascending sorted order!',
      });
      for (const [id, val, reason] of order) {
        events.push(
          { t: 'visit', id },
          { t: 'note', text: `Visited ${val} — ${reason}` },
        );
      }
      events.push(
        {
          t: 'note',
          text: `Inorder Traversal complete! Sorted output: ${sorted.join(', ')}.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'tree-preorder': {
      const sorted = emitBaseBst(events, customValues);
      const order: [string, number][] = [
        ['bst-50', sorted[3]],
        ['bst-30', sorted[1]],
        ['bst-20', sorted[0]],
        ['bst-40', sorted[2]],
        ['bst-70', sorted[5]],
        ['bst-60', sorted[4]],
        ['bst-85', sorted[6]],
      ];
      events.push({
        t: 'note',
        text: 'Preorder Traversal (Root → Left → Right): visit each parent before its children.',
      });
      for (const [id, val] of order) {
        events.push(
          { t: 'visit', id },
          { t: 'note', text: `Visited ${val} (Preorder: Root before subtrees).` },
        );
      }
      events.push(
        {
          t: 'note',
          text: `Preorder Traversal complete: ${order.map((o) => o[1]).join(', ')}.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'tree-postorder': {
      const sorted = emitBaseBst(events, customValues);
      const order: [string, number][] = [
        ['bst-20', sorted[0]],
        ['bst-40', sorted[2]],
        ['bst-30', sorted[1]],
        ['bst-60', sorted[4]],
        ['bst-85', sorted[6]],
        ['bst-70', sorted[5]],
        ['bst-50', sorted[3]],
      ];
      events.push({
        t: 'note',
        text: 'Postorder Traversal (Left → Right → Root): visit children before their parent.',
      });
      for (const [id, val] of order) {
        events.push(
          { t: 'visit', id },
          { t: 'note', text: `Visited ${val} (Postorder: children finished before parent).` },
        );
      }
      events.push(
        {
          t: 'note',
          text: `Postorder Traversal complete: ${order.map((o) => o[1]).join(', ')}.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'tree-levelorder': {
      const sorted = emitBaseBst(events, customValues);
      const order: [string, number, number][] = [
        ['bst-50', sorted[3], 1],
        ['bst-30', sorted[1], 2],
        ['bst-70', sorted[5], 2],
        ['bst-20', sorted[0], 3],
        ['bst-40', sorted[2], 3],
        ['bst-60', sorted[4], 3],
        ['bst-85', sorted[6], 3],
      ];
      events.push({
        t: 'note',
        text: 'Level-Order Traversal (BFS): visits the tree level by level from top to bottom.',
      });
      for (const [id, val, lvl] of order) {
        events.push(
          { t: 'visit', id },
          { t: 'note', text: `Level ${lvl}: visited node ${val}.` },
        );
      }
      events.push(
        {
          t: 'note',
          text: `Level-Order Traversal complete: ${order.map((o) => o[1]).join(', ')}.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'avl-rotation': {
      events.push(
        { t: 'create', id: 'bst-50', kind: 'node', value: 30 },
        { t: 'create', id: 'bst-30', kind: 'node', value: 20 },
        { t: 'create', id: 'bst-20', kind: 'node', value: 10 },
        { t: 'link', from: 'bst-50', to: 'bst-30', label: 'left' },
        { t: 'link', from: 'bst-30', to: 'bst-20', label: 'left' },
        {
          t: 'note',
          text: 'Inserted 30, 20, 10: tree leans heavily to the left (Left-Left imbalance, balance factor = +2).',
        },
        { t: 'compare', a: { id: 'bst-50' }, b: { id: 'bst-30' } },
        {
          t: 'note',
          text: 'Performing an AVL Right Rotation around 30 so 20 rises up to become the balanced root!',
        },
        { t: 'set', target: { id: 'bst-50' }, value: 20 },
        { t: 'set', target: { id: 'bst-30' }, value: 10 },
        { t: 'unlink', from: 'bst-30', to: 'bst-20' },
        { t: 'remove', id: 'bst-20' },
        { t: 'create', id: 'bst-70', kind: 'node', value: 30 },
        { t: 'link', from: 'bst-50', to: 'bst-70', label: 'right' },
        { t: 'visit', id: 'bst-50' },
        {
          t: 'note',
          text: 'AVL Right Rotation complete! Root is now 20 with left child 10 and right child 30 (height balanced).',
        },
        { t: 'done' },
      );
      break;
    }

    // ==========================================
    // BINARY HEAP & PRIORITY QUEUE (Week 10)
    // ==========================================
    case 'heap-insert': {
      const val = Number.isFinite(paramValue) ? paramValue : 95;
      const heapVals =
        customValues && customValues.length >= 5
          ? [...customValues].slice(0, 5).sort((a, b) => b - a)
          : [90, 70, 80, 40, 50];
      const [h0, h1, h2, h3, h4] = heapVals;
      updatedValues = [...heapVals, val];
      events.push(
        { t: 'create', id: 'bst-50', kind: 'node', value: h0 },
        { t: 'create', id: 'bst-30', kind: 'node', value: h1 },
        { t: 'create', id: 'bst-70', kind: 'node', value: h2 },
        { t: 'create', id: 'bst-20', kind: 'node', value: h3 },
        { t: 'create', id: 'bst-40', kind: 'node', value: h4 },
        { t: 'link', from: 'bst-50', to: 'bst-30', label: 'left' },
        { t: 'link', from: 'bst-50', to: 'bst-70', label: 'right' },
        { t: 'link', from: 'bst-30', to: 'bst-20', label: 'left' },
        { t: 'link', from: 'bst-30', to: 'bst-40', label: 'right' },
        {
          t: 'note',
          text: `Max-Heap: every parent is bigger than its children. Inserting ${val} at the next open leaf.`,
        },
        { t: 'create', id: 'bst-60', kind: 'node', value: val },
        { t: 'link', from: 'bst-70', to: 'bst-60', label: 'left' },
        {
          t: 'note',
          text: `Placed ${val} under ${h2}. Now we Bubble Up (siftUp) while ${val} is bigger than its parent!`,
        },
        { t: 'compare', a: { id: 'bst-60' }, b: { id: 'bst-70' } },
        {
          t: 'note',
          text: `Comparing ${val} with its parent ${h2}.`,
        },
      );
      if (val > h2) {
        events.push(
          { t: 'swap', a: { id: 'bst-60' }, b: { id: 'bst-70' } },
          {
            t: 'note',
            text: `${val} is bigger than ${h2}, so they swap places!`,
          },
          { t: 'compare', a: { id: 'bst-70' }, b: { id: 'bst-50' } },
          {
            t: 'note',
            text: `Comparing ${val} with the root ${h0}.`,
          },
        );
        if (val > h0) {
          events.push(
            { t: 'visit', id: 'bst-50' },
            { t: 'swap', a: { id: 'bst-70' }, b: { id: 'bst-50' } },
            {
              t: 'note',
              text: `${val} is bigger than ${h0}, so they swap! ${val} is now the new maximum at the root of the Heap.`,
            },
          );
        } else {
          events.push(
            { t: 'visit', id: 'bst-70' },
            {
              t: 'note',
              text: `${val} ≤ root ${h0}, so Bubble Up stops here. Max-Heap property restored!`,
            },
          );
        }
      } else {
        events.push(
          { t: 'visit', id: 'bst-60' },
          {
            t: 'note',
            text: `${val} ≤ parent ${h2}, so no swap is needed — Max-Heap property already holds!`,
          },
        );
      }
      events.push({ t: 'done' });
      break;
    }

    case 'heap-extract':
    case 'heap-build':
    case 'heap-sort': {
      events.push(
        { t: 'create', id: 'bst-50', kind: 'node', value: 95 },
        { t: 'create', id: 'bst-30', kind: 'node', value: 70 },
        { t: 'create', id: 'bst-70', kind: 'node', value: 85 },
        { t: 'create', id: 'bst-20', kind: 'node', value: 40 },
        { t: 'create', id: 'bst-40', kind: 'node', value: 50 },
        { t: 'link', from: 'bst-50', to: 'bst-30', label: 'left' },
        { t: 'link', from: 'bst-50', to: 'bst-70', label: 'right' },
        { t: 'link', from: 'bst-30', to: 'bst-20', label: 'left' },
        { t: 'link', from: 'bst-30', to: 'bst-40', label: 'right' },
        {
          t: 'note',
          text: 'Max-Heap root holds the largest number (95). Extracting 95 and moving last leaf (50) to root.',
        },
        { t: 'visit', id: 'bst-50' },
        { t: 'set', target: { id: 'bst-50' }, value: 50 },
        { t: 'unlink', from: 'bst-30', to: 'bst-40' },
        { t: 'remove', id: 'bst-40' },
        { t: 'compare', a: { id: 'bst-50' }, b: { id: 'bst-70' } },
        {
          t: 'note',
          text: 'Moved 50 to the root. Now Bubble Down (siftDown): compare 50 with its larger child 85.',
        },
        { t: 'visit', id: 'bst-50' },
        { t: 'swap', a: { id: 'bst-50' }, b: { id: 'bst-70' } },
        {
          t: 'note',
          text: '85 is bigger than 50, so they swap! 85 is now at the root and the Max-Heap property is restored.',
        },
        { t: 'done' },
      );
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
