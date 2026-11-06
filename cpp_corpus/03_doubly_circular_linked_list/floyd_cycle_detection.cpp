/**
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
