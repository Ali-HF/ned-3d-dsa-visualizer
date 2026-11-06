/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 15: Hash Table with Closed Addressing (Separate Chaining)
 */
#include <iostream>
using namespace std;

#define BUCKETS 5

struct HashNode {
    int key;
    HashNode* next;
    HashNode(int k) : key(k), next(nullptr) {}
};

class HashTableChaining {
    HashNode* table[BUCKETS];

    int hashFunc(int key) {
        return key % BUCKETS;
    }

public:
    HashTableChaining() {
        for (int i = 0; i < BUCKETS; i++) table[i] = nullptr;
    }

    void insert(int key) {
        int idx = hashFunc(key);
        HashNode* newNode = new HashNode(key);
        newNode->next = table[idx];
        table[idx] = newNode;
    }

    bool search(int key) {
        int idx = hashFunc(key);
        HashNode* curr = table[idx];
        while (curr) {
            if (curr->key == key) return true;
            curr = curr->next;
        }
        return false;
    }

    void display() {
        for (int i = 0; i < BUCKETS; i++) {
            cout << "Bucket " << i << ": ";
            HashNode* curr = table[i];
            while (curr) {
                cout << curr->key << " -> ";
                curr = curr->next;
            }
            cout << "NULL\n";
        }
    }
};

int main() {
    HashTableChaining ht;
    ht.insert(10);
    ht.insert(15);
    ht.insert(20);
    ht.insert(7);
    ht.insert(12);

    ht.display();
    cout << "Search 15: " << (ht.search(15) ? "FOUND" : "NOT FOUND") << endl;
    return 0;
}
