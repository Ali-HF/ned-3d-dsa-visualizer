#include <iostream>
using namespace std;

// Iterative Linear Search
int linearSearch(int arr[], int n, int key)
{
    for (int i = 0; i < n; i++)
    {
        if (arr[i] == key)
        {
            return i;
        }
    }

    return -1;
}

// Recursive Linear Search
int recursiveSearch(int arr[], int n, int key, int index)
{
    if (index == n)
    {
        return -1;
    }

    if (arr[index] == key)
    {
        return index;
    }

    return recursiveSearch(arr, n, key, index + 1);
}

int main()
{
    int arr[100], n, key;

    cout << "Enter array size: ";
    cin >> n;

    cout << "Enter array elements: ";

    for (int i = 0; i < n; i++)
    {
        cin >> arr[i];
    }

    cout << "Enter value to search: ";
    cin >> key;

    int result = linearSearch(arr, n, key);

    if (result != -1)
        cout << "Iterative: Found at index " << result << endl;
    else
        cout << "Iterative: Not found" << endl;

    result = recursiveSearch(arr, n, key, 0);

    if (result != -1)
        cout << "Recursive: Found at index " << result;
    else
        cout << "Recursive: Not found";

    return 0;
}
