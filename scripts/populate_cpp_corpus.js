import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseDir = path.join(__dirname, '..', 'cpp_corpus');

const files = {
  // ==========================================
  // WEEK 1: Arrays and Searching
  // ==========================================
  '01_arrays_and_searching/array_operations.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 1: Array Operations ADT (Insert, Delete, Update, Reverse, Rotate)
 */
#include <iostream>
using namespace std;

void printArray(int arr[], int n) {
    for (int i = 0; i < n; i++) cout << arr[i] << " ";
    cout << endl;
}

void insertAt(int arr[], int& n, int index, int value) {
    for (int i = n; i > index; i--) {
        arr[i] = arr[i - 1];
    }
    arr[index] = value;
    n++;
}

void deleteAt(int arr[], int& n, int index) {
    for (int i = index; i < n - 1; i++) {
        arr[i] = arr[i + 1];
    }
    n--;
}

void reverseArray(int arr[], int n) {
    int left = 0, right = n - 1;
    while (left < right) {
        swap(arr[left], arr[right]);
        left++;
        right--;
    }
}

void rotateLeft(int arr[], int n, int k) {
    k %= n;
    for (int r = 0; r < k; r++) {
        int first = arr[0];
        for (int i = 0; i < n - 1; i++) {
            arr[i] = arr[i + 1];
        }
        arr[n - 1] = first;
    }
}

int main() {
    int arr[20] = {10, 20, 30, 40, 50};
    int n = 5;

    cout << "Original array: ";
    printArray(arr, n);

    insertAt(arr, n, 2, 25);
    cout << "After insert 25 at index 2: ";
    printArray(arr, n);

    deleteAt(arr, n, 4);
    cout << "After delete at index 4: ";
    printArray(arr, n);

    reverseArray(arr, n);
    cout << "After reverse: ";
    printArray(arr, n);

    rotateLeft(arr, n, 2);
    cout << "After left rotate by 2: ";
    printArray(arr, n);

    return 0;
}
`,

  '01_arrays_and_searching/linear_search.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 1: Linear Search (Iterative & Recursive)
 */
#include <iostream>
using namespace std;

int linearSearchIterative(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}

int linearSearchRecursive(int arr[], int n, int target, int index = 0) {
    if (index >= n) return -1;
    if (arr[index] == target) return index;
    return linearSearchRecursive(arr, n, target, index + 1);
}

int main() {
    int arr[] = {42, 17, 68, 29, 84, 12};
    int n = sizeof(arr) / sizeof(arr[0]);
    int target = 29;

    int idx1 = linearSearchIterative(arr, n, target);
    cout << "Iterative: Found " << target << " at index " << idx1 << endl;

    int idx2 = linearSearchRecursive(arr, n, target);
    cout << "Recursive: Found " << target << " at index " << idx2 << endl;

    return 0;
}
`,

  '01_arrays_and_searching/binary_search.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 1: Binary Search (Iterative, Recursive & Bounds)
 */
#include <iostream>
using namespace std;

int binarySearchIterative(int arr[], int n, int key) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == key) return mid;
        if (arr[mid] < key) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int binarySearchRecursive(int arr[], int low, int high, int key) {
    if (low > high) return -1;
    int mid = low + (high - low) / 2;
    if (arr[mid] == key) return mid;
    if (arr[mid] < key) return binarySearchRecursive(arr, mid + 1, high, key);
    return binarySearchRecursive(arr, low, mid - 1, key);
}

int findFirstOccurrence(int arr[], int n, int key) {
    int low = 0, high = n - 1, ans = -1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == key) {
            ans = mid;
            high = mid - 1; // keep looking left
        } else if (arr[mid] < key) low = mid + 1;
        else high = mid - 1;
    }
    return ans;
}

int main() {
    int arr[] = {10, 20, 30, 30, 30, 40, 50};
    int n = sizeof(arr) / sizeof(arr[0]);

    cout << "Index of 40 (iterative): " << binarySearchIterative(arr, n, 40) << endl;
    cout << "Index of 40 (recursive): " << binarySearchRecursive(arr, 0, n - 1, 40) << endl;
    cout << "First occurrence of 30: " << findFirstOccurrence(arr, n, 30) << endl;

    return 0;
}
`,

  // ==========================================
  // WEEK 2: Singly Linked List
  // ==========================================
  '02_singly_linked_list/singly_linked_list.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 2: Singly Linked List (Insert, Delete, Search, Reverse, Display)
 */
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

void insertAtHead(Node*& head, int val) {
    Node* newNode = new Node(val);
    newNode->next = head;
    head = newNode;
}

void insertAtTail(Node*& head, int val) {
    Node* newNode = new Node(val);
    if (!head) {
        head = newNode;
        return;
    }
    Node* temp = head;
    while (temp->next) temp = temp->next;
    temp->next = newNode;
}

void deleteHead(Node*& head) {
    if (!head) return;
    Node* temp = head;
    head = head->next;
    delete temp;
}

void deleteByValue(Node*& head, int val) {
    if (!head) return;
    if (head->data == val) {
        deleteHead(head);
        return;
    }
    Node* curr = head;
    while (curr->next && curr->next->data != val) {
        curr = curr->next;
    }
    if (curr->next) {
        Node* toDelete = curr->next;
        curr->next = curr->next->next;
        delete toDelete;
    }
}

void reverseList(Node*& head) {
    Node *prev = nullptr, *curr = head, *next = nullptr;
    while (curr) {
        next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    head = prev;
}

void display(Node* head) {
    Node* temp = head;
    while (temp) {
        cout << temp->data << " -> ";
        temp = temp->next;
    }
    cout << "NULL\\n";
}

int main() {
    Node* head = nullptr;
    insertAtTail(head, 10);
    insertAtTail(head, 20);
    insertAtHead(head, 5);
    insertAtTail(head, 30);
    cout << "Linked List: ";
    display(head);

    deleteByValue(head, 20);
    cout << "After deleting 20: ";
    display(head);

    reverseList(head);
    cout << "After reversal: ";
    display(head);

    return 0;
}
`,

  '02_singly_linked_list/linked_list_sort.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 2: Merge Sort on Linked List
 */
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

