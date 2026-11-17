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
