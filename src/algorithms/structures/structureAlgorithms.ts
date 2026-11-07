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
    corpusPath: '02_singly_linked_list/sll_operations.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    needsNumber: true,
    numberLabel: 'Number to add at front',
  },
  {
    id: 'sll-insert-tail',
    scene: 'linked-list',
    label: 'Add at End (Tail)',
    group: 'Add',
    corpusPath: '02_singly_linked_list/sll_operations.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    needsNumber: true,
    numberLabel: 'Number to add at end',
  },
  {
    id: 'sll-delete-val',
    scene: 'linked-list',
    label: 'Remove a Node',
    group: 'Remove',
    corpusPath: '02_singly_linked_list/sll_operations.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    needsNumber: true,
    numberLabel: 'Node value to remove',
  },
  {
    id: 'sll-search',
    scene: 'linked-list',
    label: 'Find a Number',
    group: 'Find',
    corpusPath: '02_singly_linked_list/sll_operations.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    needsNumber: true,
    numberLabel: 'Number to find',
  },
  {
    id: 'sll-find-middle',
    scene: 'linked-list',
    label: 'Find Middle Node (Slow/Fast)',
    group: 'Find',
    corpusPath: '02_singly_linked_list/sll_reverse_middle_merge.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'cll-cycle',
    scene: 'linked-list',
    label: 'Detect Loop (Floyd Cycle)',
    group: 'Find',
    corpusPath: '03_doubly_circular_linked_list/circular_linked_list_and_cycle.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'sll-reverse',
    scene: 'linked-list',
    label: 'Reverse List Links',
    group: 'Sort',
    corpusPath: '02_singly_linked_list/sll_reverse_middle_merge.cpp',
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
    corpusPath: '04_recursion_and_stack/stack_array_and_ll.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    needsNumber: true,
    numberLabel: 'Number to push',
  },
  {
    id: 'stack-pop',
    scene: 'stack',
    label: 'Pop Top Number',
    group: 'Remove',
    corpusPath: '04_recursion_and_stack/stack_array_and_ll.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'stack-peek',
    scene: 'stack',
    label: 'Peek at Top Number',
    group: 'Find',
    corpusPath: '04_recursion_and_stack/stack_array_and_ll.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'stack-brackets',
    scene: 'stack',
    label: 'Check Balanced Brackets',
    group: 'Find',
    corpusPath: '04_recursion_and_stack/stack_applications_expressions.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'recursion-factorial',
    scene: 'stack',
    label: 'Recursive Factorial Call Stack',
    group: 'Sort',
    corpusPath: '04_recursion_and_stack/recursion_and_tower_of_hanoi.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  },
  {
    id: 'recursion-hanoi',
    scene: 'stack',
    label: 'Tower of Hanoi Recursion',
    group: 'Sort',
    corpusPath: '04_recursion_and_stack/recursion_and_tower_of_hanoi.cpp',
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
    corpusPath: '05_queues_and_deque/linear_queue_array_and_ll.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    needsNumber: true,
    numberLabel: 'Number to enqueue',
  },
  {
    id: 'queue-dequeue',
    scene: 'queue',
    label: 'Dequeue from Front',
    group: 'Remove',
    corpusPath: '05_queues_and_deque/linear_queue_array_and_ll.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'circular-queue',
    scene: 'queue',
    label: 'Circular Queue Wrap-Around',
    group: 'Sort',
    corpusPath: '05_queues_and_deque/circular_queue.cpp',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'deque-ops',
    scene: 'queue',
    label: 'Deque Add & Remove Both Ends',
    group: 'Add',
    corpusPath: '05_queues_and_deque/double_ended_queue_deque.cpp',
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
    corpusPath: '11_binary_search_tree/bst_insert_search_delete.cpp',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(h)',
    needsNumber: true,
    numberLabel: 'Number to insert',
  },
  {
    id: 'bst-search',
    scene: 'bst',
    label: 'Find a Number in BST',
    group: 'Find',
    corpusPath: '11_binary_search_tree/bst_insert_search_delete.cpp',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(h)',
    needsNumber: true,
    numberLabel: 'Number to find',
  },
  {
    id: 'bst-delete',
    scene: 'bst',
    label: 'Remove a Node from BST',
    group: 'Remove',
    corpusPath: '11_binary_search_tree/bst_insert_search_delete.cpp',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(h)',
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
    corpusPath: '10_heap_and_priority_queue/max_min_heap.cpp',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    needsNumber: true,
    numberLabel: 'Number to insert into heap',
  },
  {
    id: 'heap-extract',
    scene: 'heap',
    label: 'Extract Max & Bubble Down',
    group: 'Remove',
    corpusPath: '10_heap_and_priority_queue/max_min_heap.cpp',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'heap-build',
    scene: 'heap',
    label: 'Build Max-Heap in O(n)',
    group: 'Sort',
    corpusPath: '10_heap_and_priority_queue/max_min_heap.cpp',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  },
  {
    id: 'heap-sort',
    scene: 'heap',
    label: 'Heap Sort (Extract Max Loop)',
    group: 'Sort',
    corpusPath: '10_heap_and_priority_queue/heap_sort_and_pq.cpp',
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
    corpusPath: '13_graph_traversal/bfs_and_dfs.cpp',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
  },
  {
    id: 'graph-dfs',
    scene: 'graph',
    label: 'Depth-First Search (DFS)',
    group: 'Find',
    corpusPath: '13_graph_traversal/bfs_and_dfs.cpp',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
  },
  {
    id: 'graph-dijkstra',
    scene: 'graph',
    label: "Dijkstra's Shortest Path",
    group: 'Find',
    corpusPath: '14_graph_mst_toposort/topological_sort_and_dijkstra.cpp',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
  },
  {
    id: 'graph-prim',
    scene: 'graph',
    label: "Prim's Minimum Spanning Tree",
    group: 'Sort',
    corpusPath: '14_graph_mst_toposort/prim_and_kruskal_mst.cpp',
    timeComplexity: 'O(E log V)',
    spaceComplexity: 'O(V)',
  },
  {
    id: 'graph-kruskal',
    scene: 'graph',
    label: "Kruskal's Minimum Spanning Tree",
    group: 'Sort',
    corpusPath: '14_graph_mst_toposort/prim_and_kruskal_mst.cpp',
    timeComplexity: 'O(E log E)',
    spaceComplexity: 'O(V)',
  },
  {
    id: 'graph-toposort',
    scene: 'graph',
    label: 'Topological Sort (Dependency Order)',
    group: 'Sort',
    corpusPath: '14_graph_mst_toposort/topological_sort_and_dijkstra.cpp',
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
    corpusPath: '15_hashing/open_addressing_hash_table.cpp',
    timeComplexity: 'O(1) avg',
    spaceComplexity: 'O(m)',
    needsNumber: true,
    numberLabel: 'Key to hash & insert',
  },
  {
    id: 'hash-quadratic',
    scene: 'hash-table',
    label: 'Quadratic Probing (+1², +2², +3²)',
    group: 'Add',
    corpusPath: '15_hashing/open_addressing_hash_table.cpp',
    timeComplexity: 'O(1) avg',
    spaceComplexity: 'O(m)',
    needsNumber: true,
    numberLabel: 'Key to hash & insert',
  },
  {
    id: 'hash-double',
    scene: 'hash-table',
    label: 'Double Hashing (Second Hash Step)',
    group: 'Add',
    corpusPath: '15_hashing/open_addressing_hash_table.cpp',
    timeComplexity: 'O(1) avg',
    spaceComplexity: 'O(m)',
    needsNumber: true,
    numberLabel: 'Key to hash & insert',
  },
  {
    id: 'hash-chaining',
    scene: 'hash-table',
    label: 'Separate Chaining (Bucket Chains)',
    group: 'Add',
    corpusPath: '15_hashing/separate_chaining_and_rehashing.cpp',
    timeComplexity: 'O(1 + α)',
    spaceComplexity: 'O(n + m)',
    needsNumber: true,
    numberLabel: 'Key to chain into bucket',
  },
];