Node* splitMiddle(Node* head) {
    Node* slow = head;
    Node* fast = head->next;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    Node* mid = slow->next;
    slow->next = nullptr;
    return mid;
}

Node* merge(Node* a, Node* b) {
    if (!a) return b;
    if (!b) return a;
    if (a->data <= b->data) {
        a->next = merge(a->next, b);
        return a;
    } else {
        b->next = merge(a, b->next);
        return b;
    }
}

Node* mergeSort(Node* head) {
    if (!head || !head->next) return head;
    Node* mid = splitMiddle(head);
    Node* left = mergeSort(head);
    Node* right = mergeSort(mid);
    return merge(left, right);
}

void display(Node* head) {
    while (head) {
        cout << head->data << " ";
        head = head->next;
    }
    cout << endl;
}

int main() {
    Node* head = new Node(40);
    head->next = new Node(10);
    head->next->next = new Node(30);
    head->next->next->next = new Node(20);

    cout << "Before Sort: ";
    display(head);

    head = mergeSort(head);

    cout << "After Merge Sort: ";
    display(head);

    return 0;
}
`,

  '02_singly_linked_list/viva_middle_and_merge.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 2 Viva Staples: Middle Node (Fast/Slow Pointer) & Merge Two Sorted Lists
 */
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

Node* findMiddle(Node* head) {
    Node* slow = head;
    Node* fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow; // Points to middle node
}

Node* mergeSortedLists(Node* l1, Node* l2) {
    Node dummy(0);
    Node* tail = &dummy;
    while (l1 && l2) {
        if (l1->data <= l2->data) {
            tail->next = l1;
            l1 = l1->next;
        } else {
            tail->next = l2;
            l2 = l2->next;
        }
        tail = tail->next;
    }
    tail->next = l1 ? l1 : l2;
    return dummy.next;
}

int main() {
    Node* a = new Node(10);
    a->next = new Node(20);
    a->next->next = new Node(30);
    a->next->next->next = new Node(40);
    a->next->next->next->next = new Node(50);

    Node* mid = findMiddle(a);
    cout << "Middle node value: " << mid->data << endl;

    Node* b = new Node(15);
    b->next = new Node(25);

    Node* merged = mergeSortedLists(a, b);
    cout << "Merged List: ";
    while (merged) {
        cout << merged->data << " ";
        merged = merged->next;
    }
    cout << endl;

    return 0;
}
`,

  // ==========================================
  // WEEK 3: Doubly & Circular Linked List
  // ==========================================
  '03_doubly_circular_linked_list/doubly_linked_list.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 3: Doubly Linked List (Insert, Delete, Bidirectional Traversal, Reverse)
 */
#include <iostream>
using namespace std;

struct DNode {
    int data;
    DNode* prev;
    DNode* next;
    DNode(int val) : data(val), prev(nullptr), next(nullptr) {}
};

void insertAtHead(DNode*& head, int val) {
    DNode* newNode = new DNode(val);
    newNode->next = head;
    if (head) head->prev = newNode;
    head = newNode;
}

void insertAtTail(DNode*& head, int val) {
    DNode* newNode = new DNode(val);
    if (!head) {
        head = newNode;
        return;
    }
    DNode* curr = head;
    while (curr->next) curr = curr->next;
    curr->next = newNode;
    newNode->prev = curr;
}

void deleteNode(DNode*& head, DNode* del) {
    if (!head || !del) return;
    if (head == del) head = del->next;
    if (del->next) del->next->prev = del->prev;
    if (del->prev) del->prev->next = del->next;
    delete del;
}

void reverseDLL(DNode*& head) {
    DNode* temp = nullptr;
    DNode* curr = head;
    while (curr) {
        temp = curr->prev;
        curr->prev = curr->next;
        curr->next = temp;
        curr = curr->prev;
    }
    if (temp) head = temp->prev;
}

void printForward(DNode* head) {
    cout << "Forward: ";
    while (head) {
        cout << head->data << " <-> ";
        head = head->next;
    }
    cout << "NULL\\n";
}

int main() {
    DNode* head = nullptr;
    insertAtTail(head, 10);
    insertAtTail(head, 20);
    insertAtHead(head, 5);
    insertAtTail(head, 30);
    printForward(head);

    reverseDLL(head);
    cout << "After Reverse: ";
    printForward(head);

    return 0;
}
`,

  '03_doubly_circular_linked_list/circular_singly_linked_list.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 3: Circular Singly Linked List (Insert, Delete, Traversal)
 */
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

void insertEnd(Node*& head, int val) {
    Node* newNode = new Node(val);
    if (!head) {
        head = newNode;
        head->next = head;
        return;
    }
    Node* temp = head;
    while (temp->next != head) temp = temp->next;
    temp->next = newNode;
    newNode->next = head;
}

void display(Node* head) {
    if (!head) return;
    Node* curr = head;
    do {
        cout << curr->data << " -> ";
        curr = curr->next;
    } while (curr != head);
    cout << "(back to " << head->data << ")\\n";
}

int main() {
    Node* head = nullptr;
    insertEnd(head, 10);
    insertEnd(head, 20);
    insertEnd(head, 30);
    display(head);
    return 0;
}
`,

  '03_doubly_circular_linked_list/floyd_cycle_detection.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 3 Viva Staple: Floyd's Cycle Detection (Tortoise and Hare)
 */
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

