import type { PreviewSceneKind } from '../types/trace';

// Automatically imports all C++ files from cpp_corpus/ as raw text.
// When teammates replace any .cpp file in cpp_corpus/, Vite automatically
// bundles the updated C++ source into the visualizer UI and Code Details drawer.
const rawCorpusModules = import.meta.glob('/cpp_corpus/**/*.cpp', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export interface CorpusFileEntry {
  /** Path relative to cpp_corpus/, e.g. '01_arrays_and_searching/array_operations.cpp' */
  relativePath: string;
  /** Week & folder label */
  weekLabel: string;
  /** Human-readable title */
  title: string;
  /** Associated 3D structure scene */
  scene: PreviewSceneKind;
  /** Associated operation ID to trigger when visualizing this file */
  operationId: string;
}

export const CORPUS_FILE_CATALOG: CorpusFileEntry[] = [
  // Week 1: Arrays & Searching
  {
    relativePath: '01_arrays_and_searching/array_operations.cpp',
    weekLabel: 'Week 1 • Arrays & Searching',
    title: 'Array ADT (Insert, Delete, Reverse, Rotate)',
    scene: 'array',
    operationId: 'insert-at',
  },
  {
    relativePath: '01_arrays_and_searching/linear_search.cpp',
    weekLabel: 'Week 1 • Arrays & Searching',
    title: 'Linear Search (Iterative & Recursive)',
    scene: 'array',
    operationId: 'linear-search',
  },
  {
    relativePath: '01_arrays_and_searching/binary_search.cpp',
    weekLabel: 'Week 1 • Arrays & Searching',
    title: 'Binary Search (Iterative, Recursive & Bounds)',
    scene: 'array',
    operationId: 'binary-search',
  },

  // Week 2: Singly Linked List
  {
    relativePath: '02_singly_linked_list/sll_operations.cpp',
    weekLabel: 'Week 2 • Singly Linked List',
    title: 'Singly Linked List (Insert, Delete, Search)',
    scene: 'linked-list',
    operationId: 'sll-insert-tail',
  },
  {
    relativePath: '02_singly_linked_list/sll_reverse_middle_merge.cpp',
    weekLabel: 'Week 2 • Singly Linked List',
    title: 'SLL Reverse, Find Middle & Merge Sorted Lists',
    scene: 'linked-list',
    operationId: 'sll-reverse',
  },
  {
    relativePath: '02_singly_linked_list/sll_sorting.cpp',
    weekLabel: 'Week 2 • Singly Linked List',
    title: 'Linked List Sorting (Bubble & Merge Sort)',
    scene: 'linked-list',
    operationId: 'sll-find-middle',
  },

  // Week 3: Doubly & Circular Linked List
  {
    relativePath: '03_doubly_circular_linked_list/doubly_linked_list.cpp',
    weekLabel: 'Week 3 • Doubly & Circular List',
    title: 'Doubly Linked List (Insert, Delete, Reverse)',
    scene: 'linked-list',
    operationId: 'dll-traversal',
  },
  {
    relativePath: '03_doubly_circular_linked_list/circular_linked_list_and_cycle.cpp',
    weekLabel: 'Week 3 • Doubly & Circular List',
    title: 'Circular Linked List & Floyd Cycle Detection',
    scene: 'linked-list',
    operationId: 'cll-cycle',
  },

  // Week 4: Recursion & Stack
  {
    relativePath: '04_recursion_and_stack/stack_array_and_ll.cpp',
    weekLabel: 'Week 4 • Recursion & Stack',
    title: 'Stack ADT (Array & Linked List Push/Pop/Peek)',
    scene: 'stack',
    operationId: 'stack-push',
  },
  {
    relativePath: '04_recursion_and_stack/recursion_and_tower_of_hanoi.cpp',
    weekLabel: 'Week 4 • Recursion & Stack',
    title: 'Recursion (Factorial, Fibonacci & Tower of Hanoi)',
    scene: 'stack',
    operationId: 'recursion-factorial',
  },
  {
    relativePath: '04_recursion_and_stack/stack_applications_expressions.cpp',
    weekLabel: 'Week 4 • Recursion & Stack',
    title: 'Stack Applications (Brackets, Infix/Postfix)',
    scene: 'stack',
    operationId: 'stack-brackets',
  },

  // Week 5: Queues & Deque
  {
    relativePath: '05_queues_and_deque/linear_queue_array_and_ll.cpp',
    weekLabel: 'Week 5 • Queues & Deque',
    title: 'Linear Queue (Array & Linked List Enqueue/Dequeue)',
    scene: 'queue',
    operationId: 'queue-enqueue',
  },
  {
    relativePath: '05_queues_and_deque/circular_queue.cpp',
    weekLabel: 'Week 5 • Queues & Deque',
    title: 'Circular Queue (Modulo Wrap-Around)',
    scene: 'queue',
    operationId: 'circular-queue',
  },
  {
    relativePath: '05_queues_and_deque/double_ended_queue_deque.cpp',
    weekLabel: 'Week 5 • Queues & Deque',
    title: 'Double-Ended Queue (Deque Front & Rear Ops)',
    scene: 'queue',
    operationId: 'deque-ops',
  },

  // Week 6: Elementary Sorting
  {
    relativePath: '06_elementary_sorting/bubble_sort.cpp',
    weekLabel: 'Week 6 • Elementary Sorting',
    title: 'Bubble Sort (Standard & Early-Exit Optimized)',
    scene: 'array',
    operationId: 'bubble-sort',
  },
  {
    relativePath: '06_elementary_sorting/insertion_sort.cpp',
    weekLabel: 'Week 6 • Elementary Sorting',
    title: 'Insertion Sort (Shift-Based & Swap-Based)',
    scene: 'array',
    operationId: 'insertion-sort',
  },
  {
    relativePath: '06_elementary_sorting/selection_sort.cpp',
    weekLabel: 'Week 6 • Elementary Sorting',
    title: 'Selection Sort (Minimum Index Selection)',
    scene: 'array',
    operationId: 'selection-sort',
  },

  // Week 7: Advanced Sorting
  {
    relativePath: '07_advanced_sorting/merge_sort.cpp',
    weekLabel: 'Week 7 • Advanced Sorting',
    title: 'Merge Sort (Top-Down Divide & Conquer)',
    scene: 'array',
    operationId: 'merge-sort',
  },
  {
    relativePath: '07_advanced_sorting/quick_sort.cpp',
    weekLabel: 'Week 7 • Advanced Sorting',
    title: 'Quick Sort (Lomuto & Hoare Partition)',
    scene: 'array',
    operationId: 'quick-sort',
  },

  // Week 9: Binary Tree
  {
    relativePath: '09_binary_tree/binary_tree_traversals.cpp',
    weekLabel: 'Week 9 • Binary Tree',
    title: 'Binary Tree Traversals (Preorder, Inorder, Postorder, BFS)',
    scene: 'bst',
    operationId: 'tree-inorder',
  },
  {
    relativePath: '09_binary_tree/binary_tree_height_count_mirror.cpp',
    weekLabel: 'Week 9 • Binary Tree',
    title: 'Binary Tree Height, Leaf Count & Mirror/Invert',
    scene: 'bst',
    operationId: 'tree-levelorder',
  },

  // Week 10: Binary Heap & Priority Queue
  {
    relativePath: '10_heap_and_priority_queue/max_min_heap.cpp',
    weekLabel: 'Week 10 • Heap & Priority Queue',
    title: 'Max-Heap & Min-Heap (siftUp, siftDown, buildHeap)',
    scene: 'heap',
    operationId: 'heap-insert',
  },
  {
    relativePath: '10_heap_and_priority_queue/heap_sort_and_pq.cpp',
    weekLabel: 'Week 10 • Heap & Priority Queue',
    title: 'Heap Sort & Priority Queue ADT',
    scene: 'heap',
    operationId: 'heap-extract',
  },

  // Week 11: Binary Search Tree
  {
    relativePath: '11_binary_search_tree/bst_insert_search_delete.cpp',
    weekLabel: 'Week 11 • Binary Search Tree',
    title: 'BST Insert, Search & 3-Case Deletion',
    scene: 'bst',
    operationId: 'bst-insert',
  },
  {
    relativePath: '11_binary_search_tree/bst_validate_and_lca.cpp',
    weekLabel: 'Week 11 • Binary Search Tree',
    title: 'BST Validation (isValidBST) & Lowest Common Ancestor',
    scene: 'bst',
    operationId: 'bst-search',
  },

  // Week 12: AVL Tree
  {
    relativePath: '12_avl_tree/avl_tree.cpp',
    weekLabel: 'Week 12 • AVL Tree',
    title: 'AVL Self-Balancing Tree (LL, RR, LR, RL Rotations)',
    scene: 'bst',
    operationId: 'avl-rotation',
  },

  // Week 13: Graph Representation & Traversal
  {
    relativePath: '13_graph_traversal/graph_representations.cpp',
    weekLabel: 'Week 13 • Graph Traversal',
    title: 'Graph Representations (Adjacency Matrix & List)',
    scene: 'graph',
    operationId: 'graph-bfs',
  },
  {
    relativePath: '13_graph_traversal/bfs_and_dfs.cpp',
    weekLabel: 'Week 13 • Graph Traversal',
    title: 'Breadth-First Search (BFS) & Depth-First Search (DFS)',
    scene: 'graph',
    operationId: 'graph-bfs',
  },
  {
    relativePath: '13_graph_traversal/graph_cycle_detection.cpp',
    weekLabel: 'Week 13 • Graph Traversal',
    title: 'Graph Cycle Detection (Undirected & Directed)',
    scene: 'graph',
    operationId: 'graph-dfs',
  },

  // Week 14: Graph MST & Topological Sort
  {
    relativePath: '14_graph_mst_toposort/prim_and_kruskal_mst.cpp',
    weekLabel: 'Week 14 • Graph MST & TopoSort',
    title: "Minimum Spanning Tree (Prim's & Kruskal's + DSU)",
    scene: 'graph',
    operationId: 'graph-prim',
  },
  {
    relativePath: '14_graph_mst_toposort/topological_sort_and_dijkstra.cpp',
    weekLabel: 'Week 14 • Graph MST & TopoSort',
    title: "Topological Sort (Kahn's & DFS) + Dijkstra's Shortest Path",
    scene: 'graph',
    operationId: 'graph-dijkstra',
  },

  // Week 15: Hashing
  {
    relativePath: '15_hashing/open_addressing_hash_table.cpp',
    weekLabel: 'Week 15 • Hashing',
    title: 'Open Addressing (Linear, Quadratic & Double Hashing)',
    scene: 'hash-table',
    operationId: 'hash-linear',
  },
  {
    relativePath: '15_hashing/separate_chaining_and_rehashing.cpp',
    weekLabel: 'Week 15 • Hashing',
    title: 'Separate Chaining & Dynamic Load-Factor Rehashing',
    scene: 'hash-table',
    operationId: 'hash-chaining',
  },
];

/**
 * Returns the lines of a C++ file from `cpp_corpus/` by its relative path.
 * Falls back to `fallbackLines` if the file is not found.
 */
export function getCorpusCodeLines(
  relativePath: string,
  fallbackLines: string[] = [],
): string[] {
  const fullKey = `/cpp_corpus/${relativePath}`;
  const raw = rawCorpusModules[fullKey];
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.replace(/\r\n/g, '\n').trimEnd().split('\n');
  }
  return fallbackLines;
}

/**
 * Returns the raw text of a C++ file from `cpp_corpus/`.
 */
export function getCorpusRawText(relativePath: string): string {
  const fullKey = `/cpp_corpus/${relativePath}`;
  return rawCorpusModules[fullKey] ?? '// C++ file not found in cpp_corpus/';
}
