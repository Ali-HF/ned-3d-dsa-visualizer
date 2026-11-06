/**
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
