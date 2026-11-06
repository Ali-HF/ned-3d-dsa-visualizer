/**
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