bool detectCycle(Node* head) {
    Node* slow = head;
    Node* fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true; // Cycle detected!
    }
    return false;
}

int main() {
    Node* head = new Node(1);
    head->next = new Node(2);
    head->next->next = new Node(3);
    head->next->next->next = new Node(4);
    
    // Create cycle: 4 -> 2
    head->next->next->next->next = head->next;

    cout << "Cycle detected: " << (detectCycle(head) ? "YES" : "NO") << endl;
    return 0;
}
`,

  // ==========================================
  // WEEK 4: Recursion and Stack
  // ==========================================
  '04_recursion_and_stack/stack_array.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 4: Array-based Stack ADT
 */
#include <iostream>
using namespace std;

#define MAX 100

class Stack {
    int topIndex;
    int arr[MAX];

public:
    Stack() : topIndex(-1) {}

    bool push(int x) {
        if (topIndex >= MAX - 1) return false;
        arr[++topIndex] = x;
        return true;
    }

    int pop() {
        if (topIndex < 0) return -1;
        return arr[topIndex--];
    }

    int peek() {
        if (topIndex < 0) return -1;
        return arr[topIndex];
    }

    bool isEmpty() { return topIndex < 0; }
};

int main() {
    Stack s;
    s.push(10);
    s.push(20);
    s.push(30);

    cout << "Top element: " << s.peek() << endl;
    cout << "Popped: " << s.pop() << endl;
    cout << "New Top: " << s.peek() << endl;

    return 0;
}
`,

  '04_recursion_and_stack/stack_linked_list.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 4: Linked-List-based Stack ADT
 */
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

class LinkedListStack {
    Node* topNode;

public:
    LinkedListStack() : topNode(nullptr) {}

    void push(int val) {
        Node* newNode = new Node(val);
        newNode->next = topNode;
        topNode = newNode;
    }

    int pop() {
        if (!topNode) return -1;
        Node* temp = topNode;
        int val = temp->data;
        topNode = topNode->next;
        delete temp;
        return val;
    }

    int peek() {
        return topNode ? topNode->data : -1;
    }

    bool isEmpty() { return topNode == nullptr; }
};

int main() {
    LinkedListStack s;
    s.push(100);
    s.push(200);
    cout << "Peek: " << s.peek() << endl;
    cout << "Pop: " << s.pop() << endl;
    return 0;
}
`,

  '04_recursion_and_stack/viva_stack_applications.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 4 Viva Staples: Balanced Parentheses & Infix to Postfix
 */
#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool isBalanced(string expr) {
    stack<char> s;
    for (char ch : expr) {
        if (ch == '(' || ch == '{' || ch == '[') {
            s.push(ch);
        } else if (ch == ')' || ch == '}' || ch == ']') {
            if (s.empty()) return false;
            char top = s.top();
            s.pop();
            if ((ch == ')' && top != '(') ||
                (ch == '}' && top != '{') ||
                (ch == ']' && top != '[')) return false;
        }
    }
    return s.empty();
}

int precedence(char op) {
    if (op == '+' || op == '-') return 1;
    if (op == '*' || op == '/') return 2;
    if (op == '^') return 3;
    return 0;
}

string infixToPostfix(string infix) {
    stack<char> s;
    string postfix = "";
    for (char c : infix) {
        if (isalnum(c)) postfix += c;
        else if (c == '(') s.push(c);
        else if (c == ')') {
            while (!s.empty() && s.top() != '(') {
                postfix += s.top();
                s.pop();
            }
            if (!s.empty()) s.pop();
        } else {
            while (!s.empty() && precedence(s.top()) >= precedence(c)) {
                postfix += s.top();
                s.pop();
            }
            s.push(c);
        }
    }
    while (!s.empty()) {
        postfix += s.top();
        s.pop();
    }
    return postfix;
}

int main() {
    string brackets = "{[()]}";
    cout << brackets << " is balanced: " << (isBalanced(brackets) ? "YES" : "NO") << endl;

    string infix = "A+B*(C-D)";
    cout << "Infix: " << infix << " -> Postfix: " << infixToPostfix(infix) << endl;

    return 0;
}
`,

  // ==========================================
  // WEEK 5: Queue, Circular Queue, Deque
  // ==========================================
  '05_queues_and_deque/queue_array_and_circular.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 5: Circular Queue ADT
 */
#include <iostream>
using namespace std;

class CircularQueue {
    int* arr;
    int front, rear, size;

public:
    CircularQueue(int s = 5) : size(s), front(-1), rear(-1) {
        arr = new int[size];
    }

    bool isFull() {
        return (front == 0 && rear == size - 1) || ((rear + 1) % size == front);
    }

    bool isEmpty() {
        return front == -1;
    }

    void enqueue(int val) {
        if (isFull()) return;
        if (front == -1) front = rear = 0;
        else rear = (rear + 1) % size;
        arr[rear] = val;
    }

    int dequeue() {
        if (isEmpty()) return -1;
        int val = arr[front];
        if (front == rear) front = rear = -1;
        else front = (front + 1) % size;
        return val;
    }

    int peek() {
        return isEmpty() ? -1 : arr[front];
    }
};

