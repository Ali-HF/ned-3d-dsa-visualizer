#include <iostream>
using namespace std;

struct Node
{
    int data;
    Node* next;
};

Node* head = NULL;

// Insert at beginning
void insertBeginning(int value)
{
    Node* newNode = new Node;

    newNode->data = value;
    newNode->next = head;

    head = newNode;
}

// Insert at end
void insertEnd(int value)
{
    Node* newNode = new Node;

    newNode->data = value;
    newNode->next = NULL;

    if (head == NULL)
    {
        head = newNode;
        return;
    }

    Node* temp = head;

    while (temp->next != NULL)
    {
        temp = temp->next;
    }

    temp->next = newNode;
}

// Insert at a position (1-based)
void insertPosition(int value, int pos)
{
    if (pos < 1)
    {
        cout << "Invalid position\n";
        return;
    }

    if (pos == 1)
    {
        insertBeginning(value);
        return;
    }

    Node* temp = head;

    for (int i = 1; i < pos - 1 && temp != NULL; i++)
    {
        temp = temp->next;
    }

    if (temp == NULL)
    {
        cout << "Invalid position\n";
        return;
    }

    Node* newNode = new Node;

    newNode->data = value;
    newNode->next = temp->next;

    temp->next = newNode;
}

// Delete from beginning
void deleteBeginning()
{
    if (head == NULL)
    {
        cout << "List is empty\n";
        return;
    }

    Node* temp = head;

    head = head->next;

    delete temp;
}

// Delete from end
void deleteEnd()
{
    if (head == NULL)
    {
        cout << "List is empty\n";
        return;
    }

    if (head->next == NULL)
    {
        delete head;
        head = NULL;
        return;
    }

    Node* temp = head;

    while (temp->next->next != NULL)
    {
        temp = temp->next;
    }

    delete temp->next;
    temp->next = NULL;
}

// Delete at a position (1-based)
void deletePosition(int pos)
{
    if (head == NULL || pos < 1)
    {
        cout << "Invalid position or empty list\n";
        return;
    }

    if (pos == 1)
    {
        deleteBeginning();
        return;
    }

    Node* temp = head;

    for (int i = 1; i < pos - 1 && temp != NULL; i++)
    {
        temp = temp->next;
    }

    if (temp == NULL || temp->next == NULL)
    {
        cout << "Invalid position\n";
        return;
    }

    Node* deleteNode = temp->next;

    temp->next = deleteNode->next;

    delete deleteNode;
}

// Search a value
void search(int value)
{
    Node* temp = head;
    int pos = 1;

    while (temp != NULL)
    {
        if (temp->data == value)
        {
            cout << "Found at position " << pos << endl;
            return;
        }

        temp = temp->next;
        pos++;
    }

    cout << "Value not found\n";
}

// Reverse linked list
void reverseList()
{
    Node* prev = NULL;
    Node* current = head;
    Node* nextNode = NULL;

    while (current != NULL)
    {
        nextNode = current->next;

        current->next = prev;

        prev = current;
        current = nextNode;
    }

    head = prev;
}

// Display linked list
void display()
{
    Node* temp = head;

    while (temp != NULL)
    {
        cout << temp->data << " -> ";
        temp = temp->next;
    }

    cout << "NULL\n";
}
