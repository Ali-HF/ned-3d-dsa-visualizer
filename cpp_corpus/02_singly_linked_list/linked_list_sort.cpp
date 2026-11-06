/**
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
