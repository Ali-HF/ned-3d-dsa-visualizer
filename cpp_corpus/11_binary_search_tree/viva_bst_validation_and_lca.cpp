#include <iostream>
#include <climits>

using namespace std;

class TreeNode
{
public:
    int val;
    TreeNode* left;
    TreeNode* right;

    TreeNode(int x) // initialize tree node
    {
        val = x;
        left = nullptr;
        right = nullptr;
    }
};

void destroyTree(TreeNode* node) // recursively free allocated tree nodes
{
    if (node == nullptr)
    {
        return;
    }
    destroyTree(node->left);
    destroyTree(node->right);
    delete node;
}

bool isValidBSTHelper(TreeNode* node, long long minVal, long long maxVal) // enforce strict ancestor bounds
{
    if (node == nullptr)
    {
        return true;
    }

    if (node->val <= minVal || node->val >= maxVal)
    {
        return false;
    }

    return isValidBSTHelper(node->left, minVal, node->val) &&
           isValidBSTHelper(node->right, node->val, maxVal);
}

bool isValidBST(TreeNode* root) // validate BST using 64-bit bounds to safely handle INT_MIN/INT_MAX
{
    return isValidBSTHelper(root, LLONG_MIN, LLONG_MAX);
}

bool containsKey(TreeNode* root, int key) // verify key exists in BST before LCA lookup
{
    TreeNode* curr = root;
    while (curr != nullptr)
    {
        if (key == curr->val)
        {
            return true;
        }
        curr = (key < curr->val) ? curr->left : curr->right;
    }
    return false;
}

TreeNode* findLCA(TreeNode* root, int p, int q) // locate lowest common ancestor in a valid BST
{
    if (!containsKey(root, p) || !containsKey(root, q))
    {
        return nullptr;
    }

    TreeNode* curr = root;
    while (curr != nullptr)
    {
        if (p < curr->val && q < curr->val) // both targets lie in left subtree
        {
            curr = curr->left;
        }
        else if (p > curr->val && q > curr->val) // both targets lie in right subtree
        {
            curr = curr->right;
        }
        else // split point reached (or one target equals current node)
        {
            return curr;
        }
    }

    return nullptr;
}

int main()
{
    TreeNode* validRoot = new TreeNode(20); // construct valid BST
    validRoot->left = new TreeNode(10);
    validRoot->right = new TreeNode(30);
    validRoot->left->left = new TreeNode(5);
    validRoot->left->right = new TreeNode(15);
    validRoot->right->left = new TreeNode(25);
    validRoot->right->right = new TreeNode(35);

    cout << "Tree 1 is valid BST: " << (isValidBST(validRoot) ? "true" : "false") << endl;

    TreeNode* lca1 = findLCA(validRoot, 5, 15);
    cout << "LCA(5, 15) = " << (lca1 != nullptr ? to_string(lca1->val) : "Not found") << endl;

    TreeNode* lca2 = findLCA(validRoot, 5, 30);
    cout << "LCA(5, 30) = " << (lca2 != nullptr ? to_string(lca2->val) : "Not found") << endl;

    TreeNode* lca3 = findLCA(validRoot, 10, 15);
    cout << "LCA(10, 15) = " << (lca3 != nullptr ? to_string(lca3->val) : "Not found") << endl;

    TreeNode* invalidRoot = new TreeNode(20); // construct invalid BST (22 in left subtree of 20)
    invalidRoot->left = new TreeNode(10);
    invalidRoot->right = new TreeNode(30);
    invalidRoot->left->right = new TreeNode(22);

    cout << "Tree 2 is valid BST: " << (isValidBST(invalidRoot) ? "true" : "false") << endl;

    destroyTree(validRoot);
    destroyTree(invalidRoot);
    return 0;
}

