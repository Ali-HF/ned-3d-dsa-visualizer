
#include <iostream>
using namespace std;
//note: The array must be sorted for binary search to work correctly.
// Iterative Binary Search
int binarySearch(int arr[], int n, int key)
{
    int low = 0;
    int high = n - 1;

    while (low <= high)
    {
        int mid = low + (high - low) / 2;

        if (arr[mid] == key)
            return mid;

        else if (arr[mid] < key)
            low = mid + 1;

        else
            high = mid - 1;
    }

    return -1;
}

// Recursive Binary Search
int recursiveBinarySearch(int arr[], int low, int high, int key)
{
    if (low > high)
        return -1;

    int mid = low + (high - low) / 2;

    if (arr[mid] == key)
        return mid;

    if (arr[mid] < key)
        return recursiveBinarySearch(arr, mid + 1, high, key);

    return recursiveBinarySearch(arr, low, mid - 1, key);
}

// Lower Bound
int lowerBound(int arr[], int n, int key)
{
    int low = 0, high = n;

    while (low < high)
    {
        int mid = low + (high - low) / 2;

        if (arr[mid] < key)
            low = mid + 1;
        else
            high = mid;
    }

    return low;
}

// Upper Bound
int upperBound(int arr[], int n, int key)
{
    int low = 0, high = n;

    while (low < high)
    {
        int mid = low + (high - low) / 2;

        if (arr[mid] <= key)
            low = mid + 1;
        else
            high = mid;
    }

    return low;
}

// First Occurrence
int firstOccurrence(int arr[], int n, int key)
{
    int low = 0, high = n - 1;
    int answer = -1;

    while (low <= high)
    {
        int mid = low + (high - low) / 2;

        if (arr[mid] == key)
        {
            answer = mid;
            high = mid - 1;
        }
        else if (arr[mid] < key)
        {
            low = mid + 1;
        }
        else
        {
            high = mid - 1;
        }
    }

    return answer;
}

// Last Occurrence
int lastOccurrence(int arr[], int n, int key)
{
    int low = 0, high = n - 1;
    int answer = -1;

    while (low <= high)
    {
        int mid = low + (high - low) / 2;

        if (arr[mid] == key)
        {
            answer = mid;
            low = mid + 1;
        }
        else if (arr[mid] < key)
        {
            low = mid + 1;
        }
        else
        {
            high = mid - 1;
        }
    }

    return answer;
}

int main()
{
    int arr[100], n, key;

    cout << "Enter array size: ";
    cin >> n;

    cout << "Enter sorted array elements: ";

    for (int i = 0; i < n; i++)
    {
        cin >> arr[i];
    }

    cout << "Enter search value: ";
    cin >> key;

    cout << "\nIterative Search: "
         << binarySearch(arr, n, key);

    cout << "\nRecursive Search: "
         << recursiveBinarySearch(arr, 0, n - 1, key);

    cout << "\nLower Bound: "
         << lowerBound(arr, n, key);

    cout << "\nUpper Bound: "
         << upperBound(arr, n, key);

    cout << "\nFirst Occurrence: "
         << firstOccurrence(arr, n, key);

    cout << "\nLast Occurrence: "
         << lastOccurrence(arr, n, key);

    return 0;
}
