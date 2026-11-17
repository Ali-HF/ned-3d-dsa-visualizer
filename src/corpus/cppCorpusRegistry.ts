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
    scene: 'avl',
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

/** Default main() source code previously present in each cpp_corpus file. */
export const CORPUS_DEFAULT_DRIVERS: Record<string, string> = {
  "01_arrays_and_searching/array_operations.cpp": "int main()\n{\n    int arr[100], n, choice, pos, value;\n\n    cout << \"Enter array size: \";\n    cin >> n;\n\n    cout << \"Enter array elements: \";\n    for (int i = 0; i < n; i++)\n    {\n        cin >> arr[i];\n    }\n\n    cout << \"\\n1. Insert\";\n    cout << \"\\n2. Delete by Index\";\n    cout << \"\\n3. Update\";\n    cout << \"\\n4. Reverse\";\n    cout << \"\\n5. Rotate Right\";\n    cout << \"\\n6. Delete by Value\";\n\n    cout << \"\\nEnter choice: \";\n    cin >> choice;\n\n    switch (choice)\n    {\n        case 1:\n            cout << \"Enter position and value: \";\n            cin >> pos >> value;\n            insertAt(arr, n, pos, value);\n            break;\n\n        case 2:\n            cout << \"Enter position to delete: \";\n            cin >> pos;\n            deleteAtIndex(arr, n, pos);\n            break;\n\n        case 3:\n            cout << \"Enter position and new value: \";\n            cin >> pos >> value;\n            updateAt(arr, n, pos, value);\n            break;\n\n        case 4:\n            reverseArray(arr, n);\n            break;\n\n        case 5:\n            rotateRight(arr, n);\n            break;\n\n        case 6:\n            cout << \"Enter value to delete: \";\n            cin >> value;\n            deleteByValue(arr, n, value);\n            break;\n\n        default:\n            cout << \"Invalid choice\";\n    }\n\n    cout << \"\\nUpdated Array: \";\n    for (int i = 0; i < n; i++)\n    {\n        cout << arr[i] << \" \";\n    }\n\n    return 0;\n}\n",
  "01_arrays_and_searching/binary_search.cpp": "int main()\n{\n    int arr[100], n, key;\n\n    cout << \"Enter array size: \";\n    cin >> n;\n\n    cout << \"Enter sorted array elements: \";\n\n    for (int i = 0; i < n; i++)\n    {\n        cin >> arr[i];\n    }\n\n    cout << \"Enter search value: \";\n    cin >> key;\n\n    cout << \"/nIterative Search: \"\n         << binarySearch(arr, n, key);\n\n    cout << \"/nRecursive Search: \"\n         << recursiveBinarySearch(arr, 0, n - 1, key);\n\n    cout << \"/nLower Bound: \"\n         << lowerBound(arr, n, key);\n\n    cout << \"/nUpper Bound: \"\n         << upperBound(arr, n, key);\n\n    cout << \"/nFirst Occurrence: \"\n         << firstOccurrence(arr, n, key);\n\n    cout << \"/nLast Occurrence: \"\n         << lastOccurrence(arr, n, key);\n\n    return 0;\n}\n",
  "01_arrays_and_searching/linear_search.cpp": "int main()\n{\n    int arr[100], n, key;\n\n    cout << \"Enter array size: \";\n    cin >> n;\n\n    cout << \"Enter array elements: \";\n\n    for (int i = 0; i < n; i++)\n    {\n        cin >> arr[i];\n    }\n\n    cout << \"Enter value to search: \";\n    cin >> key;\n\n    int result = linearSearch(arr, n, key);\n\n    if (result != -1)\n        cout << \"Iterative: Found at index \" << result << endl;\n    else\n        cout << \"Iterative: Not found\" << endl;\n\n    result = recursiveSearch(arr, n, key, 0);\n\n    if (result != -1)\n        cout << \"Recursive: Found at index \" << result;\n    else\n        cout << \"Recursive: Not found\";\n\n    return 0;\n}\n",
  "02_singly_linked_list/linked_list_sort.cpp": "int main()\n{\n    Node* head = NULL;\n    int n, value, choice;\n\n    cout << \"Enter number of nodes: \";\n    cin >> n;\n\n    cout << \"Enter elements: \";\n\n    for (int i = 0; i < n; i++)\n    {\n        cin >> value;\n        insertEnd(head, value);\n    }\n\n    cout << \"/n1. Bubble Sort\";\n    cout << \"/n2. Merge Sort\";\n    cout << \"/nEnter choice: \";\n    cin >> choice;\n\n    cout << \"/nOriginal List: \";\n    display(head);\n\n    if (choice == 1)\n        bubbleSort(head);\n    else if (choice == 2)\n        head = mergeSort(head);\n    else\n        cout << \"Invalid choice/n\";\n\n    cout << \"Sorted List: \";\n    display(head);\n\n    return 0;\n}\n",
  "02_singly_linked_list/singly_linked_list.cpp": "int main()\n{\n    int choice, value, pos;\n\n    cout << \"1. Insert at beginning/n\";\n    cout << \"2. Insert at end/n\";\n    cout << \"3. Insert at position/n\";\n    cout << \"4. Delete from beginning/n\";\n    cout << \"5. Delete from end/n\";\n    cout << \"6. Delete at position/n\";\n    cout << \"7. Search/n\";\n    cout << \"8. Reverse/n\";\n    cout << \"9. Display/n\";\n\n    cout << \"Enter choice: \";\n    cin >> choice;\n\n    switch (choice)\n    {\n        case 1:\n            cout << \"Enter value: \";\n            cin >> value;\n            insertBeginning(value);\n            break;\n\n        case 2:\n            cout << \"Enter value: \";\n            cin >> value;\n            insertEnd(value);\n            break;\n\n        case 3:\n            cout << \"Enter value and position: \";\n            cin >> value >> pos;\n            insertPosition(value, pos);\n            break;\n\n        case 4:\n            deleteBeginning();\n            break;\n\n        case 5:\n            deleteEnd();\n            break;\n\n        case 6:\n            cout << \"Enter position: \";\n            cin >> pos;\n            deletePosition(pos);\n            break;\n\n        case 7:\n            cout << \"Enter value to search: \";\n            cin >> value;\n            search(value);\n            break;\n\n        case 8:\n            reverseList();\n            break;\n\n        case 9:\n            display();\n            break;\n\n        default:\n            cout << \"Invalid choice/n\";\n    }\n\n    cout << \"/nLinked List: \";\n    display();\n\n    return 0;\n}\n",
  "02_singly_linked_list/viva_middle_and_merge.cpp": "int main()\n{\n    Node* list1 = NULL;\n    Node* list2 = NULL;\n\n    int n, value;\n\n    cout << \"Enter size of first list: \";\n    cin >> n;\n\n    cout << \"Enter sorted elements: \";\n\n    for (int i = 0; i < n; i++)\n    {\n        cin >> value;\n        insertEnd(list1, value);\n    }\n\n    cout << \"Enter size of second list: \";\n    cin >> n;\n\n    cout << \"Enter sorted elements: \";\n\n    for (int i = 0; i < n; i++)\n    {\n        cin >> value;\n        insertEnd(list2, value);\n    }\n\n    Node* middle = findMiddle(list1);\n\n    if (middle != NULL)\n        cout << \"/nMiddle of first list: \" << middle->data;\n\n    Node* merged = mergeLists(list1, list2);\n\n    cout << \"/nMerged List: \";\n    display(merged);\n\n    return 0;\n}\n",
  "03_doubly_circular_linked_list/circular_singly_linked_list.cpp": "int main()\n{\n    int choice, value;\n\n    do\n    {\n        cout << \"/n--- Circular Linked List ---/n\";\n        cout << \"1. Insert at Beginning/n\";\n        cout << \"2. Insert at End/n\";\n        cout << \"3. Delete from Beginning/n\";\n        cout << \"4. Display/n\";\n        cout << \"5. Exit/n\";\n\n        cout << \"Enter choice: \";\n        cin >> choice;\n\n        switch (choice)\n        {\n            case 1:\n                cout << \"Enter value: \";\n                cin >> value;\n                insertBeginning(value);\n                break;\n\n            case 2:\n                cout << \"Enter value: \";\n                cin >> value;\n                insertEnd(value);\n                break;\n\n            case 3:\n                deleteBeginning();\n                break;\n\n            case 4:\n                display();\n                break;\n\n            case 5:\n                cout << \"Exiting program.../n\";\n                break;\n\n            default:\n                cout << \"Invalid choice!/n\";\n        }\n\n    } while (choice != 5);\n\n    return 0;\n}\n\n",
  "03_doubly_circular_linked_list/doubly_linked_list.cpp": "int main()\n{\n    int choice, value;\n\n    cout << \"1. Insert Beginning/n\";\n    cout << \"2. Insert End/n\";\n    cout << \"3. Delete Beginning/n\";\n    cout << \"4. Delete End/n\";\n    cout << \"5. Display Forward/n\";\n    cout << \"6. Display Backward/n\";\n\n    cout << \"Enter choice: \";\n    cin >> choice;\n\n    switch (choice)\n    {\n        case 1:\n            cout << \"Enter value: \";\n            cin >> value;\n            insertBeginning(value);\n            break;\n\n        case 2:\n            cout << \"Enter value: \";\n            cin >> value;\n            insertEnd(value);\n            break;\n\n        case 3:\n            deleteBeginning();\n            break;\n\n        case 4:\n            deleteEnd();\n            break;\n\n        case 5:\n            displayForward();\n            break;\n\n        case 6:\n            displayBackward();\n            break;\n\n        default:\n            cout << \"Invalid choice\";\n    }\n\n    cout << \"/nForward: \";\n    displayForward();\n\n    cout << \"Backward: \";\n    displayBackward();\n\n    return 0;\n}\n",
  "03_doubly_circular_linked_list/floyd_cycle_detection.cpp": "int main()\n{\n    Node* head = NULL;\n\n    int n, value;\n\n    cout << \"Enter number of nodes: \";\n    cin >> n;\n\n    cout << \"Enter elements: \";\n\n    for (int i = 0; i < n; i++)\n    {\n        cin >> value;\n        insertEnd(head, value);\n    }\n\n    // Check for cycle\n    if (detectCycle(head))\n    {\n        cout << \"Cycle detected\";\n    }\n    else\n    {\n        cout << \"No cycle detected\";\n    }\n\n    return 0;\n}\n",
  "04_recursion_and_stack/stack_array.cpp": "int main()\n{\n    int choice, value;\n\n    do\n    {\n        cout << \"/n--- Stack Using Array ---/n\";\n        cout << \"1. Push/n\";\n        cout << \"2. Pop/n\";\n        cout << \"3. Peek/n\";\n        cout << \"4. Display/n\";\n        cout << \"5. Check Empty/n\";\n        cout << \"6. Check Full/n\";\n        cout << \"7. Exit/n\";\n\n        cout << \"Enter choice: \";\n        cin >> choice;\n\n        switch (choice)\n        {\n            case 1:\n                cout << \"Enter value: \";\n                cin >> value;\n                push(value);\n                break;\n\n            case 2:\n                pop();\n                break;\n\n            case 3:\n                peek();\n                break;\n\n            case 4:\n                display();\n                break;\n\n            case 5:\n                if (topIndex == -1)\n                    cout << \"Stack is empty./n\";\n                else\n                    cout << \"Stack is not empty./n\";\n                break;\n\n            case 6:\n                if (topIndex == 99)\n                    cout << \"Stack is full./n\";\n                else\n                    cout << \"Stack is not full./n\";\n                break;\n\n            case 7:\n                cout << \"Exiting.../n\";\n                break;\n\n            default:\n                cout << \"Invalid choice!/n\";\n        }\n\n    } while (choice != 7);\n\n    return 0;\n}",
  "04_recursion_and_stack/stack_linked_list.cpp": "int main()\n{\n    int choice, value;\n\n    do\n    {\n        cout << \"/n--- Stack Using Linked List ---/n\";\n        cout << \"1. Push/n\";\n        cout << \"2. Pop/n\";\n        cout << \"3. Peek/n\";\n        cout << \"4. Display/n\";\n        cout << \"5. Check Empty/n\";\n        cout << \"6. Exit/n\";\n\n        cout << \"Enter choice: \";\n        cin >> choice;\n\n        switch (choice)\n        {\n            case 1:\n                cout << \"Enter value: \";\n                cin >> value;\n                push(value);\n                break;\n\n            case 2:\n                pop();\n                break;\n\n            case 3:\n                peek();\n                break;\n\n            case 4:\n                display();\n                break;\n\n            case 5:\n                if (topNode == NULL)\n                    cout << \"Stack is empty./n\";\n                else\n                    cout << \"Stack is not empty./n\";\n                break;\n\n            case 6:\n                cout << \"Exiting.../n\";\n                break;\n\n            default:\n                cout << \"Invalid choice!/n\";\n        }\n\n    } while (choice != 6);\n\n    // Free remaining nodes\n    while (topNode != NULL)\n    {\n        Node* temp = topNode;\n        topNode = topNode->next;\n        delete temp;\n    }\n\n    return 0;\n}",
  "04_recursion_and_stack/viva_stack_applications.cpp": "int main()\n{\n    int choice;\n    char expression[100];\n    char postfix[100];\n\n    do\n    {\n        cout << \"/n--- Stack Applications ---/n\";\n        cout << \"1. Check Balanced Parentheses/n\";\n        cout << \"2. Infix to Postfix/n\";\n        cout << \"3. Evaluate Postfix/n\";\n        cout << \"4. Exit/n\";\n\n        cout << \"Enter choice: \";\n        cin >> choice;\n\n        switch (choice)\n        {\n            case 1:\n                cout << \"Enter expression: \";\n                cin >> expression;\n\n                if (balancedParentheses(expression))\n                    cout << \"Parentheses are Balanced./n\";\n                else\n                    cout << \"Parentheses are Not Balanced./n\";\n\n                break;\n\n            case 2:\n                cout << \"Enter infix expression: \";\n                cin >> expression;\n\n                infixToPostfix(expression, postfix);\n\n                cout << \"Postfix expression: \" << postfix << endl;\n                break;\n\n            case 3:\n                cout << \"Enter postfix expression: \";\n                cin >> expression;\n\n                {\n                    int answer = evaluatePostfix(expression);\n\n                    if (answer == -999999)\n                        cout << \"Invalid expression or division by zero./n\";\n                    else\n                        cout << \"Result: \" << answer << endl;\n                }\n\n                break;\n\n            case 4:\n                cout << \"Exiting.../n\";\n                break;\n\n            default:\n                cout << \"Invalid choice!/n\";\n        }\n\n    } while (choice != 4);\n\n    return 0;\n}",
  "05_queues_and_deque/deque.cpp": "int main() {\n    Deque d;\n    d.insertRear(10);\n    d.insertRear(20);\n    d.insertFront(5);\n    d.insertFront(1);\n    d.display();\n    d.deleteFront();\n    d.deleteRear();\n    d.display();\n    return 0;\n}\n",
  "05_queues_and_deque/queue_array_and_circular.cpp": "int main() {\n    cout << \"Linear Queue\" << endl;\n    LinearQueue lq;\n    lq.enqueue(10);\n    lq.enqueue(20);\n    lq.enqueue(30);\n    lq.display();\n    lq.dequeue();\n    lq.display();\n\n    cout << endl << \"Circular Queue\" << endl;\n    CircularQueue cq;\n    cq.enqueue(1);\n    cq.enqueue(2);\n    cq.enqueue(3);\n    cq.enqueue(4);\n    cq.enqueue(5);\n    cq.enqueue(6);\n    cq.dequeue();\n    cq.dequeue();\n    cq.enqueue(7);\n    cq.enqueue(8);\n    cq.display();\n\n    return 0;\n}\n",
  "06_elementary_sorting/bubble_sort.cpp": "int main()\n{\n    int arr[100], n;\n\n    cout << \"Enter array size: \";\n    cin >> n;\n\n    cout << \"Enter elements: \";\n    for (int i = 0; i < n; i++)\n    {\n        cin >> arr[i];\n    }\n\n    bubbleSort(arr, n);\n\n    cout << \"Sorted Array: \";\n\n    for (int i = 0; i < n; i++)\n    {\n        cout << arr[i] << \" \";\n    }\n\n    return 0;\n}\n",
  "06_elementary_sorting/insertion_sort.cpp": "int main()\n{\n    int arr[100], n;\n\n    cout << \"Enter array size: \";\n    cin >> n;\n\n    cout << \"Enter elements: \";\n    for (int i = 0; i < n; i++)\n    {\n        cin >> arr[i];\n    }\n\n    insertionSort(arr, n);\n\n    cout << \"Sorted Array: \";\n\n    for (int i = 0; i < n; i++)\n    {\n        cout << arr[i] << \" \";\n    }\n\n    return 0;\n}\n",
  "06_elementary_sorting/selection_sort.cpp": "int main()\n{\n    int arr[100], n;\n\n    cout << \"Enter array size: \";\n    cin >> n;\n\n    cout << \"Enter elements: \";\n    for (int i = 0; i < n; i++)\n    {\n        cin >> arr[i];\n    }\n\n    selectionSort(arr, n);\n\n    cout << \"Sorted Array: \";\n\n    for (int i = 0; i < n; i++)\n    {\n        cout << arr[i] << \" \";\n    }\n\n    return 0;\n}\n",
  "07_advanced_sorting/merge_sort.cpp": "int main()\n{\n    int arr[100], n;\n\n    cout << \"Enter array size: \";\n    cin >> n;\n\n    cout << \"Enter elements: \";\n    for (int i = 0; i < n; i++)\n    {\n        cin >> arr[i];\n    }\n\n    mergeSort(arr, 0, n - 1);\n\n    cout << \"Sorted Array: \";\n\n    for (int i = 0; i < n; i++)\n    {\n        cout << arr[i] << \" \";\n    }\n\n    return 0;\n}\n",
  "07_advanced_sorting/quick_sort.cpp": "int main()\n{\n    int arr[100], n;\n\n    cout << \"Enter array size: \";\n    cin >> n;\n\n    cout << \"Enter elements: \";\n\n    for (int i = 0; i < n; i++)\n    {\n        cin >> arr[i];\n    }\n\n    quickSort(arr, 0, n - 1);\n\n    cout << \"Sorted Array: \";\n\n    for (int i = 0; i < n; i++)\n    {\n        cout << arr[i] << \" \";\n    }\n\n    return 0;\n}\n",
  "09_binary_tree/binary_tree_traversals.cpp": "int main()\n{\n    BinaryTree tree;\n\n    for (int i = 1; i <= 7; i++) // construct complete binary tree with values 1..7\n    {\n        tree.insertLevelOrder(i);\n    }\n\n    cout << \"Preorder traversal (DFS):    \";\n    tree.preOrder();\n\n    cout << \"Inorder traversal (DFS):     \";\n    tree.inOrder();\n\n    cout << \"Postorder traversal (DFS):   \";\n    tree.postOrder();\n\n    cout << \"Level-order traversal (BFS): \";\n    tree.levelOrder();\n\n    return 0;\n}\n\n",
  "09_binary_tree/viva_tree_utilities.cpp": "int main()\n{\n    TreeNode* root = new TreeNode(1); // construct sample binary tree\n    root->left = new TreeNode(2);\n    root->right = new TreeNode(3);\n    root->left->left = new TreeNode(4);\n    root->left->right = new TreeNode(5);\n    root->right->right = new TreeNode(6);\n\n    cout << \"Original tree (in-order): \";\n    printInOrder(root);\n    cout << endl;\n\n    cout << \"Tree height:      \" << getHeight(root) << endl;\n    cout << \"Total nodes:      \" << countTotalNodes(root) << endl;\n    cout << \"Leaf node count:  \" << countLeafNodes(root) << endl;\n\n    mirrorTree(root); // invert tree structure\n\n    cout << \"Mirrored tree (in-order): \";\n    printInOrder(root);\n    cout << endl;\n\n    destroyTree(root);\n    return 0;\n}\n\n",
  "10_heap_and_priority_queue/heap_sort.cpp": "int main()\n{\n    vector<int> arr = {12, 11, 13, 5, 6, 7, -3, 13};\n\n    cout << \"Original array: \";\n    printArray(arr);\n\n    heapSort(arr);\n\n    cout << \"Sorted array:   \";\n    printArray(arr);\n\n    return 0;\n}\n\n",
  "10_heap_and_priority_queue/max_heap.cpp": "int main()\n{\n    MaxHeap pq;\n    pq.insert(15);\n    pq.insert(40);\n    pq.insert(25);\n    pq.insert(60);\n    pq.insert(10);\n\n    cout << \"Max-Heap after insertions: \";\n    pq.printHeap();\n    cout << \"Current max (peek): \" << pq.peekMax() << endl;\n\n    cout << \"Extracting elements in descending order: \";\n    while (!pq.empty())\n    {\n        cout << pq.extractMax() << \" \";\n    }\n    cout << endl;\n\n    vector<int> raw = {4, 10, 3, 5, 1, 18, 12};\n    pq.buildHeap(raw); // O(n) bottom-up construction\n\n    cout << \"Heap built from [4, 10, 3, 5, 1, 18, 12]: \";\n    pq.printHeap();\n\n    return 0;\n}\n\n",
  "11_binary_search_tree/binary_search_tree.cpp": "int main()\n{\n    BinarySearchTree bst;\n    int values[] = {50, 30, 70, 20, 40, 60, 80, 65};\n\n    for (int val : values)\n    {\n        bst.insert(val);\n    }\n\n    cout << \"Initial BST (in-order): \";\n    bst.inOrder();\n\n    cout << \"Search 40: \" << (bst.search(40) ? \"Found\" : \"Not Found\") << endl;\n    cout << \"Search 99: \" << (bst.search(99) ? \"Found\" : \"Not Found\") << endl;\n\n    bst.deleteKey(20); // case 1: delete leaf node\n    cout << \"After deleting 20 (leaf):          \";\n    bst.inOrder();\n\n    bst.deleteKey(60); // case 2: delete node with single child (65)\n    cout << \"After deleting 60 (single child):  \";\n    bst.inOrder();\n\n    bst.deleteKey(50); // case 3: delete root with two children\n    cout << \"After deleting 50 (two children):  \";\n    bst.inOrder();\n\n    return 0;\n}\n\n",
  "11_binary_search_tree/viva_bst_validation_and_lca.cpp": "int main()\n{\n    TreeNode* validRoot = new TreeNode(20); // construct valid BST\n    validRoot->left = new TreeNode(10);\n    validRoot->right = new TreeNode(30);\n    validRoot->left->left = new TreeNode(5);\n    validRoot->left->right = new TreeNode(15);\n    validRoot->right->left = new TreeNode(25);\n    validRoot->right->right = new TreeNode(35);\n\n    cout << \"Tree 1 is valid BST: \" << (isValidBST(validRoot) ? \"true\" : \"false\") << endl;\n\n    TreeNode* lca1 = findLCA(validRoot, 5, 15);\n    cout << \"LCA(5, 15) = \" << (lca1 != nullptr ? to_string(lca1->val) : \"Not found\") << endl;\n\n    TreeNode* lca2 = findLCA(validRoot, 5, 30);\n    cout << \"LCA(5, 30) = \" << (lca2 != nullptr ? to_string(lca2->val) : \"Not found\") << endl;\n\n    TreeNode* lca3 = findLCA(validRoot, 10, 15);\n    cout << \"LCA(10, 15) = \" << (lca3 != nullptr ? to_string(lca3->val) : \"Not found\") << endl;\n\n    TreeNode* invalidRoot = new TreeNode(20); // construct invalid BST (22 in left subtree of 20)\n    invalidRoot->left = new TreeNode(10);\n    invalidRoot->right = new TreeNode(30);\n    invalidRoot->left->right = new TreeNode(22);\n\n    cout << \"Tree 2 is valid BST: \" << (isValidBST(invalidRoot) ? \"true\" : \"false\") << endl;\n\n    destroyTree(validRoot);\n    destroyTree(invalidRoot);\n    return 0;\n}\n\n",
  "12_avl_tree/avl_tree.cpp": "int main()\n{\n    AVLTree llTree;\n    llTree.insert(30);\n    llTree.insert(20);\n    llTree.insert(10); // triggers LL rotation\n    cout << \"LL Rotation (30, 20, 10) preorder: \";\n    llTree.preOrder();\n\n    AVLTree rrTree;\n    rrTree.insert(10);\n    rrTree.insert(20);\n    rrTree.insert(30); // triggers RR rotation\n    cout << \"RR Rotation (10, 20, 30) preorder: \";\n    rrTree.preOrder();\n\n    AVLTree lrTree;\n    lrTree.insert(30);\n    lrTree.insert(10);\n    lrTree.insert(20); // triggers LR rotation\n    cout << \"LR Rotation (30, 10, 20) preorder: \";\n    lrTree.preOrder();\n\n    AVLTree rlTree;\n    rlTree.insert(10);\n    rlTree.insert(30);\n    rlTree.insert(20); // triggers RL rotation\n    cout << \"RL Rotation (10, 30, 20) preorder: \";\n    rlTree.preOrder();\n\n    AVLTree fullTree;\n    int keys[] = {10, 20, 30, 40, 50, 25};\n    for (int k : keys)\n    {\n        fullTree.insert(k);\n    }\n    cout << \"Combined AVL in-order:  \";\n    fullTree.inOrder();\n    cout << \"Combined AVL preorder:  \";\n    fullTree.preOrder();\n\n    return 0;\n}\n\n",
  "13_graph_traversal/bfs_dfs_traversal.cpp": "int main() {\n    for (int i = 0; i < V; i++) {\n        graph[i] = NULL;\n    }\n\n    addEdge(0, 1);\n    addEdge(0, 2);\n    addEdge(1, 3);\n    addEdge(1, 4);\n    addEdge(2, 5);\n\n    cout << \"BFS: \";\n    resetVisited();\n    bfs(0);\n\n    cout << \"DFS: \";\n    resetVisited();\n    dfs(0);\n    cout << endl;\n\n    return 0;\n}\n",
  "13_graph_traversal/graph_representations.cpp": "int main() {\n    cout << \"Undirected Graph - Adjacency Matrix\" << endl;\n    MatrixGraph m1;\n    m1.addEdge(0, 1);\n    m1.addEdge(0, 2);\n    m1.addEdge(1, 3);\n    m1.addEdge(2, 4);\n    m1.display();\n\n    cout << endl << \"Directed Graph - Adjacency Matrix\" << endl;\n    MatrixGraph m2;\n    m2.addDirectedEdge(0, 1);\n    m2.addDirectedEdge(0, 2);\n    m2.addDirectedEdge(1, 3);\n    m2.addDirectedEdge(2, 4);\n    m2.display();\n\n    cout << endl << \"Undirected Graph - Adjacency List\" << endl;\n    ListGraph l1;\n    l1.addEdge(0, 1);\n    l1.addEdge(0, 2);\n    l1.addEdge(1, 3);\n    l1.addEdge(2, 4);\n    l1.display();\n\n    cout << endl << \"Directed Graph - Adjacency List\" << endl;\n    ListGraph l2;\n    l2.addDirectedEdge(0, 1);\n    l2.addDirectedEdge(0, 2);\n    l2.addDirectedEdge(1, 3);\n    l2.addDirectedEdge(2, 4);\n    l2.display();\n\n    return 0;\n}\n",
  "14_graph_mst_toposort/dijkstra.cpp": "int main() {\n    for (int i = 0; i < V; i++) {\n        for (int j = 0; j < V; j++) {\n            graph[i][j] = 0;\n        }\n    }\n\n    addEdge(0, 1, 4);\n    addEdge(0, 2, 1);\n    addEdge(2, 1, 2);\n    addEdge(1, 3, 1);\n    addEdge(2, 3, 5);\n    addEdge(3, 4, 3);\n\n    dijkstra(0);\n\n    return 0;\n}\n",
  "14_graph_mst_toposort/kruskal_mst.cpp": "int main() {\n    edges[0] = {0, 1, 4};\n    edges[1] = {0, 2, 3};\n    edges[2] = {1, 2, 1};\n    edges[3] = {1, 3, 2};\n    edges[4] = {2, 3, 5};\n    edges[5] = {3, 4, 7};\n    edges[6] = {2, 4, 6};\n\n    kruskal();\n\n    return 0;\n}\n",
  "14_graph_mst_toposort/topological_sort.cpp": "int main() {\n    for (int i = 0; i < V; i++) {\n        for (int j = 0; j < V; j++) {\n            graph[i][j] = 0;\n        }\n    }\n\n    addEdge(5, 2);\n    addEdge(5, 0);\n    addEdge(4, 0);\n    addEdge(4, 1);\n    addEdge(2, 3);\n    addEdge(3, 1);\n\n    topologicalSort();\n\n    return 0;\n}\n",
  "15_hashing/linear_probing.cpp": "int main()\n{\n    HashTableLinearProbing ht(7);\n\n    ht.insert(10); // 10 % 7 = 3\n    ht.insert(17); // 17 % 7 = 3 -> probes to 4\n    ht.insert(24); // 24 % 7 = 3 -> probes to 5\n    ht.insert(5);  // 5 % 7 = 5 -> probes to 6\n\n    ht.display();\n\n    cout << \"/nDeleting 17 (places tombstone at index 4)...\" << endl;\n    ht.remove(17);\n    ht.display();\n\n    cout << \"/nSearch 24 (must probe past tombstone): \" << (ht.search(24) ? \"Found\" : \"Not Found\") << endl;\n    cout << \"Search 17: \" << (ht.search(17) ? \"Found\" : \"Not Found\") << endl;\n\n    cout << \"/nInserting 31 (31 % 7 = 3, reuses tombstone at index 4)...\" << endl;\n    ht.insert(31);\n    ht.display();\n\n    return 0;\n}\n\n",
  "15_hashing/separate_chaining.cpp": "int main()\n{\n    HashTableSeparateChaining ht(5);\n\n    int keys[] = {10, 15, 20, 7, 12, 22, 3}; // 10, 15, 20 collide at 0; 7, 12, 22 collide at 2\n    for (int k : keys)\n    {\n        ht.insert(k);\n    }\n\n    cout << \"Hash Table after insertions:\" << endl;\n    ht.display();\n\n    cout << \"/nSearch 12: \" << (ht.search(12) ? \"Found\" : \"Not Found\") << endl;\n    cout << \"Search 99: \" << (ht.search(99) ? \"Found\" : \"Not Found\") << endl;\n\n    cout << \"/nDeleting 15 (middle of bucket 0) and 22 (head of bucket 2)...\" << endl;\n    ht.remove(15);\n    ht.remove(22);\n    ht.display();\n\n    return 0;\n}\n\n"
};


/**
 * Appends the default runtime driver (generated main()) below a corpus file source code.
 */
export function appendCorpusDriver(relativePath: string, sourceCode?: string): string {
  const base = sourceCode ?? getCorpusRawText(relativePath);
  const driver = CORPUS_DEFAULT_DRIVERS[relativePath];
  if (!driver) return base;
  return base.trimEnd() + "\n\n" + driver + "\n";
}
