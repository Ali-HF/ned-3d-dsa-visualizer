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