int main() {
    CircularQueue q(4);
    q.enqueue(10);
    q.enqueue(20);
    q.enqueue(30);
    cout << "Dequeue: " << q.dequeue() << endl;
    q.enqueue(40);
    cout << "Front: " << q.peek() << endl;
    return 0;
}
`,

  '05_queues_and_deque/deque.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 5: Double-Ended Queue (Deque)
 */
#include <iostream>
using namespace std;

class Deque {
    int arr[10];
    int front, rear, capacity;

public:
    Deque(int cap = 10) : front(-1), rear(0), capacity(cap) {}

    bool isFull() {
        return ((front == 0 && rear == capacity - 1) || front == rear + 1);
    }

    bool isEmpty() { return front == -1; }

    void insertFront(int key) {
        if (isFull()) return;
        if (front == -1) { front = 0; rear = 0; }
        else if (front == 0) front = capacity - 1;
        else front = front - 1;
        arr[front] = key;
    }

    void insertRear(int key) {
        if (isFull()) return;
        if (front == -1) { front = 0; rear = 0; }
        else if (rear == capacity - 1) rear = 0;
        else rear = rear + 1;
        arr[rear] = key;
    }

    int deleteFront() {
        if (isEmpty()) return -1;
        int val = arr[front];
        if (front == rear) { front = -1; rear = -1; }
        else if (front == capacity - 1) front = 0;
        else front = front + 1;
        return val;
    }

    int deleteRear() {
        if (isEmpty()) return -1;
        int val = arr[rear];
        if (front == rear) { front = -1; rear = -1; }
        else if (rear == 0) rear = capacity - 1;
        else rear = rear - 1;
        return val;
    }
};

int main() {
    Deque dq(5);
    dq.insertRear(10);
    dq.insertFront(5);
    dq.insertRear(20);
    cout << "Delete Front: " << dq.deleteFront() << endl;
    cout << "Delete Rear: " << dq.deleteRear() << endl;
    return 0;
}
`,

  // ==========================================
  // WEEK 6: Elementary Sorting Techniques
  // ==========================================
  '06_elementary_sorting/bubble_sort.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 6: Bubble Sort (Standard & Optimized with Early Exit)
 */
#include <iostream>
using namespace std;

void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break; // Early exit: array is sorted
    }
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);
    bubbleSort(arr, n);
    cout << "Sorted array: ";
    for (int i = 0; i < n; i++) cout << arr[i] << " ";
    cout << endl;
    return 0;
}
`,

  '06_elementary_sorting/insertion_sort.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 6: Insertion Sort
 */
#include <iostream>
using namespace std;

void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

int main() {
    int arr[] = {12, 11, 13, 5, 6};
    int n = sizeof(arr) / sizeof(arr[0]);
    insertionSort(arr, n);
    for (int i = 0; i < n; i++) cout << arr[i] << " ";
    cout << endl;
    return 0;
}
`,

  '06_elementary_sorting/selection_sort.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 6: Selection Sort
 */
#include <iostream>
using namespace std;

void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        if (minIdx != i) swap(arr[i], arr[minIdx]);
    }
}

int main() {
    int arr[] = {64, 25, 12, 22, 11};
    int n = sizeof(arr) / sizeof(arr[0]);
    selectionSort(arr, n);
    for (int i = 0; i < n; i++) cout << arr[i] << " ";
    cout << endl;
    return 0;
}
`,

  // ==========================================
  // WEEK 7: Advanced Sorting Techniques
  // ==========================================
  '07_advanced_sorting/merge_sort.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 7: Merge Sort (Top-Down Recursive)
 */
#include <iostream>
using namespace std;

void merge(int arr[], int l, int mid, int r) {
    int n1 = mid - l + 1;
    int n2 = r - mid;
    int L[50], R[50];

    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) arr[k++] = L[i++];
        else arr[k++] = R[j++];
    }
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}

void mergeSort(int arr[], int l, int r) {
    if (l >= r) return;
    int mid = l + (r - l) / 2;
    mergeSort(arr, l, mid);
    mergeSort(arr, mid + 1, r);
    merge(arr, l, mid, r);
}

int main() {
    int arr[] = {38, 27, 43, 3, 9, 82, 10};
    int n = sizeof(arr) / sizeof(arr[0]);
    mergeSort(arr, 0, n - 1);
    for (int i = 0; i < n; i++) cout << arr[i] << " ";
    cout << endl;
    return 0;
}
`,

  '07_advanced_sorting/quick_sort.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 7: Quick Sort (Lomuto Partition)
 */
#include <iostream>
using namespace std;

int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {
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
    int arr[] = {10, 80, 30, 90, 40, 50, 70};
    int n = sizeof(arr) / sizeof(arr[0]);
    quickSort(arr, 0, n - 1);
    for (int i = 0; i < n; i++) cout << arr[i] << " ";
    cout << endl;
    return 0;
}
`,

  // ==========================================
  // WEEK 9: Binary Tree
  // ==========================================
  '09_binary_tree/binary_tree_traversals.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 9: Binary Tree Creation & Traversals (Pre, In, Post, Level-Order)
 */
#include <iostream>
#include <queue>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

void preorder(TreeNode* root) {
    if (!root) return;
    cout << root->val << " ";
    preorder(root->left);
    preorder(root->right);
}

void inorder(TreeNode* root) {
    if (!root) return;
    inorder(root->left);
    cout << root->val << " ";
    inorder(root->right);
}

void postorder(TreeNode* root) {
    if (!root) return;
    postorder(root->left);
    postorder(root->right);
    cout << root->val << " ";
}

void levelOrder(TreeNode* root) {
    if (!root) return;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* curr = q.front();
        q.pop();
        cout << curr->val << " ";
        if (curr->left) q.push(curr->left);
        if (curr->right) q.push(curr->right);
    }
}

int main() {
    TreeNode* root = new TreeNode(1);
    root->left = new TreeNode(2);
    root->right = new TreeNode(3);
    root->left->left = new TreeNode(4);
    root->left->right = new TreeNode(5);

    cout << "Preorder: "; preorder(root); cout << endl;
    cout << "Inorder: "; inorder(root); cout << endl;
    cout << "Postorder: "; postorder(root); cout << endl;
    cout << "Level-order: "; levelOrder(root); cout << endl;

    return 0;
}
`,

  '09_binary_tree/viva_tree_utilities.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 9 Viva Staples: Tree Height, Node Count, Mirror Binary Tree
 */
