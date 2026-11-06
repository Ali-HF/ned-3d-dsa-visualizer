/**
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
    cout << "(back to " << head->data << ")\n";
}

int main() {
    Node* head = nullptr;
    insertEnd(head, 10);
    insertEnd(head, 20);
    insertEnd(head, 30);
    display(head);
    return 0;
}
