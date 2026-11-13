#include <iostream>
#include <vector>

using namespace std;

class HashTableLinearProbing
{
private:
    enum SlotState
    {
        EMPTY,
        OCCUPIED,
        DELETED
    };

    struct Slot
    {
        int key;
        SlotState state;

        Slot()
        {
            key = 0;
            state = EMPTY;
        }
    };

    vector<Slot> table;
    int capacity;
    int count;

    int hashFunction(int key) const // map key into [0, capacity) safely for negative keys
    {
        return ((key % capacity) + capacity) % capacity;
    }

public:
    HashTableLinearProbing(int cap)
    {
        capacity = (cap > 0) ? cap : 1;
        table.resize(capacity);
        count = 0;
    }

    bool insert(int key) // insert key using linear probing, reusing first tombstone if needed
    {
        int startIdx = hashFunction(key);
        int firstDeleted = -1;

        for (int i = 0; i < capacity; i++)
        {
            int idx = (startIdx + i) % capacity;

            if (table[idx].state == OCCUPIED && table[idx].key == key)
            {
                return false; // duplicate key already exists
            }

            if (table[idx].state == DELETED && firstDeleted == -1)
            {
                firstDeleted = idx; // remember earliest tombstone while scanning for duplicates
            }

            if (table[idx].state == EMPTY)
            {
                int target = (firstDeleted != -1) ? firstDeleted : idx;
                table[target].key = key;
                table[target].state = OCCUPIED;
                count++;
                return true;
            }
        }

        if (firstDeleted != -1) // table had no EMPTY slots, place in remembered tombstone
        {
            table[firstDeleted].key = key;
            table[firstDeleted].state = OCCUPIED;
            count++;
            return true;
        }

        cout << "Hash table is full; could not insert " << key << endl;
        return false;
    }

    bool search(int key) const // probe past tombstones until key or EMPTY slot is found
    {
        int startIdx = hashFunction(key);

        for (int i = 0; i < capacity; i++)
        {
            int idx = (startIdx + i) % capacity;

            if (table[idx].state == EMPTY)
            {
                return false;
            }
            if (table[idx].state == OCCUPIED && table[idx].key == key)
            {
                return true;
            }
        }

        return false;
    }

    bool remove(int key) // mark deleted slot with tombstone so later probes remain valid
    {
        int startIdx = hashFunction(key);

        for (int i = 0; i < capacity; i++)
        {
            int idx = (startIdx + i) % capacity;

            if (table[idx].state == EMPTY)
            {
                return false;
            }
            if (table[idx].state == OCCUPIED && table[idx].key == key)
            {
                table[idx].state = DELETED;
                count--;
                return true;
            }
        }

        return false;
    }

    void display() const
    {
        cout << "Hash Table (" << count << "/" << capacity << " occupied):" << endl;
        for (int i = 0; i < capacity; i++)
        {
            cout << "  [" << i << "] ";
            if (table[i].state == EMPTY)
            {
                cout << "EMPTY" << endl;
            }
            else if (table[i].state == DELETED)
            {
                cout << "DELETED (tombstone)" << endl;
            }
            else
            {
                cout << table[i].key << endl;
            }
        }
    }
};

int main()
{
    HashTableLinearProbing ht(7);

    ht.insert(10); // 10 % 7 = 3
    ht.insert(17); // 17 % 7 = 3 -> probes to 4
    ht.insert(24); // 24 % 7 = 3 -> probes to 5
    ht.insert(5);  // 5 % 7 = 5 -> probes to 6

    ht.display();

    cout << "\nDeleting 17 (places tombstone at index 4)..." << endl;
    ht.remove(17);
    ht.display();

    cout << "\nSearch 24 (must probe past tombstone): " << (ht.search(24) ? "Found" : "Not Found") << endl;
    cout << "Search 17: " << (ht.search(17) ? "Found" : "Not Found") << endl;

    cout << "\nInserting 31 (31 % 7 = 3, reuses tombstone at index 4)..." << endl;
    ht.insert(31);
    ht.display();

    return 0;
}

