#include <iostream>
#include <vector>
#include <utility>

using namespace std;

void siftDown(vector<int>& arr, int heapSize, int index) // restore max-heap property within [0, heapSize)
{
    while (true)
    {
        int left = 2 * index + 1;
        int right = 2 * index + 2;
        int largest = index;

        if (left < heapSize && arr[left] > arr[largest])
        {
            largest = left;
        }
        if (right < heapSize && arr[right] > arr[largest])
        {
            largest = right;
        }

        if (largest == index)
        {
            break;
        }

        swap(arr[index], arr[largest]);
        index = largest;
    }
}

void heapSort(vector<int>& arr) // sort array in-place in ascending order
{
    int n = static_cast<int>(arr.size());

    for (int i = n / 2 - 1; i >= 0; i--) // phase 1: build max-heap bottom-up in O(n)
    {
        siftDown(arr, n, i);
    }

    for (int i = n - 1; i > 0; i--) // phase 2: swap max root to sorted suffix and shrink heap
    {
        swap(arr[0], arr[i]);
        siftDown(arr, i, 0);
    }
}

void printArray(const vector<int>& arr)
{
    for (int val : arr)
    {
        cout << val << " ";
    }
    cout << endl;
}

int main()
{
    vector<int> arr = {12, 11, 13, 5, 6, 7, -3, 13};

    cout << "Original array: ";
    printArray(arr);

    heapSort(arr);

    cout << "Sorted array:   ";
    printArray(arr);

    return 0;
}

