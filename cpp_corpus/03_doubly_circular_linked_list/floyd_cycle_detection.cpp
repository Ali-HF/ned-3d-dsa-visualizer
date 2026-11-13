#include <iostream>
using namespace std;

struct Node
{
    int data;
    Node* next;
};

// Create a new node
Node* createNode(int value)
{
    Node* newNode = new Node;

    newNode->data = value;
    newNode->next = NULL;

    return newNode;
}

// Insert at end
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

// Detect cycle
bool detectCycle(Node* head)
{
    Node* slow = head;
    Node* fast = head;

    while (fast != NULL && fast->next != NULL)
    {
        slow = slow->next;
        fast = fast->next->next;

        if (slow == fast)
        {
            return true;
        }
    }

    return false;
}

int main()
{
    Node* head = NULL;

    int n, value;

    cout << "Enter number of nodes: ";
    cin >> n;

    cout << "Enter elements: ";

    for (int i = 0; i < n; i++)
    {
        cin >> value;
        insertEnd(head, value);
    }

    // Check for cycle
    if (detectCycle(head))
    {
        cout << "Cycle detected";
    }
    else
    {
        cout << "No cycle detected";
    }

    return 0;
}
