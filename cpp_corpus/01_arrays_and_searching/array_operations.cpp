/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 1: Array Operations ADT (Insert, Delete, Update, Reverse, Rotate)
 */
#include <iostream>
using namespace std;

void printArray(int arr[], int n) {
    for (int i = 0; i < n; i++) cout << arr[i] << " ";
    cout << endl;
}

void insertAt(int arr[], int& n, int index, int value) {
    for (int i = n; i > index; i--) {
        arr[i] = arr[i - 1];
    }
    arr[index] = value;
    n++;
}

void deleteAt(int arr[], int& n, int index) {
    for (int i = index; i < n - 1; i++) {
        arr[i] = arr[i + 1];
    }
    n--;
}

void reverseArray(int arr[], int n) {
    int left = 0, right = n - 1;
    while (left < right) {
        swap(arr[left], arr[right]);
        left++;
        right--;
    }
}

void rotateLeft(int arr[], int n, int k) {
    k %= n;
    for (int r = 0; r < k; r++) {
        int first = arr[0];
        for (int i = 0; i < n - 1; i++) {
            arr[i] = arr[i + 1];
        }
        arr[n - 1] = first;
    }
}

int main() {
    int arr[20] = {10, 20, 30, 40, 50};
    int n = 5;

    cout << "Original array: ";
    printArray(arr, n);

    insertAt(arr, n, 2, 25);
    cout << "After insert 25 at index 2: ";
    printArray(arr, n);

    deleteAt(arr, n, 4);
    cout << "After delete at index 4: ";
    printArray(arr, n);

    reverseArray(arr, n);
    cout << "After reverse: ";
    printArray(arr, n);

    rotateLeft(arr, n, 2);
    cout << "After left rotate by 2: ";
    printArray(arr, n);

    return 0;
}
