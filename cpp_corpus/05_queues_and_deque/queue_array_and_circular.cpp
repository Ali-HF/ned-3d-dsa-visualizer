#include <iostream>
using namespace std;

#define SIZE 5

class LinearQueue {
    int arr[SIZE];
    int front, rear;

public:
    LinearQueue() {
        front = 0;
        rear = -1;
    }

    bool isEmpty() {
        return front > rear;
    }

    bool isFull() {
        return rear == SIZE - 1;
    }

    void enqueue(int value) {
        if (isFull()) {
            cout << "Queue is full" << endl;
            return;
        }
        rear++;
        arr[rear] = value;
    }

    void dequeue() {
        if (isEmpty()) {
            cout << "Queue is empty" << endl;
            return;
        }
        cout << "Removed: " << arr[front] << endl;
        front++;
    }

    void display() {
        if (isEmpty()) {
            cout << "Queue is empty" << endl;
            return;
        }
        for (int i = front; i <= rear; i++) {
            cout << arr[i] << " ";
        }
        cout << endl;
    }
};

class CircularQueue {
    int arr[SIZE];
    int front, rear, count;

public:
    CircularQueue() {
        front = 0;
        rear = -1;
        count = 0;
    }

    bool isEmpty() {
        return count == 0;
    }

    bool isFull() {
        return count == SIZE;
    }

    void enqueue(int value) {
        if (isFull()) {
            cout << "Queue is full" << endl;
            return;
        }
        rear = (rear + 1) % SIZE;
        arr[rear] = value;
        count++;
    }

    void dequeue() {
        if (isEmpty()) {
            cout << "Queue is empty" << endl;
            return;
        }
        cout << "Removed: " << arr[front] << endl;
        front = (front + 1) % SIZE;
        count--;
    }

    void display() {
        if (isEmpty()) {
            cout << "Queue is empty" << endl;
            return;
        }
        int i = front;
        for (int n = 0; n < count; n++) {
            cout << arr[i] << " ";
            i = (i + 1) % SIZE;
        }
        cout << endl;
    }
};

int main() {
    cout << "Linear Queue" << endl;
    LinearQueue lq;
    lq.enqueue(10);
    lq.enqueue(20);
    lq.enqueue(30);
    lq.display();
    lq.dequeue();
    lq.display();

    cout << endl << "Circular Queue" << endl;
    CircularQueue cq;
    cq.enqueue(1);
    cq.enqueue(2);
    cq.enqueue(3);
    cq.enqueue(4);
    cq.enqueue(5);
    cq.enqueue(6);
    cq.dequeue();
    cq.dequeue();
    cq.enqueue(7);
    cq.enqueue(8);
    cq.display();

    return 0;
}
