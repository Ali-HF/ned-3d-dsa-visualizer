#include <iostream>

using namespace std;

class BinarySearchTree
{
private:
    struct Node
    {
        int key;
        Node* left;
        Node* right;

        Node(int k) // initialize BST node
        {
            key = k;
            left = nullptr;
            right = nullptr;
        }
    };

    Node* root;

    void destroyTree(Node* node) // recursively deallocate tree nodes
    {
        if (node == nullptr)
        {
            return;
        }
        destroyTree(node->left);
        destroyTree(node->right);
        delete node;
    }

    Node* insert(Node* node, int key) // recursive BST insertion ignoring duplicates
    {
        if (node == nullptr)
        {
            return new Node(key);
        }

        if (key < node->key)
        {
            node->left = insert(node->left, key);
        }
        else if (key > node->key)
        {
            node->right = insert(node->right, key);
        }

        return node;
    }

    bool search(Node* node, int key) const // recursive lookup using BST ordering
    {
        if (node == nullptr)
        {
            return false;
        }
        if (key == node->key)
        {
            return true;
        }
        if (key < node->key)
        {
            return search(node->left, key);
        }
        return search(node->right, key);
    }

    Node* minValueNode(Node* node) const // find in-order successor (leftmost node)
    {
        Node* current = node;
        while (current != nullptr && current->left != nullptr)
        {
            current = current->left;
        }
        return current;
    }

    Node* deleteNode(Node* node, int key) // handle all 3 BST deletion cases
    {
        if (node == nullptr)
        {
            return nullptr;
        }

        if (key < node->key)
        {
            node->left = deleteNode(node->left, key);
        }
        else if (key > node->key)
        {
            node->right = deleteNode(node->right, key);
        }
        else
        {
            if (node->left == nullptr && node->right == nullptr) // case 1: leaf node
            {
                delete node;
                return nullptr;
            }
            if (node->left == nullptr) // case 2a: single right child
            {
                Node* temp = node->right;
                delete node;
                return temp;
            }
            if (node->right == nullptr) // case 2b: single left child
            {
                Node* temp = node->left;
                delete node;
                return temp;
            }

            Node* successor = minValueNode(node->right); // case 3: two children
            node->key = successor->key;
            node->right = deleteNode(node->right, successor->key);
        }

        return node;
    }

    void inOrder(Node* node) const // sorted traversal
    {
        if (node == nullptr)
        {
            return;
        }
        inOrder(node->left);
        cout << node->key << " ";
        inOrder(node->right);
    }

public:
    BinarySearchTree()
    {
        root = nullptr;
    }

    ~BinarySearchTree()
    {
        destroyTree(root);
    }

    void insert(int key)
    {
        root = insert(root, key);
    }

    bool search(int key) const
    {
        return search(root, key);
    }

    void deleteKey(int key)
    {
        root = deleteNode(root, key);
    }

    void inOrder() const
    {
        inOrder(root);
        cout << endl;
    }
};

int main()
{
    BinarySearchTree bst;
    int values[] = {50, 30, 70, 20, 40, 60, 80, 65};

    for (int val : values)
    {
        bst.insert(val);
    }

    cout << "Initial BST (in-order): ";
    bst.inOrder();

    cout << "Search 40: " << (bst.search(40) ? "Found" : "Not Found") << endl;
    cout << "Search 99: " << (bst.search(99) ? "Found" : "Not Found") << endl;

    bst.deleteKey(20); // case 1: delete leaf node
    cout << "After deleting 20 (leaf):          ";
    bst.inOrder();

    bst.deleteKey(60); // case 2: delete node with single child (65)
    cout << "After deleting 60 (single child):  ";
    bst.inOrder();

    bst.deleteKey(50); // case 3: delete root with two children
    cout << "After deleting 50 (two children):  ";
    bst.inOrder();

    return 0;
}

