/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 11: Binary Search Tree (Insert, Search, 3 Deletion Cases, Inorder)
 */
#include <iostream>
using namespace std;

struct Node {
    int key;
    Node *left, *right;
    Node(int val) : key(val), left(nullptr), right(nullptr) {}
};

Node* insert(Node* root, int key) {
    if (!root) return new Node(key);
    if (key < root->key) root->left = insert(root->left, key);
    else if (key > root->key) root->right = insert(root->right, key);
    return root;
}

bool search(Node* root, int key) {
    if (!root) return false;
    if (root->key == key) return true;
    if (key < root->key) return search(root->left, key);
    return search(root->right, key);
}

Node* minValueNode(Node* node) {
    Node* current = node;
    while (current && current->left) current = current->left;
    return current;
}

Node* deleteNode(Node* root, int key) {
    if (!root) return root;
    if (key < root->key) root->left = deleteNode(root->left, key);
    else if (key > root->key) root->right = deleteNode(root->right, key);
    else {
        // Case 1 & 2: Leaf or one child
        if (!root->left) {
            Node* temp = root->right;
            delete root;
            return temp;
        } else if (!root->right) {
            Node* temp = root->left;
            delete root;
            return temp;
        }
        // Case 3: Two children
        Node* temp = minValueNode(root->right); // Inorder successor
        root->key = temp->key;
        root->right = deleteNode(root->right, temp->key);
    }
    return root;
}

void inorder(Node* root) {
    if (!root) return;
    inorder(root->left);
    cout << root->key << " ";
    inorder(root->right);
}

int main() {
    Node* root = nullptr;
    root = insert(root, 50);
    insert(root, 30);
    insert(root, 20);
    insert(root, 40);
    insert(root, 70);
    insert(root, 60);
    insert(root, 80);

    cout << "Inorder (Sorted): ";
    inorder(root);
    cout << endl;

    root = deleteNode(root, 50);
    cout << "After deleting 50: ";
    inorder(root);
    cout << endl;

    return 0;
}
