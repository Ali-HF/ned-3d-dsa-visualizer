/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 11 Viva Staples: Is Valid BST & Lowest Common Ancestor (LCA)
 */
#include <iostream>
#include <climits>
using namespace std;

struct Node {
    int key;
    Node *left, *right;
    Node(int val) : key(val), left(nullptr), right(nullptr) {}
};

bool isValidBST(Node* root, long long minVal = LLONG_MIN, long long maxVal = LLONG_MAX) {
    if (!root) return true;
    if (root->key <= minVal || root->key >= maxVal) return false;
    return isValidBST(root->left, minVal, root->key) &&
           isValidBST(root->right, root->key, maxVal);
}

Node* lowestCommonAncestor(Node* root, int p, int q) {
    if (!root) return nullptr;
    if (p < root->key && q < root->key) return lowestCommonAncestor(root->left, p, q);
    if (p > root->key && q > root->key) return lowestCommonAncestor(root->right, p, q);
    return root;
}

int main() {
    Node* root = new Node(20);
    root->left = new Node(10);
    root->right = new Node(30);
    root->left->left = new Node(5);
    root->left->right = new Node(15);

    cout << "Is Valid BST: " << (isValidBST(root) ? "YES" : "NO") << endl;

    Node* lca = lowestCommonAncestor(root, 5, 15);
    cout << "LCA of 5 and 15 is: " << lca->key << endl;

    return 0;
}