function emitBaseLinkedList(events: TraceEvent[], customValues?: number[]) {
  const vals =
    customValues && customValues.length >= 4
      ? customValues.slice(0, 4)
      : [10, 25, 40, 55];
  events.push(
    { t: 'create', id: 'node-head', kind: 'node', value: vals[0] },
    { t: 'create', id: 'node-2', kind: 'node', value: vals[1] },
    { t: 'create', id: 'node-3', kind: 'node', value: vals[2] },
    { t: 'create', id: 'node-tail', kind: 'node', value: vals[3] },
    { t: 'link', from: 'node-head', to: 'node-2', label: 'next' },
    { t: 'link', from: 'node-2', to: 'node-3', label: 'next' },
    { t: 'link', from: 'node-3', to: 'node-tail', label: 'next' },
  );
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
      const val = paramValue || 5;
      updatedValues = [val, ...vals.slice(0, 3)];
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
      const val = paramValue || 70;
      updatedValues = [...vals.slice(1), val];
      events.push(
        {
          t: 'note',
          text: `Starting at head (${vals[0]}). Walking to the end of the list to add ${val}.`,
        },
        { t: 'line', line: 27 },
        { t: 'visit', id: 'node-head' },
        { t: 'note', text: `Checking node ${vals[0]} — it has a next arrow, so move forward.` },
        { t: 'visit', id: 'node-2' },
        { t: 'note', text: `Checking node ${vals[1]} — it has a next arrow, so move forward.` },
        { t: 'visit', id: 'node-3' },
        { t: 'note', text: `Checking node ${vals[2]} — moving to the last node ${vals[3]}.` },
        { t: 'visit', id: 'node-tail' },
        {
          t: 'note',
          text: `Reached the tail node (${vals[3]}). Creating new node ${val} and linking it at the end.`,
        },
        { t: 'line', line: 29 },
        { t: 'create', id: 'node-new-tail', kind: 'node', value: val },
        { t: 'link', from: 'node-tail', to: 'node-new-tail', label: 'next' },
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
      events.push(
        {
          t: 'note',
          text: `Walking along the Linked List (${vals.join(' → ')}) to remove node ${vals[2]}.`,
        },
        { t: 'line', line: 51 },
        { t: 'visit', id: 'node-head' },
        { t: 'note', text: `At head (${vals[0]}). Next node is ${vals[1]}, not ${vals[2]} — step forward.` },
        { t: 'visit', id: 'node-2' },
        {
          t: 'note',
          text: `At node ${vals[1]}. Its next node is ${vals[2]} — found the node to remove!`,
        },
        { t: 'line', line: 55 },
        { t: 'unlink', from: 'node-2', to: 'node-3' },
        { t: 'link', from: 'node-2', to: 'node-tail', label: 'next' },
        {
          t: 'note',
          text: `Bypassed ${vals[2]} by linking ${vals[1]} directly to ${vals[3]}.`,
        },
        { t: 'line', line: 56 },
        { t: 'remove', id: 'node-3' },
        {
          t: 'note',
          text: `Deleted node ${vals[2]} from memory. List is now ${vals[0]} → ${vals[1]} → ${vals[3]}.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'sll-search': {
      const vals = emitBaseLinkedList(events, customValues);
      events.push(
        {
          t: 'note',
          text: `Searching the Linked List (${vals.join(' → ')}) from head to tail for ${vals[2]}.`,
        },
        { t: 'line', line: 62 },
        { t: 'visit', id: 'node-head' },
        { t: 'note', text: `Checking position 1: value is ${vals[0]} (not ${vals[2]}). Follow next arrow.` },
        { t: 'visit', id: 'node-2' },
        { t: 'note', text: `Checking position 2: value is ${vals[1]} (not ${vals[2]}). Follow next arrow.` },
        { t: 'visit', id: 'node-3' },
        { t: 'line', line: 64 },
        {
          t: 'note',
          text: `Found ${vals[2]} at node #3!`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'sll-reverse': {
      const vals = emitBaseLinkedList(events, customValues);
      updatedValues = [...vals].reverse();
      events.push(
        {
          t: 'note',
          text: 'Reversing the Linked List in-place by flipping each arrow backward.',
        },
        { t: 'line', line: 17 },
        { t: 'visit', id: 'node-head' },
        { t: 'unlink', from: 'node-head', to: 'node-2' },
        {
          t: 'note',
          text: `Detached ${vals[0]} from ${vals[1]} so ${vals[0]} now points to nothing (it becomes the new tail).`,
        },
        { t: 'visit', id: 'node-2' },
        { t: 'unlink', from: 'node-2', to: 'node-3' },
        { t: 'link', from: 'node-2', to: 'node-head', label: 'next' },
        {
          t: 'note',
          text: `Flipped arrow so ${vals[1]} now points back to ${vals[0]}.`,
        },
        { t: 'visit', id: 'node-3' },
        { t: 'unlink', from: 'node-3', to: 'node-tail' },
        { t: 'link', from: 'node-3', to: 'node-2', label: 'next' },
        {
          t: 'note',
          text: `Flipped arrow so ${vals[2]} now points back to ${vals[1]}.`,
        },
        { t: 'visit', id: 'node-tail' },
        { t: 'link', from: 'node-tail', to: 'node-3', label: 'next' },
        {
          t: 'note',
          text: `Flipped arrow so ${vals[3]} points to ${vals[2]}. Done! Reversed list: ${updatedValues.join(' → ')}.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'sll-find-middle': {
      emitBaseLinkedList(events, customValues);
      events.push(
        {
          t: 'note',
          text: 'Using Slow (1 step) and Fast (2 steps) pointers to find the middle node.',
        },
        { t: 'line', line: 34 },
        { t: 'compare', a: { id: 'node-head' }, b: { id: 'node-head' } },
        { t: 'note', text: 'Both Slow and Fast start at head.' },
        { t: 'compare', a: { id: 'node-2' }, b: { id: 'node-3' } },
        {
          t: 'note',
          text: 'Slow moves 1 step forward, while Fast jumps 2 steps ahead.',
        },
        { t: 'visit', id: 'node-3' },
        {
          t: 'note',
          text: 'Fast reaches the end, so Slow lands right on the middle node!',
        },
        { t: 'done' },
      );
      break;
    }

    case 'dll-traversal': {
      emitBaseLinkedList(events, customValues);
      events.push(
        { t: 'link', from: 'node-2', to: 'node-head', label: 'prev' },
        { t: 'link', from: 'node-3', to: 'node-2', label: 'prev' },
        { t: 'link', from: 'node-tail', to: 'node-3', label: 'prev' },
        {
          t: 'note',
          text: 'Doubly Linked List: every node has both a forward (next) and backward (prev) arrow.',
        },
        { t: 'visit', id: 'node-head' },
        { t: 'note', text: 'Forward walk: visiting head → moving next.' },
        { t: 'visit', id: 'node-2' },
        { t: 'note', text: 'Forward walk: visiting node #2 → moving next.' },
        { t: 'visit', id: 'node-3' },
        { t: 'note', text: 'Forward walk: visiting node #3 → moving next.' },
        { t: 'visit', id: 'node-tail' },
        {
          t: 'note',
          text: 'Reached tail. Because each node also has a prev arrow, we can walk backward too!',
        },
        { t: 'done' },
      );
      break;
    }

    case 'cll-cycle': {
      emitBaseLinkedList(events, customValues);
      events.push(
        { t: 'link', from: 'node-tail', to: 'node-2', label: 'loop' },
        {
          t: 'note',
          text: 'Tail node loops back to node #2! Running Tortoise & Hare cycle detection.',
        },
        { t: 'compare', a: { id: 'node-2' }, b: { id: 'node-3' } },
        {
          t: 'note',
          text: 'Tortoise steps 1 node while Hare jumps 2 nodes ahead.',
        },
        { t: 'compare', a: { id: 'node-3' }, b: { id: 'node-2' } },
        {
          t: 'note',
          text: 'Hare follows the loop arrow from tail back to node #2!',
        },
        { t: 'compare', a: { id: 'node-tail' }, b: { id: 'node-tail' } },
        { t: 'visit', id: 'node-tail' },
        {
          t: 'note',
          text: 'Tortoise and Hare meet inside the loop — cycle confirmed!',
        },
        { t: 'done' },
      );
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
      const val = paramValue || 50;
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
      events.push(
        {
          t: 'note',
          text: 'Calculating 4! (4 × 3 × 2 × 1) by pushing each recursive call onto the Call Stack.',
        },
        { t: 'call', fn: 'factorial', args: [4], depth: 1 },
        { t: 'create', id: 'stk-0', kind: 'node', value: '4!' },
        { t: 'note', text: 'factorial(4) needs factorial(3), so push frame 4! and call factorial(3).' },
        { t: 'call', fn: 'factorial', args: [3], depth: 2 },
        { t: 'create', id: 'stk-1', kind: 'node', value: '3!' },
        { t: 'link', from: 'stk-1', to: 'stk-0', label: 'calls' },
        { t: 'note', text: 'factorial(3) needs factorial(2), so push frame 3! and call factorial(2).' },
        { t: 'call', fn: 'factorial', args: [2], depth: 3 },
        { t: 'create', id: 'stk-2', kind: 'node', value: '2!' },
        { t: 'link', from: 'stk-2', to: 'stk-1', label: 'calls' },
        { t: 'note', text: 'factorial(2) needs factorial(1), so push frame 2! and call factorial(1).' },
        { t: 'call', fn: 'factorial', args: [1], depth: 4 },
        { t: 'create', id: 'stk-3', kind: 'node', value: '1=1' },
        { t: 'link', from: 'stk-3', to: 'stk-2', label: 'calls' },
        { t: 'visit', id: 'stk-3' },
        { t: 'note', text: 'Base case reached! factorial(1) returns 1. Now we unwind the stack.' },
        { t: 'return', fn: 'factorial', value: 1 },
        { t: 'unlink', from: 'stk-3', to: 'stk-2' },
        { t: 'remove', id: 'stk-3' },
        { t: 'set', target: { id: 'stk-2' }, value: 2 },
        { t: 'visit', id: 'stk-2' },
        { t: 'note', text: 'factorial(2) computes 2 × 1 = 2 and returns 2.' },
        { t: 'return', fn: 'factorial', value: 2 },
        { t: 'unlink', from: 'stk-2', to: 'stk-1' },
        { t: 'remove', id: 'stk-2' },
        { t: 'set', target: { id: 'stk-1' }, value: 6 },
        { t: 'visit', id: 'stk-1' },
        { t: 'note', text: 'factorial(3) computes 3 × 2 = 6 and returns 6.' },
        { t: 'return', fn: 'factorial', value: 6 },
        { t: 'unlink', from: 'stk-1', to: 'stk-0' },
        { t: 'remove', id: 'stk-1' },
        { t: 'set', target: { id: 'stk-0' }, value: 24 },
        { t: 'visit', id: 'stk-0' },
        { t: 'return', fn: 'factorial', value: 24 },
        { t: 'note', text: 'factorial(4) computes 4 × 6 = 24. Final answer: 24!' },
        { t: 'done' },
      );
      break;
    }

    case 'recursion-hanoi': {
      events.push(
        { t: 'create', id: 'stk-0', kind: 'node', value: 30 },
        { t: 'create', id: 'stk-1', kind: 'node', value: 20 },
        { t: 'create', id: 'stk-2', kind: 'node', value: 10 },
        { t: 'link', from: 'stk-1', to: 'stk-0', label: 'on' },
        { t: 'link', from: 'stk-2', to: 'stk-1', label: 'on' },
        {
          t: 'note',
          text: 'Tower of Hanoi: 3 disks (10 smallest on top, 30 largest on bottom).',
        },
        { t: 'visit', id: 'stk-2' },
        { t: 'note', text: 'Step 1: Move smallest disk (10) from Peg A to Peg C.' },
        { t: 'visit', id: 'stk-1' },
        { t: 'note', text: 'Step 2: Move middle disk (20) from Peg A to Peg B.' },
        { t: 'visit', id: 'stk-2' },
        { t: 'note', text: 'Step 3: Place smallest disk (10) on top of 20 on Peg B.' },
        { t: 'visit', id: 'stk-0' },
        {
          t: 'note',
          text: 'Step 4: Move largest disk (30) to destination Peg C, then re-stack 20 and 10 on top!',
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
        customValues && customValues.length >= 3
          ? customValues.slice(0, 3)
          : [10, 20, 30];
      const val = paramValue || 50;
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
      const val = paramValue || 45;
      updatedValues = [...sorted.slice(0, 6), val];
      events.push(
        {
          t: 'note',
          text: `Inserting ${val} into the Binary Search Tree. Smaller numbers go left; bigger go right.`,
        },
        { t: 'line', line: 17 },
        { t: 'visit', id: 'bst-50' },
        {
          t: 'note',
          text: `Comparing ${val} with root ${sorted[3]}: ${val} is smaller, so go LEFT to ${sorted[1]}.`,
        },
        { t: 'visit', id: 'bst-30' },
        {
          t: 'note',
          text: `Comparing ${val} with ${sorted[1]}: ${val} is bigger, so go RIGHT to ${sorted[2]}.`,
        },
        { t: 'visit', id: 'bst-40' },
        {
          t: 'note',
          text: `Comparing ${val} with ${sorted[2]}: ${sorted[2]}'s child slot is open!`,
        },
        { t: 'create', id: 'bst-new', kind: 'node', value: val },
        { t: 'link', from: 'bst-40', to: 'bst-new', label: 'right' },
        { t: 'visit', id: 'bst-new' },
        {
          t: 'note',
          text: `Placed ${val} as the right child of ${sorted[2]}!`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'bst-search': {
      const sorted = emitBaseBst(events, customValues);
      events.push(
        {
          t: 'note',
          text: `Searching for ${sorted[4]} in the Binary Search Tree starting at root ${sorted[3]}.`,
        },
        { t: 'line', line: 26 },
        { t: 'visit', id: 'bst-50' },
        {
          t: 'note',
          text: `${sorted[4]} is bigger than root ${sorted[3]}, so we ignore the entire left half and go RIGHT to ${sorted[5]}.`,
        },
        { t: 'visit', id: 'bst-70' },
        {
          t: 'note',
          text: `${sorted[4]} is smaller than ${sorted[5]}, so we go LEFT.`,
        },
        { t: 'visit', id: 'bst-60' },
        {
          t: 'note',
          text: `Found ${sorted[4]}! Binary Search Tree found it in just 3 steps instead of checking all 7 nodes.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'bst-delete': {
      const sorted = emitBaseBst(events, customValues);
      events.push(
        {
          t: 'note',
          text: `Deleting node ${sorted[1]} (which has two children: ${sorted[0]} and ${sorted[2]}) from the BST.`,
        },
        { t: 'visit', id: 'bst-50' },
        { t: 'visit', id: 'bst-30' },
        {
          t: 'note',
          text: `Found node ${sorted[1]}. Since it has two children, we replace it with its in-order successor (${sorted[2]}).`,
        },
        { t: 'compare', a: { id: 'bst-30' }, b: { id: 'bst-40' } },
        { t: 'set', target: { id: 'bst-30' }, value: sorted[2] },
        { t: 'unlink', from: 'bst-30', to: 'bst-40' },
        { t: 'remove', id: 'bst-40' },
        {
          t: 'note',
          text: `Copied ${sorted[2]} into the node and removed the old leaf. The BST remains valid!`,
        },
        { t: 'done' },
      );
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
      const val = paramValue || 95;
      events.push(
        { t: 'create', id: 'bst-50', kind: 'node', value: 90 },
        { t: 'create', id: 'bst-30', kind: 'node', value: 70 },
        { t: 'create', id: 'bst-70', kind: 'node', value: 80 },
        { t: 'create', id: 'bst-20', kind: 'node', value: 40 },
        { t: 'create', id: 'bst-40', kind: 'node', value: 50 },
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
          text: `Placed ${val} under 80. Now we Bubble Up (siftUp) while ${val} is bigger than its parent!`,
        },
        { t: 'compare', a: { id: 'bst-60' }, b: { id: 'bst-70' } },
        { t: 'swap', a: { id: 'bst-60' }, b: { id: 'bst-70' } },
        {
          t: 'note',
          text: `${val} is bigger than 80, so they swap places!`,
        },
        { t: 'compare', a: { id: 'bst-70' }, b: { id: 'bst-50' } },
        { t: 'swap', a: { id: 'bst-70' }, b: { id: 'bst-50' } },
        { t: 'visit', id: 'bst-50' },
        {
          t: 'note',
          text: `${val} is bigger than 90, so they swap! ${val} is now the new maximum at the root of the Heap.`,
        },
        { t: 'done' },
      );
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
        {
          t: 'note',
          text: 'Moved 50 to the root. Now Bubble Down (siftDown): compare 50 with its larger child 85.',
        },
        { t: 'compare', a: { id: 'bst-50' }, b: { id: 'bst-70' } },
        { t: 'swap', a: { id: 'bst-50' }, b: { id: 'bst-70' } },
        { t: 'visit', id: 'bst-50' },
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
      const buckets = [null, 15, 22, null, 18, null, null];
      events.push({ t: 'create', id: 'arr', kind: 'array', value: 7 });
      buckets.forEach((v, idx) => {
        events.push({ t: 'set', target: { id: 'arr', index: idx }, value: v ?? 0 });
      });
      const key = paramValue || 29;
      events.push(
        {
          t: 'note',
          text: `Hash Table with 7 buckets. Inserting key ${key}: hash(${key}) = ${key} % 7 = 1.`,
        },
        { t: 'compare', a: { id: 'arr', index: 1 }, b: { id: 'arr', index: 1 } },
        {
          t: 'note',
          text: 'Collision at Bucket #2 (index 1) — it already holds 15! Stepping forward to find an empty bucket.',
        },
        { t: 'compare', a: { id: 'arr', index: 2 }, b: { id: 'arr', index: 2 } },
        {
          t: 'note',
          text: 'Bucket #3 (index 2) is also occupied (holds 22). Probing to next bucket...',
        },
        { t: 'set', target: { id: 'arr', index: 3 }, value: key },
        { t: 'visit', id: 'arr[3]' },
        {
          t: 'note',
          text: `Bucket #4 (index 3) is empty! Stored ${key} in Bucket #4.`,
        },
        { t: 'done' },
      );
      break;
    }

    case 'hash-chaining': {
      const val = paramValue || 36;
      events.push(
        { t: 'create', id: 'b-0', kind: 'node', value: 'B0' },
        { t: 'create', id: 'b-1', kind: 'node', value: 'B1:15' },
        { t: 'create', id: 'b-2', kind: 'node', value: 'B2:22' },
        { t: 'create', id: 'c-1', kind: 'node', value: 29 },
        { t: 'link', from: 'b-1', to: 'c-1', label: 'chain' },
        {
          t: 'note',
          text: `Separate Chaining: Bucket 1 already has a linked chain (15 → 29). Hashing ${val}: ${val} % 7 = 1.`,
        },
        { t: 'visit', id: 'b-1' },
        { t: 'visit', id: 'c-1' },
        { t: 'create', id: 'c-2', kind: 'node', value: val },
        { t: 'link', from: 'c-1', to: 'c-2', label: 'chain' },
        { t: 'visit', id: 'c-2' },
        {
          t: 'note',
          text: `Appended ${val} to Bucket 1's linked list: 15 → 29 → ${val}!`,
        },
        { t: 'done' },
      );
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
