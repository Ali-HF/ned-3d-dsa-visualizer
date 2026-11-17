#include <iostream>
using namespace std;

struct Node
{
    int data;
    Node* prev;
    Node* next;
};

Node* head = NULL;

// Insert at beginning
void insertBeginning(int value)
{
    Node* newNode = new Node;

    newNode->data = value;
    newNode->prev = NULL;
    newNode->next = head;

    if (head != NULL)
    {
        head->prev = newNode;
    }

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
        newNode->prev = NULL;
        head = newNode;
        return;
    }

    Node* temp = head;

    while (temp->next != NULL)
    {
        temp = temp->next;
    }

    temp->next = newNode;
    newNode->prev = temp;
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

    if (head != NULL)
    {
        head->prev = NULL;
    }

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

    Node* temp = head;

    while (temp->next != NULL)
    {
        temp = temp->next;
    }

    if (temp->prev != NULL)
    {
        temp->prev->next = NULL;
    }
    else
    {
        head = NULL;
    }

    delete temp;
}

// Forward traversal
void displayForward()
{
    Node* temp = head;

    while (temp != NULL)
    {
        cout << temp->data << " <-> ";
        temp = temp->next;
    }

    cout << "NULL\n";
}

// Backward traversal
void displayBackward()
{
    if (head == NULL)
        return;

    Node* temp = head;

    while (temp->next != NULL)
    {
        temp = temp->next;
    }

    while (temp != NULL)
    {
        cout << temp->data << " <-> ";
        temp = temp->prev;
    }

    cout << "NULL\n";
}
