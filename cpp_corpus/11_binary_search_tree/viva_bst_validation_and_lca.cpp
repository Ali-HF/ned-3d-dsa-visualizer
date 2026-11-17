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