#include <iostream>
#include <algorithm>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

int getHeight(TreeNode* root) {
    if (!root) return 0;
    return 1 + max(getHeight(root->left), getHeight(root->right));
}

int countNodes(TreeNode* root) {
    if (!root) return 0;
    return 1 + countNodes(root->left) + countNodes(root->right);
}

int countLeaves(TreeNode* root) {
    if (!root) return 0;
    if (!root->left && !root->right) return 1;
    return countLeaves(root->left) + countLeaves(root->right);
}

void mirrorTree(TreeNode* root) {
    if (!root) return;
    swap(root->left, root->right);
    mirrorTree(root->left);
    mirrorTree(root->right);
}

int main() {
    TreeNode* root = new TreeNode(10);
    root->left = new TreeNode(5);
    root->right = new TreeNode(20);
    root->left->left = new TreeNode(2);

    cout << "Height: " << getHeight(root) << endl;
    cout << "Total Nodes: " << countNodes(root) << endl;
    cout << "Leaf Nodes: " << countLeaves(root) << endl;

    return 0;
}
`,

  // ==========================================
  // WEEK 10: Binary Heap, Heap Sort, Priority Queue
  // ==========================================
  '10_heap_and_priority_queue/max_heap.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 10: Max Heap (Insert, ExtractMax, BuildHeap)
 */
#include <iostream>
using namespace std;

class MaxHeap {
    int heap[100];
    int size;

    void siftUp(int i) {
        while (i > 0 && heap[(i - 1) / 2] < heap[i]) {
            swap(heap[i], heap[(i - 1) / 2]);
            i = (i - 1) / 2;
        }
    }

    void siftDown(int i) {
        int largest = i;
        int l = 2 * i + 1;
        int r = 2 * i + 2;

        if (l < size && heap[l] > heap[largest]) largest = l;
        if (r < size && heap[r] > heap[largest]) largest = r;

        if (largest != i) {
            swap(heap[i], heap[largest]);
            siftDown(largest);
        }
    }

public:
    MaxHeap() : size(0) {}

    void insert(int val) {
        heap[size] = val;
        siftUp(size);
        size++;
    }

    int extractMax() {
        if (size <= 0) return -1;
        int root = heap[0];
        heap[0] = heap[size - 1];
        size--;
        siftDown(0);
        return root;
    }

    void print() {
        for (int i = 0; i < size; i++) cout << heap[i] << " ";
        cout << endl;
    }
};

int main() {
    MaxHeap h;
    h.insert(40);
    h.insert(20);
    h.insert(60);
    h.insert(10);
    h.insert(50);
    cout << "Max-Heap: ";
    h.print();

    cout << "Extracted Max: " << h.extractMax() << endl;
    cout << "After Extract: ";
    h.print();

    return 0;
}
`,

  '10_heap_and_priority_queue/heap_sort.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 10: Heap Sort (In-Place Max-Heapify)
 */
#include <iostream>
using namespace std;

void heapify(int arr[], int n, int i) {
    int largest = i;
    int l = 2 * i + 1;
    int r = 2 * i + 2;

    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;

    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}

void heapSort(int arr[], int n) {
    // 1. Build heap (rearrange array)
    for (int i = n / 2 - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }

    // 2. Extract elements one by one from heap
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}

int main() {
    int arr[] = {12, 11, 13, 5, 6, 7};
    int n = sizeof(arr) / sizeof(arr[0]);
    heapSort(arr, n);
    cout << "Heap Sorted: ";
    for (int i = 0; i < n; i++) cout << arr[i] << " ";
    cout << endl;
    return 0;
}
`,

  // ==========================================
  // WEEK 11: Binary Search Tree (BST)
  // ==========================================
  '11_binary_search_tree/binary_search_tree.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 11: Binary Search Tree (Insert, Search, 3 Deletion Cases, Inorder)
 */
#include <iostream>
using namespace std;

struct Node {
    int key;
    Node *left, *right;
    Node(int val) : key(val), left(nullptr), right(nullptr) {}
};

Node* insert(Node* root, int key) {
    if (!root) return new Node(key);
    if (key < root->key) root->left = insert(root->left, key);
    else if (key > root->key) root->right = insert(root->right, key);
    return root;
}

bool search(Node* root, int key) {
    if (!root) return false;
    if (root->key == key) return true;
    if (key < root->key) return search(root->left, key);
    return search(root->right, key);
}

Node* minValueNode(Node* node) {
    Node* current = node;
    while (current && current->left) current = current->left;
    return current;
}

Node* deleteNode(Node* root, int key) {
    if (!root) return root;
    if (key < root->key) root->left = deleteNode(root->left, key);
    else if (key > root->key) root->right = deleteNode(root->right, key);
    else {
        // Case 1 & 2: Leaf or one child
        if (!root->left) {
            Node* temp = root->right;
            delete root;
            return temp;
        } else if (!root->right) {
            Node* temp = root->left;
            delete root;
            return temp;
        }
        // Case 3: Two children
        Node* temp = minValueNode(root->right); // Inorder successor
        root->key = temp->key;
        root->right = deleteNode(root->right, temp->key);
    }
    return root;
}

void inorder(Node* root) {
    if (!root) return;
    inorder(root->left);
    cout << root->key << " ";
    inorder(root->right);
}

int main() {
    Node* root = nullptr;
    root = insert(root, 50);
    insert(root, 30);
    insert(root, 20);
    insert(root, 40);
    insert(root, 70);
    insert(root, 60);
    insert(root, 80);

    cout << "Inorder (Sorted): ";
    inorder(root);
    cout << endl;

    root = deleteNode(root, 50);
    cout << "After deleting 50: ";
    inorder(root);
    cout << endl;

    return 0;
}
`,

  '11_binary_search_tree/viva_bst_validation_and_lca.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 11 Viva Staples: Is Valid BST & Lowest Common Ancestor (LCA)
 */
