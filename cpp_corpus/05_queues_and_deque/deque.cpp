#include <iostream>
using namespace std;

#define SIZE 5

class Deque {
    int arr[SIZE];
    int front, rear, count;

public:
    Deque() {
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

    void insertRear(int value) {
        if (isFull()) {
            cout << "Deque is full" << endl;
            return;
        }
        rear = (rear + 1) % SIZE;
        arr[rear] = value;
        count++;
    }

    void insertFront(int value) {
        if (isFull()) {
            cout << "Deque is full" << endl;
            return;
        }
        front = (front - 1 + SIZE) % SIZE;
        arr[front] = value;
        count++;
        if (count == 1) {
            rear = front;
        }
    }

    void deleteFront() {
        if (isEmpty()) {
            cout << "Deque is empty" << endl;
            return;
        }
        cout << "Removed from front: " << arr[front] << endl;
        front = (front + 1) % SIZE;
        count--;
    }

    void deleteRear() {
        if (isEmpty()) {
            cout << "Deque is empty" << endl;
            return;
        }
        cout << "Removed from rear: " << arr[rear] << endl;
        rear = (rear - 1 + SIZE) % SIZE;
        count--;
    }

    void display() {
        if (isEmpty()) {
            cout << "Deque is empty" << endl;
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
    Deque d;
    d.insertRear(10);
    d.insertRear(20);
    d.insertFront(5);
    d.insertFront(1);
    d.display();
    d.deleteFront();
    d.deleteRear();
    d.display();
    return 0;
}
