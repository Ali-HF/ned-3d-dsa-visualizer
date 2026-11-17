#include <iostream>
using namespace std;

struct Node
{
    int data;
    Node* next;
};

Node* head = NULL;

// Insert at end
void insertEnd(int value)
{
    Node* newNode = new Node;

    newNode->data = value;

    if (head == NULL)
    {
        head = newNode;
        newNode->next = head;
        return;
    }

    Node* temp = head;

    while (temp->next != head)
    {
        temp = temp->next;
    }

    temp->next = newNode;
    newNode->next = head;
}

// Insert at beginning
void insertBeginning(int value)
{
    Node* newNode = new Node;

    newNode->data = value;

    if (head == NULL)
    {
        head = newNode;
        newNode->next = head;
        return;
    }

    Node* temp = head;

    while (temp->next != head)
    {
        temp = temp->next;
    }

    newNode->next = head;
    temp->next = newNode;
    head = newNode;
}

// Delete from beginning
void deleteBeginning()
{
    if (head == NULL)
    {
        cout << "List is empty\n";
        return;
    }

    if (head->next == head)
    {
        delete head;
        head = NULL;
        return;
    }

    Node* temp = head;
    Node* last = head;

    while (last->next != head)
    {
        last = last->next;
    }

    head = head->next;
    last->next = head;

    delete temp;
}

// Display circular list
void display()
{
    if (head == NULL)
    {
        cout << "List is empty\n";
        return;
    }

    Node* temp = head;

    do
    {
        cout << temp->data << " -> ";
        temp = temp->next;

    } while (temp != head);

    cout << "(Back to Head)\n";
}