#include <iostream>
#include <climits>
using namespace std;

struct Node {
    int key;
    Node *left, *right;
    Node(int val) : key(val), left(nullptr), right(nullptr) {}
};

bool isValidBST(Node* root, long long minVal = LLONG_MIN, long long maxVal = LLONG_MAX) {
    if (!root) return true;
    if (root->key <= minVal || root->key >= maxVal) return false;
    return isValidBST(root->left, minVal, root->key) &&
           isValidBST(root->right, root->key, maxVal);
}

Node* lowestCommonAncestor(Node* root, int p, int q) {
    if (!root) return nullptr;
    if (p < root->key && q < root->key) return lowestCommonAncestor(root->left, p, q);
    if (p > root->key && q > root->key) return lowestCommonAncestor(root->right, p, q);
    return root;
}

int main() {
    Node* root = new Node(20);
    root->left = new Node(10);
    root->right = new Node(30);
    root->left->left = new Node(5);
    root->left->right = new Node(15);

    cout << "Is Valid BST: " << (isValidBST(root) ? "YES" : "NO") << endl;

    Node* lca = lowestCommonAncestor(root, 5, 15);
    cout << "LCA of 5 and 15 is: " << lca->key << endl;

    return 0;
}
`,

  // ==========================================
  // WEEK 12: AVL Tree (Self-Balancing BST)
  // ==========================================
  '12_avl_tree/avl_tree.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 12: AVL Tree (LL, RR, LR, RL Rotations & Insert)
 */
#include <iostream>
#include <algorithm>
using namespace std;

struct AVLNode {
    int key, height;
    AVLNode *left, *right;
    AVLNode(int k) : key(k), height(1), left(nullptr), right(nullptr) {}
};

int getHeight(AVLNode* n) { return n ? n->height : 0; }
int getBalance(AVLNode* n) { return n ? getHeight(n->left) - getHeight(n->right) : 0; }

AVLNode* rightRotate(AVLNode* y) {
    AVLNode* x = y->left;
    AVLNode* T2 = x->right;

    x->right = y;
    y->left = T2;

    y->height = max(getHeight(y->left), getHeight(y->right)) + 1;
    x->height = max(getHeight(x->left), getHeight(x->right)) + 1;
    return x;
}

AVLNode* leftRotate(AVLNode* x) {
    AVLNode* y = x->right;
    AVLNode* T2 = y->left;

    y->left = x;
    x->right = T2;

    x->height = max(getHeight(x->left), getHeight(x->right)) + 1;
    y->height = max(getHeight(y->left), getHeight(y->right)) + 1;
    return y;
}

AVLNode* insert(AVLNode* node, int key) {
    if (!node) return new AVLNode(key);
    if (key < node->key) node->left = insert(node->left, key);
    else if (key > node->key) node->right = insert(node->right, key);
    else return node; // duplicates not allowed

    node->height = 1 + max(getHeight(node->left), getHeight(node->right));
    int balance = getBalance(node);

    // LL Case
    if (balance > 1 && key < node->left->key) return rightRotate(node);
    // RR Case
    if (balance < -1 && key > node->right->key) return leftRotate(node);
    // LR Case
    if (balance > 1 && key > node->left->key) {
        node->left = leftRotate(node->left);
        return rightRotate(node);
    }
    // RL Case
    if (balance < -1 && key < node->right->key) {
        node->right = rightRotate(node->right);
        return leftRotate(node);
    }

    return node;
}

void preorder(AVLNode* root) {
    if (!root) return;
    cout << root->key << " ";
    preorder(root->left);
    preorder(root->right);
}

int main() {
    AVLNode* root = nullptr;
    root = insert(root, 10);
    root = insert(root, 20);
    root = insert(root, 30);
    root = insert(root, 40);
    root = insert(root, 50);
    root = insert(root, 25);

    cout << "Preorder traversal of balanced AVL tree:\\n";
    preorder(root);
    cout << endl;

    return 0;
}
`,

  // ==========================================
  // WEEK 13: Graph Representation & Traversal
  // ==========================================
  '13_graph_traversal/graph_representations.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 13: Graph Representations (Adjacency Matrix & Adjacency List)
 */
#include <iostream>
#include <vector>
using namespace std;

class GraphMatrix {
    int V;
    vector<vector<int>> matrix;

public:
    GraphMatrix(int vertices) : V(vertices), matrix(vertices, vector<int>(vertices, 0)) {}

    void addEdge(int u, int v) {
        matrix[u][v] = 1;
        matrix[v][u] = 1; // Undirected
    }

    void display() {
        cout << "Adjacency Matrix:\\n";
        for (int i = 0; i < V; i++) {
            for (int j = 0; j < V; j++) cout << matrix[i][j] << " ";
            cout << endl;
        }
    }
};

class GraphList {
    int V;
    vector<vector<int>> adj;

public:
    GraphList(int vertices) : V(vertices), adj(vertices) {}

