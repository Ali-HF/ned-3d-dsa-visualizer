/**
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
