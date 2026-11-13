#include <iostream>
#include <algorithm>

using namespace std;

class AVLTree
{
private:
    struct Node
    {
        int key;
        Node* left;
        Node* right;
        int height;

        Node(int k) // initialize node with height 1
        {
            key = k;
            left = nullptr;
            right = nullptr;
            height = 1;
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

    int height(Node* node) const // return node height or 0 if null
    {
        return (node != nullptr) ? node->height : 0;
    }

    int balanceFactor(Node* node) const // balance factor = left height - right height
    {
        return (node != nullptr) ? height(node->left) - height(node->right) : 0;
    }

    void updateHeight(Node* node) // recalculate height from children
    {
        node->height = 1 + max(height(node->left), height(node->right));
    }

    Node* rotateRight(Node* y) // right rotation for LL imbalance
    {
        Node* x = y->left;
        Node* T2 = x->right;

        x->right = y;
        y->left = T2;

        updateHeight(y);
        updateHeight(x);

        return x;
    }

    Node* rotateLeft(Node* x) // left rotation for RR imbalance
    {
        Node* y = x->right;
        Node* T2 = y->left;

        y->left = x;
        x->right = T2;

        updateHeight(x);
        updateHeight(y);

        return y;
    }

    Node* balance(Node* node) // restore AVL invariant via LL, RR, LR, or RL rotations
    {
        updateHeight(node);
        int bf = balanceFactor(node);

        if (bf > 1) // left-heavy
        {
            if (balanceFactor(node->left) < 0) // LR case
            {
                node->left = rotateLeft(node->left);
            }
            return rotateRight(node); // LL case
        }

        if (bf < -1) // right-heavy
        {
            if (balanceFactor(node->right) > 0) // RL case
            {
                node->right = rotateRight(node->right);
            }
            return rotateLeft(node); // RR case
        }

        return node;
    }

    Node* insert(Node* node, int key) // recursive AVL insertion with rebalancing
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
        else
        {
            return node; // ignore duplicate keys
        }

        return balance(node);
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

    void preOrder(Node* node) const // print key and balance factor to inspect tree shape
    {
        if (node == nullptr)
        {
            return;
        }
        cout << node->key << "(bf=" << balanceFactor(node) << ") ";
        preOrder(node->left);
        preOrder(node->right);
    }

public:
    AVLTree()
    {
        root = nullptr;
    }

    ~AVLTree()
    {
        destroyTree(root);
    }

    void insert(int key)
    {
        root = insert(root, key);
    }

    void inOrder() const
    {
        inOrder(root);
        cout << endl;
    }

    void preOrder() const
    {
        preOrder(root);
        cout << endl;
    }
};

int main()
{
    AVLTree llTree;
    llTree.insert(30);
    llTree.insert(20);
    llTree.insert(10); // triggers LL rotation
    cout << "LL Rotation (30, 20, 10) preorder: ";
    llTree.preOrder();

    AVLTree rrTree;
    rrTree.insert(10);
    rrTree.insert(20);
    rrTree.insert(30); // triggers RR rotation
    cout << "RR Rotation (10, 20, 30) preorder: ";
    rrTree.preOrder();

    AVLTree lrTree;
    lrTree.insert(30);
    lrTree.insert(10);
    lrTree.insert(20); // triggers LR rotation
    cout << "LR Rotation (30, 10, 20) preorder: ";
    lrTree.preOrder();

    AVLTree rlTree;
    rlTree.insert(10);
    rlTree.insert(30);
    rlTree.insert(20); // triggers RL rotation
    cout << "RL Rotation (10, 30, 20) preorder: ";
    rlTree.preOrder();

    AVLTree fullTree;
    int keys[] = {10, 20, 30, 40, 50, 25};
    for (int k : keys)
    {
        fullTree.insert(k);
    }
    cout << "Combined AVL in-order:  ";
    fullTree.inOrder();
    cout << "Combined AVL preorder:  ";
    fullTree.preOrder();

    return 0;
}