    void addEdge(int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    void display() {
        cout << "Adjacency List:\\n";
        for (int i = 0; i < V; i++) {
            cout << i << " -> ";
            for (int v : adj[i]) cout << v << " ";
            cout << endl;
        }
    }
};

int main() {
    GraphMatrix gm(4);
    gm.addEdge(0, 1);
    gm.addEdge(1, 2);
    gm.addEdge(2, 3);
    gm.display();

    GraphList gl(4);
    gl.addEdge(0, 1);
    gl.addEdge(1, 2);
    gl.addEdge(2, 3);
    gl.display();

    return 0;
}
`,

  '13_graph_traversal/bfs_dfs_traversal.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 13: BFS and DFS Graph Traversals
 */
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

void BFS(int start, const vector<vector<int>>& adj, int V) {
    vector<bool> visited(V, false);
    queue<int> q;

    visited[start] = true;
    q.push(start);

    cout << "BFS starting from " << start << ": ";
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        cout << u << " ";

        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
    cout << endl;
}

void DFSUtil(int u, const vector<vector<int>>& adj, vector<bool>& visited) {
    visited[u] = true;
    cout << u << " ";
    for (int v : adj[u]) {
        if (!visited[v]) {
            DFSUtil(v, adj, visited);
        }
    }
}

void DFS(int start, const vector<vector<int>>& adj, int V) {
    vector<bool> visited(V, false);
    cout << "DFS starting from " << start << ": ";
    DFSUtil(start, adj, visited);
    cout << endl;
}

int main() {
    int V = 5;
    vector<vector<int>> adj(V);
    adj[0] = {1, 2};
    adj[1] = {0, 3, 4};
    adj[2] = {0};
    adj[3] = {1};
    adj[4] = {1};

    BFS(0, adj, V);
    DFS(0, adj, V);

    return 0;
}
`,

  // ==========================================
  // WEEK 14: Minimum Spanning Tree & Topological Sort
  // ==========================================
  '14_graph_mst_toposort/kruskal_mst.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 14: Kruskal's MST (with Disjoint Set Union - DSU)
 */
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

struct Edge {
    int u, v, weight;
    bool operator<(const Edge& other) const {
        return weight < other.weight;
    }
};

class DSU {
    vector<int> parent, rank;

public:
    DSU(int n) : parent(n), rank(n, 0) {
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    int find(int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent[i]); // Path compression
    }

    void unite(int i, int j) {
        int root_i = find(i);
        int root_j = find(j);
        if (root_i != root_j) {
            if (rank[root_i] < rank[root_j]) swap(root_i, root_j);
            parent[root_j] = root_i;
            if (rank[root_i] == rank[root_j]) rank[root_i]++;
        }
    }
};

void kruskalMST(int V, vector<Edge>& edges) {
    sort(edges.begin(), edges.end());
    DSU dsu(V);
    int mstCost = 0;

    cout << "Edges in Kruskal's MST:\\n";
    for (const auto& edge : edges) {
        if (dsu.find(edge.u) != dsu.find(edge.v)) {
            dsu.unite(edge.u, edge.v);
            mstCost += edge.weight;
            cout << edge.u << " - " << edge.v << " : " << edge.weight << endl;
        }
    }
    cout << "Total MST Cost: " << mstCost << endl;
}

int main() {
    int V = 4;
    vector<Edge> edges = {
        {0, 1, 10},
        {0, 2, 6},
        {0, 3, 5},
        {1, 3, 15},
        {2, 3, 4}
    };

    kruskalMST(V, edges);
    return 0;
}
`,

  '14_graph_mst_toposort/topological_sort.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 14: Topological Sorting (Kahn's BFS In-Degree Algorithm)
 */
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

void topologicalSortKahn(int V, const vector<vector<int>>& adj) {
    vector<int> inDegree(V, 0);
    for (int u = 0; u < V; u++) {
        for (int v : adj[u]) inDegree[v]++;
    }

    queue<int> q;
    for (int i = 0; i < V; i++) {
        if (inDegree[i] == 0) q.push(i);
    }

    int count = 0;
    cout << "Topological Order: ";
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        cout << u << " ";
        count++;

        for (int v : adj[u]) {
            if (--inDegree[v] == 0) q.push(v);
        }
    }
    cout << endl;

    if (count != V) {
        cout << "Cycle detected! Graph is not a DAG.\\n";
    }
}

int main() {
    int V = 6;
    vector<vector<int>> adj(V);
    adj[5] = {2, 0};
    adj[4] = {0, 1};
    adj[2] = {3};
    adj[3] = {1};

    topologicalSortKahn(V, adj);
    return 0;
}
`,

