# NED University CT-159 — C++ DSA Corpus Checklist

**Course Code:** CT-159 — *Data Structure Algorithms & Applications*  
**Department:** Computer Science & Information Technology (NED University)  
**Instructor:** Furqan Hussain Essani (Reviewed by Dr. Muhammad Mubashir Khan, CCS)  
**Class / Batch:** 2nd Year (Batch 2025) — Fall 2026  

---

## Week 1: Introduction, ADT, Linear & Binary Search (`01_arrays_and_searching/`)
- [ ] Array ADT — Insert at Index (`0`, middle `idx`, tail `n` with right-shift)
- [ ] Array ADT — Delete at Index (with left-shift)
- [ ] Array ADT — Update / Access at Index (`arr[idx] = val`)
- [ ] Array ADT — Reverse In-Place & Rotate Left / Right by `k`
- [ ] Linear Search (Iterative & Recursive)
- [ ] Binary Search (Iterative & Recursive)
- [ ] Binary Search — First / Last Occurrence (Duplicates / Lower & Upper Bound)

## Week 2: Singly Linked List (`02_singly_linked_list/`)
- [ ] Singly Linked List — Insert at Head, Tail, and Position `k`
- [ ] Singly Linked List — Delete Head, Tail, and by Value / Position `k`
- [ ] Singly Linked List — Search by Value
- [ ] Singly Linked List — Reverse (Iterative 3-pointer: `prev`, `curr`, `next`)
- [ ] Singly Linked List — Reverse (Recursive)
- [ ] Singly Linked List — Traverse / Display
- [ ] Linked List Sorting (Merge Sort / Bubble Sort on nodes)
- [ ] *Viva Staple:* Find Middle Node (Slow & Fast Pointer technique)
- [ ] *Viva Staple:* Merge Two Sorted Linked Lists

## Week 3: Doubly & Circular Linked List (`03_doubly_circular_linked_list/`)
- [ ] Doubly Linked List — Insert at Head, Tail, Position `k`
- [ ] Doubly Linked List — Delete at Head, Tail, by Value / Position
- [ ] Doubly Linked List — Search & Reverse (`swap(curr->prev, curr->next)`)
- [ ] Doubly Linked List — Forward & Backward Traversal
- [ ] Circular Singly Linked List — Insert at Head & Tail
- [ ] Circular Singly Linked List — Delete at Head, Tail, and by Value
- [ ] Circular Singly Linked List — Search & Traverse (`do ... while (curr != head)`)
- [ ] *Viva Staple:* Floyd’s Cycle Detection (Tortoise & Hare loop check)

## Week 4: Recursion & Stack (`04_recursion_and_stack/`)
- [ ] Stack (Array-based ADT) — `push`, `pop`, `peek` / `top`, `isEmpty`, `isFull`
- [ ] Stack (Linked-List-based ADT) — `push`, `pop`, `peek` / `top`
- [ ] Stack (`std::stack<int>`) — `push`, `pop`, `top`
- [ ] Recursion Call Stack — Factorial & Fibonacci
- [ ] *Viva Staple:* Tower of Hanoi (3 pegs recursion)
- [ ] *Viva Staple:* Balanced Parentheses / Bracket Matching (`{[()]}`)
- [ ] *Viva Staple:* Infix to Postfix Conversion
- [ ] *Viva Staple:* Postfix Expression Evaluation

## Week 5: Queue, Circular Queue & Double-Ended Queue (`05_queues_and_deque/`)
- [ ] Linear Queue (Array-based) — `enqueue`, `dequeue`, `peek` / `front`
- [ ] Linear Queue (Linked-List-based with `front` & `rear` pointers)
- [ ] Circular Queue (Array-based with `(rear + 1) % capacity`) — `enqueue`, `dequeue`, `peek`
- [ ] Double-Ended Queue / Deque — `insertFront`, `insertRear`, `deleteFront`, `deleteRear`, `getFront`, `getRear`
- [ ] Queue (`std::queue<int>` / `std::deque<int>`)

## Week 6: Elementary Sorting Techniques (`06_elementary_sorting/`)
- [ ] Bubble Sort (Standard nested loop)
- [ ] Bubble Sort (Early-exit optimized with `bool swapped`)
- [ ] Insertion Sort (Shift-based `arr[j + 1] = arr[j]`)
- [ ] Insertion Sort (Swap-based)
- [ ] Selection Sort (Finding `minIdx` per pass)

## Week 7: Advanced Sorting Techniques (`07_advanced_sorting/`)
- [ ] Merge Sort (Top-down recursive `mergeSort` + `merge` with `aux[]` / `L[]` & `R[]`)
- [ ] Quick Sort — Lomuto Partition (pivot at `arr[high]`)
- [ ] Quick Sort — Hoare Partition / Median-of-Three Partition

