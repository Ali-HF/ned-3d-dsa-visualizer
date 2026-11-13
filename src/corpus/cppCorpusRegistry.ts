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
    relativePath: '02_singly_linked_list/singly_linked_list.cpp',
    weekLabel: 'Week 2 • Singly Linked List',
    title: 'Singly Linked List (Insert, Delete, Search, Reverse)',
    scene: 'linked-list',
    operationId: 'sll-insert-tail',
  },
  {
    relativePath: '02_singly_linked_list/linked_list_sort.cpp',
    weekLabel: 'Week 2 • Singly Linked List',
    title: 'Linked List Sorting (Bubble & Merge Sort)',
    scene: 'linked-list',
    operationId: 'sll-reverse',
  },
  {
    relativePath: '02_singly_linked_list/viva_middle_and_merge.cpp',
    weekLabel: 'Week 2 • Singly Linked List',
    title: 'SLL Find Middle (Slow/Fast) & Merge Sorted Lists',
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
    relativePath: '03_doubly_circular_linked_list/circular_singly_linked_list.cpp',
    weekLabel: 'Week 3 • Doubly & Circular List',
    title: 'Circular Singly Linked List (Insert, Delete, Traverse)',
    scene: 'linked-list',
    operationId: 'cll-cycle',
  },
  {
    relativePath: '03_doubly_circular_linked_list/floyd_cycle_detection.cpp',
    weekLabel: 'Week 3 • Doubly & Circular List',
    title: 'Floyd Cycle Detection (Tortoise & Hare)',
    scene: 'linked-list',
    operationId: 'cll-cycle',
  },

  // Week 4: Recursion & Stack
  {
    relativePath: '04_recursion_and_stack/stack_array.cpp',
    weekLabel: 'Week 4 • Recursion & Stack',
    title: 'Stack ADT (Array-Based Push, Pop, Peek)',
    scene: 'stack',
    operationId: 'stack-push',
  },
  {
    relativePath: '04_recursion_and_stack/stack_linked_list.cpp',
    weekLabel: 'Week 4 • Recursion & Stack',
    title: 'Stack ADT (Linked-List-Based Push, Pop, Peek)',
    scene: 'stack',
    operationId: 'stack-pop',
  },
  {
    relativePath: '04_recursion_and_stack/viva_stack_applications.cpp',
    weekLabel: 'Week 4 • Recursion & Stack',
    title: 'Stack Applications (Brackets, Infix/Postfix & Recursion)',
    scene: 'stack',
    operationId: 'stack-brackets',
  },

  // Week 5: Queues & Deque
  {
    relativePath: '05_queues_and_deque/queue_array_and_circular.cpp',
    weekLabel: 'Week 5 • Queues & Deque',
    title: 'Linear & Circular Queue (Enqueue, Dequeue, Wrap-Around)',
    scene: 'queue',
    operationId: 'circular-queue',
  },
  {
    relativePath: '05_queues_and_deque/deque.cpp',
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
    relativePath: '09_binary_tree/viva_tree_utilities.cpp',
    weekLabel: 'Week 9 • Binary Tree',
    title: 'Binary Tree Utilities (Height, Node Count & Mirror)',
    scene: 'bst',
    operationId: 'tree-levelorder',
  },

  // Week 10: Binary Heap & Priority Queue
  {
    relativePath: '10_heap_and_priority_queue/max_heap.cpp',
    weekLabel: 'Week 10 • Heap & Priority Queue',
    title: 'Max-Heap ADT (siftUp, siftDown, buildHeap)',
    scene: 'heap',
    operationId: 'heap-insert',
  },
  {
    relativePath: '10_heap_and_priority_queue/heap_sort.cpp',
    weekLabel: 'Week 10 • Heap & Priority Queue',
    title: 'Heap Sort (In-Place Max-Heap Extraction)',
    scene: 'heap',
    operationId: 'heap-sort',
  },

  // Week 11: Binary Search Tree
  {
    relativePath: '11_binary_search_tree/binary_search_tree.cpp',
    weekLabel: 'Week 11 • Binary Search Tree',
    title: 'BST Insert, Search & 3-Case Deletion',
    scene: 'bst',
    operationId: 'bst-insert',
  },
  {
    relativePath: '11_binary_search_tree/viva_bst_validation_and_lca.cpp',
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
    relativePath: '13_graph_traversal/bfs_dfs_traversal.cpp',
    weekLabel: 'Week 13 • Graph Traversal',
    title: 'Breadth-First Search (BFS) & Depth-First Search (DFS)',
    scene: 'graph',
    operationId: 'graph-dfs',
  },

  // Week 14: Graph MST & Topological Sort
  {
    relativePath: '14_graph_mst_toposort/dijkstra.cpp',
    weekLabel: 'Week 14 • Graph MST & TopoSort',
    title: "Dijkstra's Shortest Path",
    scene: 'graph',
    operationId: 'graph-dijkstra',
  },
  {
    relativePath: '14_graph_mst_toposort/kruskal_mst.cpp',
    weekLabel: 'Week 14 • Graph MST & TopoSort',
    title: "Kruskal's Minimum Spanning Tree (DSU)",
    scene: 'graph',
    operationId: 'graph-kruskal',
  },
  {
    relativePath: '14_graph_mst_toposort/topological_sort.cpp',
    weekLabel: 'Week 14 • Graph MST & TopoSort',
    title: "Topological Sort (Kahn's & DFS)",
    scene: 'graph',
    operationId: 'graph-toposort',
  },

  // Week 15: Hashing
  {
    relativePath: '15_hashing/linear_probing.cpp',
    weekLabel: 'Week 15 • Hashing',
    title: 'Open Addressing Hash Table (Linear Probing)',
    scene: 'hash-table',
    operationId: 'hash-linear',
  },
  {
    relativePath: '15_hashing/separate_chaining.cpp',
    weekLabel: 'Week 15 • Hashing',
    title: 'Separate Chaining Hash Table (Linked Buckets)',
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
