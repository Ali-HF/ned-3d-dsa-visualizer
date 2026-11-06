/**
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
    cout << "NULL\n";
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