## Week 9: Binary Tree (`09_binary_tree/`)
- [ ] Binary Tree — Node Creation & Level-Order Construction (using Queue)
- [ ] Binary Tree Traversals: Preorder (NLR), Inorder (LNR), Postorder (LRN)
- [ ] Binary Tree — Level-Order Traversal (BFS queue)
- [ ] *Viva Staple:* Calculate Tree Height / Maximum Depth
- [ ] *Viva Staple:* Count Total Nodes and Leaf Nodes
- [ ] *Viva Staple:* Invert / Mirror Binary Tree

## Week 10: Binary Heap, Heap Sort & Priority Queue (`10_heap_and_priority_queue/`)
- [ ] Max-Heap — Insert (`siftUp` / Bubble-Up)
- [ ] Max-Heap — Extract Max (`siftDown` / Bubble-Down)
- [ ] Min-Heap — Insert & Extract Min
- [ ] Build Heap (`O(n)` bottom-up `heapify`)
- [ ] Heap Sort (Build Max-Heap + in-place root swap & `siftDown`)
- [ ] Priority Queue ADT (Heap-backed)

## Week 11: Binary Search Tree (`11_binary_search_tree/`)
- [ ] BST — Insert (Recursive & Iterative)
- [ ] BST — Search (Recursive & Iterative)
- [ ] BST — Find Minimum & Find Maximum
- [ ] BST — Delete Case 1: Leaf Node (`left == nullptr && right == nullptr`)
- [ ] BST — Delete Case 2: Node with One Child
- [ ] BST — Delete Case 3: Node with Two Children (In-Order Successor / Predecessor replacement)
- [ ] BST — Inorder Traversal (produces sorted output)
- [ ] *Viva Staple:* Check if a Binary Tree is a Valid BST (`isValidBST`)
- [ ] *Viva Staple:* Lowest Common Ancestor (LCA) in BST

## Week 12: AVL Tree (`12_avl_tree/`)
- [ ] AVL Tree — Node Height & Balance Factor (`height(left) - height(right)`)
- [ ] AVL Tree — LL Imbalance → Right Rotation (`rightRotate`)
- [ ] AVL Tree — RR Imbalance → Left Rotation (`leftRotate`)
- [ ] AVL Tree — LR Imbalance → Left-Right Double Rotation
- [ ] AVL Tree — RL Imbalance → Right-Left Double Rotation
- [ ] AVL Tree — Delete Node with Rebalancing Rotations

## Week 13: Graph — Representation & Traversal (`13_graph_traversal/`)
- [ ] Graph Representation — Adjacency Matrix (`int adj[V][V]`)
- [ ] Graph Representation — Adjacency List (`vector<vector<int>>` or `Node* adj[V]`)
- [ ] Graph Operations — Add / Remove Vertex & Add / Remove Edge (Directed & Undirected)
- [ ] Breadth-First Search (BFS with Queue & `visited[]`)
- [ ] Depth-First Search (DFS Recursive & Iterative using Stack)
- [ ] *Viva Staple:* Cycle Detection in Undirected Graph (BFS/DFS)
- [ ] *Viva Staple:* Cycle Detection in Directed Graph (Recursion Stack / Colors)

## Week 14: Graph — Minimum Spanning Tree & Topological Sorting (`14_graph_mst_toposort/`)
- [ ] Minimum Spanning Tree — Prim's Algorithm (`key[]`, `parent[]`, `inMST[]`)
- [ ] Disjoint Set Union (DSU / Union-Find with `find` & `unionByRank`) — *required for Kruskal's*
- [ ] Minimum Spanning Tree — Kruskal's Algorithm (Edge List sort + DSU)
- [ ] Topological Sorting — Kahn's Algorithm (In-Degree array + Queue BFS on DAG)
- [ ] Topological Sorting — DFS Post-Order Stack Method
- [ ] Dijkstra's Shortest Path Algorithm (Single-Source Shortest Path)

## Week 15: Hashing — Hash Functions & Collision Resolution (`15_hashing/`)
- [ ] Hash Functions — Division Method (`key % m`), Mid-Square / Folding
- [ ] Open Addressing — Linear Probing (`(hash + i) % m`) with Insert, Search, and Tombstone Deletion
- [ ] Open Addressing — Quadratic Probing (`(hash + i*i) % m`)
- [ ] Open Addressing — Double Hashing (`(h1(k) + i * h2(k)) % m`)
- [ ] Closed Addressing — Separate Chaining (Array of Linked Lists `Node* table[m]`)
- [ ] *Viva Staple:* Load Factor Calculation ($\alpha = n / m$) & Dynamic Rehashing
