#include <iostream>
using namespace std;

bool insertAt(int arr[], int& n, int pos, int value)
{
    if (n >= 100 || pos < 0 || pos > n)
    {
        return false;
    }

    for (int i = n; i > pos; i--)
    {
        arr[i] = arr[i - 1];
    }

    arr[pos] = value;
    n++;
    return true;
}

bool deleteAtIndex(int arr[], int& n, int pos)
{
    if (pos < 0 || pos >= n)
    {
        return false;
    }

    for (int i = pos; i < n - 1; i++)
    {
        arr[i] = arr[i + 1];
    }

    n--;
    return true;
}

bool updateAt(int arr[], int n, int pos, int value)
{
    if (pos < 0 || pos >= n)
    {
        return false;
    }

    arr[pos] = value;
    return true;
}

void reverseArray(int arr[], int n)
{
    for (int i = 0; i < n / 2; i++)
    {
        int temp = arr[i];
        arr[i] = arr[n - 1 - i];
        arr[n - 1 - i] = temp;
    }
}

void rotateRight(int arr[], int n)
{
    if (n == 0) return;

    int value = arr[n - 1];

    for (int i = n - 1; i > 0; i--)
    {
        arr[i] = arr[i - 1];
    }

    arr[0] = value;
}

bool deleteByValue(int arr[], int& n, int value)
{
    int foundIdx = -1;
    for (int i = 0; i < n; i++)
    {
        if (arr[i] == value)
        {
            foundIdx = i;
            break;
        }
    }

    if (foundIdx == -1)
    {
        return false;
    }

    for (int i = foundIdx; i < n - 1; i++)
    {
        arr[i] = arr[i + 1];
    }

    n--;
    return true;
}
