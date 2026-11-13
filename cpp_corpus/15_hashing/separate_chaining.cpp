#include <iostream>
#include <vector>

using namespace std;

class HashTableSeparateChaining
{
private:
    struct Node
    {
        int key;
        Node* next;

        Node(int k) // initialize linked list bucket node
        {
            key = k;
            next = nullptr;
        }
    };

    vector<Node*> buckets;
    int capacity;

    int hashFunction(int key) const // map key into [0, capacity) safely for negative keys
    {
        return ((key % capacity) + capacity) % capacity;
    }

public:
    HashTableSeparateChaining(int cap)
    {
        capacity = (cap > 0) ? cap : 1;
        buckets.assign(capacity, nullptr);
    }

    ~HashTableSeparateChaining() // free all linked list nodes across every bucket
    {
        for (int i = 0; i < capacity; i++)
        {
            Node* curr = buckets[i];
            while (curr != nullptr)
            {
                Node* nextNode = curr->next;
                delete curr;
                curr = nextNode;
            }
        }
    }

    bool search(int key) const // traverse bucket chain for matching key
    {
        int idx = hashFunction(key);
        Node* curr = buckets[idx];

        while (curr != nullptr)
        {
            if (curr->key == key)
            {
                return true;
            }
            curr = curr->next;
        }

        return false;
    }

    bool insert(int key) // insert at bucket head if key is not already present
    {
        if (search(key))
        {
            return false; // ignore duplicates
        }

        int idx = hashFunction(key);
        Node* newNode = new Node(key);
        newNode->next = buckets[idx];
        buckets[idx] = newNode;
        return true;
    }

    bool remove(int key) // unlink and delete key from its bucket chain
    {
        int idx = hashFunction(key);
        Node* curr = buckets[idx];
        Node* prev = nullptr;

        while (curr != nullptr)
        {
            if (curr->key == key)
            {
                if (prev == nullptr)
                {
                    buckets[idx] = curr->next;
                }
                else
                {
                    prev->next = curr->next;
                }
                delete curr;
                return true;
            }
            prev = curr;
            curr = curr->next;
        }

        return false;
    }

    void display() const
    {
        for (int i = 0; i < capacity; i++)
        {
            cout << "  [" << i << "]: ";
            Node* curr = buckets[i];
            while (curr != nullptr)
            {
                cout << curr->key << " -> ";
                curr = curr->next;
            }
            cout << "nullptr" << endl;
        }
    }
};

int main()
{
    HashTableSeparateChaining ht(5);

    int keys[] = {10, 15, 20, 7, 12, 22, 3}; // 10, 15, 20 collide at 0; 7, 12, 22 collide at 2
    for (int k : keys)
    {
        ht.insert(k);
    }

    cout << "Hash Table after insertions:" << endl;
    ht.display();

    cout << "\nSearch 12: " << (ht.search(12) ? "Found" : "Not Found") << endl;
    cout << "Search 99: " << (ht.search(99) ? "Found" : "Not Found") << endl;

    cout << "\nDeleting 15 (middle of bucket 0) and 22 (head of bucket 2)..." << endl;
    ht.remove(15);
    ht.remove(22);
    ht.display();

    return 0;
}

