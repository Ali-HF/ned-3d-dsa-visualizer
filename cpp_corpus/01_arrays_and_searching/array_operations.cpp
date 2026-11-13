
#include <iostream>
using namespace std;

int main()
{
    int arr[100], n, choice, pos, value;

    cout << "Enter array size: ";
    cin >> n;

    cout << "Enter array elements: ";
    for (int i = 0; i < n; i++)
    {
        cin >> arr[i];
    }

    cout << "\n1. Insert";
    cout << "\n2. Delete";
    cout << "\n3. Update";
    cout << "\n4. Reverse";
    cout << "\n5. Rotate Right";

    cout << "\nEnter choice: ";
    cin >> choice;

    switch (choice)
    {
        case 1:
            cout << "Enter position and value: ";
            cin >> pos >> value;

            if (n >= 100 || pos < 0 || pos > n)
            {
                cout << "Invalid position or full array";
                break;
            }

            for (int i = n; i > pos; i--)
            {
                arr[i] = arr[i - 1];
            }

            arr[pos] = value;
            n++;
            break;

        case 2:
            cout << "Enter position to delete: ";
            cin >> pos;

            if (pos < 0 || pos >= n)
            {
                cout << "Invalid position";
                break;
            }

            for (int i = pos; i < n - 1; i++)
            {
                arr[i] = arr[i + 1];
            }

            n--;
            break;

        case 3:
            cout << "Enter position and new value: ";
            cin >> pos >> value;

            if (pos < 0 || pos >= n)
            {
                cout << "Invalid position";
                break;
            }

            arr[pos] = value;
            break;

        case 4:
            for (int i = 0; i < n / 2; i++)
            {
                int temp = arr[i];
                arr[i] = arr[n - 1 - i];
                arr[n - 1 - i] = temp;
            }
            break;

        case 5:
            if (n == 0)
            {
                cout << "Array is empty";
                break;
            }

            value = arr[n - 1];

            for (int i = n - 1; i > 0; i--)
            {
                arr[i] = arr[i - 1];
            }

            arr[0] = value;
            break;

        default:
            cout << "Invalid choice";
    }

    cout << "\nUpdated Array: ";

    for (int i = 0; i < n; i++)
    {
        cout << arr[i] << " ";
    }

    return 0;
}
