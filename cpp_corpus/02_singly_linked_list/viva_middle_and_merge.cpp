
#include <iostream>
using namespace std;

struct Node
{
    int data;
    Node* next;
};

void insertEnd(Node*& head, int value)
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

// Find middle node
Node* findMiddle(Node* head)
{
    if (head == NULL)
        return NULL;

    Node* slow = head;
    Node* fast = head;

    while (fast != NULL && fast->next != NULL)
    {
        slow = slow->next;
        fast = fast->next->next;
    }

    return slow;
}

// Merge two sorted linked lists
Node* mergeLists(Node* first, Node* second)
{
    Node* result = NULL;
    Node* tail = NULL;

    while (first != NULL && second != NULL)
    {
        Node* selected;

        if (first->data <= second->data)
        {
            selected = first;
            first = first->next;
        }
        else
        {
            selected = second;
            second = second->next;
        }

        if (result == NULL)
        {
            result = selected;
            tail = selected;
        }
        else
        {
            tail->next = selected;
            tail = selected;
        }
    }

    if (first != NULL)
        tail->next = first;

    if (second != NULL)
        tail->next = second;

    return result;
}

void display(Node* head)
{
    while (head != NULL)
    {
        cout << head->data << " -> ";
        head = head->next;
    }

    cout << "NULL\n";
}

int main()
{
    Node* list1 = NULL;
    Node* list2 = NULL;

    int n, value;

    cout << "Enter size of first list: ";
    cin >> n;

    cout << "Enter sorted elements: ";

    for (int i = 0; i < n; i++)
    {
        cin >> value;
        insertEnd(list1, value);
    }

    cout << "Enter size of second list: ";
    cin >> n;

    cout << "Enter sorted elements: ";

    for (int i = 0; i < n; i++)
    {
        cin >> value;
        insertEnd(list2, value);
    }

    Node* middle = findMiddle(list1);

    if (middle != NULL)
        cout << "\nMiddle of first list: " << middle->data;

    Node* merged = mergeLists(list1, list2);

    cout << "\nMerged List: ";
    display(merged);

    return 0;
}
