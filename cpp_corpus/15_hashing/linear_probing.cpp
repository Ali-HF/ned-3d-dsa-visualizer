/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 15: Hash Table with Open Addressing (Linear Probing & Tombstones)
 */
#include <iostream>
using namespace std;

#define TABLE_SIZE 7
#define EMPTY -1
#define DELETED -2

class HashTableLinearProbing {
    int table[TABLE_SIZE];

    int hashFunc(int key) {
        return key % TABLE_SIZE;
    }

public:
    HashTableLinearProbing() {
        for (int i = 0; i < TABLE_SIZE; i++) table[i] = EMPTY;
    }

    void insert(int key) {
        int index = hashFunc(key);
        int i = 0;
        while (table[(index + i) % TABLE_SIZE] != EMPTY &&
               table[(index + i) % TABLE_SIZE] != DELETED &&
               i < TABLE_SIZE) {
            i++;
        }
        if (i == TABLE_SIZE) {
            cout << "Hash Table Full!\n";
            return;
        }
        table[(index + i) % TABLE_SIZE] = key;
    }

    bool search(int key) {
        int index = hashFunc(key);
        int i = 0;
        while (table[(index + i) % TABLE_SIZE] != EMPTY && i < TABLE_SIZE) {
            if (table[(index + i) % TABLE_SIZE] == key) return true;
            i++;
        }
        return false;
    }

    void remove(int key) {
        int index = hashFunc(key);
        int i = 0;
        while (table[(index + i) % TABLE_SIZE] != EMPTY && i < TABLE_SIZE) {
            if (table[(index + i) % TABLE_SIZE] == key) {
                table[(index + i) % TABLE_SIZE] = DELETED; // Tombstone
                return;
            }
            i++;
        }
    }

    void display() {
        for (int i = 0; i < TABLE_SIZE; i++) {
            cout << "[" << i << "] : ";
            if (table[i] == EMPTY) cout << "EMPTY";
            else if (table[i] == DELETED) cout << "DELETED";
            else cout << table[i];
            cout << endl;
        }
    }
};

int main() {
    HashTableLinearProbing ht;
    ht.insert(10);
    ht.insert(17);
    ht.insert(24); // Collision at index 3 -> probes to 4, 5
    ht.display();

    cout << "Search 17: " << (ht.search(17) ? "FOUND" : "NOT FOUND") << endl;
    ht.remove(17);
    cout << "After removing 17:\n";
    ht.display();

    return 0;
}
