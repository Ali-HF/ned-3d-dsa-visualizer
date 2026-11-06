/**
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
