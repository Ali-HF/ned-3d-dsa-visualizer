/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 1: Linear Search (Iterative & Recursive)
 */
#include <iostream>
using namespace std;

int linearSearchIterative(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}

int linearSearchRecursive(int arr[], int n, int target, int index = 0) {
    if (index >= n) return -1;
    if (arr[index] == target) return index;
    return linearSearchRecursive(arr, n, target, index + 1);
}

int main() {
    int arr[] = {42, 17, 68, 29, 84, 12};
    int n = sizeof(arr) / sizeof(arr[0]);
    int target = 29;

    int idx1 = linearSearchIterative(arr, n, target);
    cout << "Iterative: Found " << target << " at index " << idx1 << endl;

    int idx2 = linearSearchRecursive(arr, n, target);
    cout << "Recursive: Found " << target << " at index " << idx2 << endl;

    return 0;
}
