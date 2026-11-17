#include <iostream>
#include <vector>
#include <stdexcept>
#include <utility>

using namespace std;

class MaxHeap
{
private:
    vector<int> heap;

    void siftUp(int index) // bubble element upward until max-heap property holds
    {
        while (index > 0)
        {
            int parent = (index - 1) / 2;
            if (heap[index] <= heap[parent])
            {
                break;
            }
            swap(heap[index], heap[parent]);
            index = parent;
        }
    }

    void siftDown(int index) // push element downward into larger child subtree
    {
        int n = static_cast<int>(heap.size());
        while (true)
        {
            int left = 2 * index + 1;
            int right = 2 * index + 2;
            int largest = index;

            if (left < n && heap[left] > heap[largest])
            {
                largest = left;
            }
            if (right < n && heap[right] > heap[largest])
            {
                largest = right;
            }

            if (largest == index)
            {
                break;
            }

            swap(heap[index], heap[largest]);
            index = largest;
        }
    }

public:
    bool empty() const
    {
        return heap.empty();
    }

    int size() const
    {
        return static_cast<int>(heap.size());
    }

    int peekMax() const
    {
        if (heap.empty())
        {
            throw runtime_error("Heap is empty.");
        }
        return heap[0];
    }

    void insert(int value) // append at end and restore heap order via siftUp
    {
        heap.push_back(value);
        siftUp(static_cast<int>(heap.size()) - 1);
    }

    int extractMax() // remove and return root maximum, restoring heap via siftDown
    {
        if (heap.empty())
        {
            throw runtime_error("Heap underflow: cannot extract from empty heap.");
        }

        int maxVal = heap[0];
        heap[0] = heap.back();
        heap.pop_back();

        if (!heap.empty())
        {
            siftDown(0);
        }

        return maxVal;
    }

    void buildHeap(const vector<int>& arr) // bottom-up O(n) Floyd's heap construction
    {
        heap = arr;
        for (int i = static_cast<int>(heap.size()) / 2 - 1; i >= 0; i--)
        {
            siftDown(i);
        }
    }

    void printHeap() const
    {
        for (int val : heap)
        {
            cout << val << " ";
        }
        cout << endl;
    }
};
