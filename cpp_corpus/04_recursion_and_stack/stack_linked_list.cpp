#include <iostream>
using namespace std;

class Node{
    public:
    int data;
    Node* next;
};

Node* topNode = NULL;

void push(int value)
{
    Node* newNode = new Node;

    newNode->data = value;
    newNode->next = topNode;

    topNode = newNode;

    cout << value << " pushed into stack.\n";
}

void pop()
{
    if (topNode == NULL)
    {
        cout << "Stack Underflow!\n";
    }
    else
    {
        Node* temp = topNode;

        cout << temp->data << " popped from stack.\n";

        topNode = topNode->next;

        delete temp;
    }
}

void peek()
{
    if (topNode == NULL)
    {
        cout << "Stack is empty.\n";
    }
    else
    {
        cout << "Top element: " << topNode->data << endl;
    }
}

void display()
{
    if (topNode == NULL)
    {
        cout << "Stack is empty.\n";
    }
    else
    {
        Node* temp = topNode;

        cout << "Stack elements:\n";

        while (temp != NULL)
        {
            cout << temp->data << endl;
            temp = temp->next;
        }
    }
}

int main()
{
    int choice, value;

    do
    {
        cout << "\n--- Stack Using Linked List ---\n";
        cout << "1. Push\n";
        cout << "2. Pop\n";
        cout << "3. Peek\n";
        cout << "4. Display\n";
        cout << "5. Check Empty\n";
        cout << "6. Exit\n";

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
                if (topNode == NULL)
                    cout << "Stack is empty.\n";
                else
                    cout << "Stack is not empty.\n";
                break;

            case 6:
                cout << "Exiting...\n";
                break;

            default:
                cout << "Invalid choice!\n";
        }

    } while (choice != 6);

    // Free remaining nodes
    while (topNode != NULL)
    {
        Node* temp = topNode;
        topNode = topNode->next;
        delete temp;
    }

    return 0;
}