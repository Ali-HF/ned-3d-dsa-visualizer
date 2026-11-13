#include <iostream>
using namespace std;

int stackArr[100];
int topIndex = -1;

void push(int value)
{
    if (topIndex == 99)
    {
        cout << "Stack Overflow!\n";
    }
    else
    {
        topIndex++;
        stackArr[topIndex] = value;
        cout << value << " pushed into stack.\n";
    }
}

void pop()
{
    if (topIndex == -1)
    {
        cout << "Stack Underflow!\n";
    }
    else
    {
        cout << stackArr[topIndex] << " popped from stack.\n";
        topIndex--;
    }
}

void peek()
{
    if (topIndex == -1)
    {
        cout << "Stack is empty.\n";
    }
    else
    {
        cout << "Top element: " << stackArr[topIndex] << endl;
    }
}

void display()
{
    if (topIndex == -1)
    {
        cout << "Stack is empty.\n";
    }
    else
    {
        cout << "Stack elements:\n";

        for (int i = topIndex; i >= 0; i--)
        {
            cout << stackArr[i] << endl;
        }
    }
}

int main()
{
    int choice, value;

    do
    {
        cout << "\n--- Stack Using Array ---\n";
        cout << "1. Push\n";
        cout << "2. Pop\n";
        cout << "3. Peek\n";
        cout << "4. Display\n";
        cout << "5. Check Empty\n";
        cout << "6. Check Full\n";
        cout << "7. Exit\n";

        cout << "Enter choice: ";
        cin >> choice;

        switch (choice)
        {
            case 1:
                cout << "Enter value: ";
                cin >> value;
                push(value);
                break;

            case 2:
                pop();
                break;

            case 3:
                peek();
                break;

            case 4:
                display();
                break;

            case 5:
                if (topIndex == -1)
                    cout << "Stack is empty.\n";
                else
                    cout << "Stack is not empty.\n";
                break;

            case 6:
                if (topIndex == 99)
                    cout << "Stack is full.\n";
                else
                    cout << "Stack is not full.\n";
                break;

            case 7:
                cout << "Exiting...\n";
                break;

            default:
                cout << "Invalid choice!\n";
        }

    } while (choice != 7);

    return 0;
}