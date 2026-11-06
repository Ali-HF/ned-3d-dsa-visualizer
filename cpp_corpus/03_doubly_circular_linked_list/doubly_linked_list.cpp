/**
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
    cout << "NULL\n";
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