  '14_graph_mst_toposort/dijkstra.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 14: Dijkstra's Shortest Path Algorithm
 */
#include <iostream>
#include <vector>
#include <climits>
using namespace std;

#define V 5

int minDistance(int dist[], bool sptSet[]) {
    int minVal = INT_MAX, min_index = -1;
    for (int v = 0; v < V; v++) {
        if (!sptSet[v] && dist[v] <= minVal) {
            minVal = dist[v];
            min_index = v;
        }
    }
    return min_index;
}

void dijkstra(int graph[V][V], int src) {
    int dist[V];
    bool sptSet[V];

    for (int i = 0; i < V; i++) {
        dist[i] = INT_MAX;
        sptSet[i] = false;
    }
    dist[src] = 0;

    for (int count = 0; count < V - 1; count++) {
        int u = minDistance(dist, sptSet);
        if (u == -1) break;
        sptSet[u] = true;

        for (int v = 0; v < V; v++) {
            if (!sptSet[v] && graph[u][v] && dist[u] != INT_MAX
                && dist[u] + graph[u][v] < dist[v]) {
                dist[v] = dist[u] + graph[u][v];
            }
        }
    }

    cout << "Vertex \\t Distance from Source " << src << "\\n";
    for (int i = 0; i < V; i++) cout << i << " \\t\\t " << dist[i] << "\\n";
}

int main() {
    int graph[V][V] = {
        {0, 4, 0, 0, 8},
        {4, 0, 8, 0, 11},
        {0, 8, 0, 7, 0},
        {0, 0, 7, 0, 9},
        {8, 11, 0, 9, 0}
    };

    dijkstra(graph, 0);
    return 0;
}
`,

  // ==========================================
  // WEEK 15: Hashing and Collision Resolution
  // ==========================================
  '15_hashing/linear_probing.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 15: Hash Table with Open Addressing (Linear Probing & Tombstones)
 */
#include <iostream>
using namespace std;

#define TABLE_SIZE 7
#define EMPTY -1
#define DELETED -2

class HashTableLinearProbing {
    int table[TABLE_SIZE];

    int hashFunc(int key) {
        return key % TABLE_SIZE;
    }

public:
    HashTableLinearProbing() {
        for (int i = 0; i < TABLE_SIZE; i++) table[i] = EMPTY;
    }

    void insert(int key) {
        int index = hashFunc(key);
        int i = 0;
        while (table[(index + i) % TABLE_SIZE] != EMPTY &&
               table[(index + i) % TABLE_SIZE] != DELETED &&
               i < TABLE_SIZE) {
            i++;
        }
        if (i == TABLE_SIZE) {
            cout << "Hash Table Full!\\n";
            return;
        }
        table[(index + i) % TABLE_SIZE] = key;
    }

    bool search(int key) {
        int index = hashFunc(key);
        int i = 0;
        while (table[(index + i) % TABLE_SIZE] != EMPTY && i < TABLE_SIZE) {
            if (table[(index + i) % TABLE_SIZE] == key) return true;
            i++;
        }
        return false;
    }

    void remove(int key) {
        int index = hashFunc(key);
        int i = 0;
        while (table[(index + i) % TABLE_SIZE] != EMPTY && i < TABLE_SIZE) {
            if (table[(index + i) % TABLE_SIZE] == key) {
                table[(index + i) % TABLE_SIZE] = DELETED; // Tombstone
                return;
            }
            i++;
        }
    }

    void display() {
        for (int i = 0; i < TABLE_SIZE; i++) {
            cout << "[" << i << "] : ";
            if (table[i] == EMPTY) cout << "EMPTY";
            else if (table[i] == DELETED) cout << "DELETED";
            else cout << table[i];
            cout << endl;
        }
    }
};

int main() {
    HashTableLinearProbing ht;
    ht.insert(10);
    ht.insert(17);
    ht.insert(24); // Collision at index 3 -> probes to 4, 5
    ht.display();

    cout << "Search 17: " << (ht.search(17) ? "FOUND" : "NOT FOUND") << endl;
    ht.remove(17);
    cout << "After removing 17:\\n";
    ht.display();

    return 0;
}
`,

  '15_hashing/separate_chaining.cpp': `/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 15: Hash Table with Closed Addressing (Separate Chaining)
 */
#include <iostream>
using namespace std;

#define BUCKETS 5

struct HashNode {
    int key;
    HashNode* next;
    HashNode(int k) : key(k), next(nullptr) {}
};

class HashTableChaining {
    HashNode* table[BUCKETS];

    int hashFunc(int key) {
        return key % BUCKETS;
    }

public:
    HashTableChaining() {
        for (int i = 0; i < BUCKETS; i++) table[i] = nullptr;
    }

    void insert(int key) {
        int idx = hashFunc(key);
        HashNode* newNode = new HashNode(key);
        newNode->next = table[idx];
        table[idx] = newNode;
    }

    bool search(int key) {
        int idx = hashFunc(key);
        HashNode* curr = table[idx];
        while (curr) {
            if (curr->key == key) return true;
            curr = curr->next;
        }
        return false;
    }

    void display() {
        for (int i = 0; i < BUCKETS; i++) {
            cout << "Bucket " << i << ": ";
            HashNode* curr = table[i];
            while (curr) {
                cout << curr->key << " -> ";
                curr = curr->next;
            }
            cout << "NULL\\n";
        }
    }
};

int main() {
    HashTableChaining ht;
    ht.insert(10);
    ht.insert(15);
    ht.insert(20);
    ht.insert(7);
    ht.insert(12);

    ht.display();
    cout << "Search 15: " << (ht.search(15) ? "FOUND" : "NOT FOUND") << endl;
    return 0;
}
`,

  'README.md': `# NED University CT-159 C++ Code Corpus

This directory contains clean, reference C++ programs for all topics across the 15-week syllabus of **CT-159: Data Structure Algorithms & Applications** (NED University CS&IT).

## Replacing with Your Teammates' Code
Whenever teammates have their own course or lab solutions, simply overwrite the corresponding file or drop in an additional file:

- **01_arrays_and_searching/** &mdash; Array ADT, Linear Search, Binary Search
- **02_singly_linked_list/** &mdash; Singly linked list, sorting, middle node, merge
- **03_doubly_circular_linked_list/** &mdash; Doubly, circular lists, Floyd's cycle detection
- **04_recursion_and_stack/** &mdash; Stacks (array & list), balanced parentheses, infix-to-postfix
- **05_queues_and_deque/** &mdash; Queue, circular queue, double-ended queue (deque)
- **06_elementary_sorting/** &mdash; Bubble, insertion, selection sort
- **07_advanced_sorting/** &mdash; Merge sort, quick sort
- **09_binary_tree/** &mdash; Binary tree traversals, height, leaf count, invert
- **10_heap_and_priority_queue/** &mdash; Max/min heap, heap sort, priority queue
- **11_binary_search_tree/** &mdash; BST insert, 3-case delete, valid BST, LCA
- **12_avl_tree/** &mdash; AVL rotations (LL, RR, LR, RL), balanced insertions
- **13_graph_traversal/** &mdash; Graph representations, BFS, DFS, cycle detection
- **14_graph_mst_toposort/** &mdash; Kruskal's MST (with DSU), Prim's, Topological Sort, Dijkstra
- **15_hashing/** &mdash; Linear probing with tombstones, separate chaining

Every file is self-contained, standard C++, with an illustrative \`main()\` function.
`
};

let count = 0;
for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(baseDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  count++;
}

console.log('Successfully created ' + count + ' C++ corpus files in ' + baseDir);
