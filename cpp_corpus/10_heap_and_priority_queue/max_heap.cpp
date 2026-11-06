/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 10: Max Heap (Insert, ExtractMax, BuildHeap)
 */
#include <iostream>
using namespace std;

class MaxHeap {
    int heap[100];
    int size;

    void siftUp(int i) {
        while (i > 0 && heap[(i - 1) / 2] < heap[i]) {
            swap(heap[i], heap[(i - 1) / 2]);
            i = (i - 1) / 2;
        }
    }

    void siftDown(int i) {
        int largest = i;
        int l = 2 * i + 1;
        int r = 2 * i + 2;

        if (l < size && heap[l] > heap[largest]) largest = l;
        if (r < size && heap[r] > heap[largest]) largest = r;

        if (largest != i) {
            swap(heap[i], heap[largest]);
            siftDown(largest);
        }
    }

public:
    MaxHeap() : size(0) {}

    void insert(int val) {
        heap[size] = val;
        siftUp(size);
        size++;
    }

    int extractMax() {
        if (size <= 0) return -1;
        int root = heap[0];
        heap[0] = heap[size - 1];
        size--;
        siftDown(0);
        return root;
    }

    void print() {
        for (int i = 0; i < size; i++) cout << heap[i] << " ";
        cout << endl;
    }
};

int main() {
    MaxHeap h;
    h.insert(40);
    h.insert(20);
    h.insert(60);
    h.insert(10);
    h.insert(50);
    cout << "Max-Heap: ";
    h.print();

    cout << "Extracted Max: " << h.extractMax() << endl;
    cout << "After Extract: ";
    h.print();

    return 0;
}
