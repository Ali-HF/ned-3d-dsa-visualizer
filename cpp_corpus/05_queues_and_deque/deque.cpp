/**
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
