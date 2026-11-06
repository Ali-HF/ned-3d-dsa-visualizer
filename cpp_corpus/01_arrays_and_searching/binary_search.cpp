/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 1: Binary Search (Iterative, Recursive & Bounds)
 */
#include <iostream>
using namespace std;

int binarySearchIterative(int arr[], int n, int key) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == key) return mid;
        if (arr[mid] < key) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int binarySearchRecursive(int arr[], int low, int high, int key) {
    if (low > high) return -1;
    int mid = low + (high - low) / 2;
    if (arr[mid] == key) return mid;
    if (arr[mid] < key) return binarySearchRecursive(arr, mid + 1, high, key);
    return binarySearchRecursive(arr, low, mid - 1, key);
}

int findFirstOccurrence(int arr[], int n, int key) {
    int low = 0, high = n - 1, ans = -1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == key) {
            ans = mid;
            high = mid - 1; // keep looking left
        } else if (arr[mid] < key) low = mid + 1;
        else high = mid - 1;
    }
    return ans;
}

int main() {
    int arr[] = {10, 20, 30, 30, 30, 40, 50};
    int n = sizeof(arr) / sizeof(arr[0]);

    cout << "Index of 40 (iterative): " << binarySearchIterative(arr, n, 40) << endl;
    cout << "Index of 40 (recursive): " << binarySearchRecursive(arr, 0, n - 1, 40) << endl;
    cout << "First occurrence of 30: " << findFirstOccurrence(arr, n, 30) << endl;

    return 0;
}
