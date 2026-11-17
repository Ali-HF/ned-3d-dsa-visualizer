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
