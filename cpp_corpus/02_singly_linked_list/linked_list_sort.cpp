#include <iostream>
using namespace std;

struct Node
{
    int data;
    Node* next;
};

Node* createNode(int value)
{
    Node* newNode = new Node;
    newNode->data = value;
    newNode->next = NULL;
    return newNode;
}

void insertEnd(Node*& head, int value)
{
    Node* newNode = createNode(value);

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

void display(Node* head)
{
    Node* temp = head;

    while (temp != NULL)
    {
        cout << temp->data << " -> ";
        temp = temp->next;
    }

    cout << "NULL\n";
}

// Bubble Sort
void bubbleSort(Node* head)
{
    if (head == NULL)
        return;

    bool swapped;

    Node* current;

    do
    {
        swapped = false;
        current = head;

        while (current->next != NULL)
        {
            if (current->data > current->next->data)
            {
                int temp = current->data;
                current->data = current->next->data;
                current->next->data = temp;

                swapped = true;
            }

            current = current->next;
        }

    } while (swapped);
}

// Find middle node
Node* getMiddle(Node* head)
{
    Node* slow = head;
    Node* fast = head->next;

    while (fast != NULL && fast->next != NULL)
    {
        slow = slow->next;
        fast = fast->next->next;
    }

    return slow;
}

// Merge two sorted lists
Node* merge(Node* left, Node* right)
{
    Node* result = NULL;
    Node* tail = NULL;

    while (left != NULL && right != NULL)
    {
        Node* selected;

        if (left->data <= right->data)
        {
            selected = left;
            left = left->next;
        }
        else
        {
            selected = right;
            right = right->next;
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

    if (left != NULL)
        tail->next = left;

    if (right != NULL)
        tail->next = right;

    return result;
}

// Merge Sort
Node* mergeSort(Node* head)
{
    if (head == NULL || head->next == NULL)
        return head;

    Node* middle = getMiddle(head);

    Node* right = middle->next;
    middle->next = NULL;

    Node* left = mergeSort(head);
    right = mergeSort(right);

    return merge(left, right);
}

int main()
{
    Node* head = NULL;
    int n, value, choice;

    cout << "Enter number of nodes: ";
    cin >> n;

    cout << "Enter elements: ";

    for (int i = 0; i < n; i++)
    {
        cin >> value;
        insertEnd(head, value);
    }

    cout << "\n1. Bubble Sort";
    cout << "\n2. Merge Sort";
    cout << "\nEnter choice: ";
    cin >> choice;

    cout << "\nOriginal List: ";
    display(head);

    if (choice == 1)
        bubbleSort(head);
    else if (choice == 2)
        head = mergeSort(head);
    else
        cout << "Invalid choice\n";

    cout << "Sorted List: ";
    display(head);

    return 0;
}
