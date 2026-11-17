#include <iostream>
#include <algorithm>

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

void destroyTree(TreeNode* node) // post-order cleanup of allocated nodes
{
    if (node == nullptr)
    {
        return;
    }
    destroyTree(node->left);
    destroyTree(node->right);
    delete node;
}

int getHeight(TreeNode* node) // compute height in terms of node count (0 for empty)
{
    if (node == nullptr)
    {
        return 0;
    }
    return 1 + max(getHeight(node->left), getHeight(node->right));
}

int countTotalNodes(TreeNode* node) // count all nodes in subtree
{
    if (node == nullptr)
    {
        return 0;
    }
    return 1 + countTotalNodes(node->left) + countTotalNodes(node->right);
}

int countLeafNodes(TreeNode* node) // count nodes with no children
{
    if (node == nullptr)
    {
        return 0;
    }
    if (node->left == nullptr && node->right == nullptr)
    {
        return 1;
    }
    return countLeafNodes(node->left) + countLeafNodes(node->right);
}

void mirrorTree(TreeNode* node) // invert binary tree by swapping left and right subtrees
{
    if (node == nullptr)
    {
        return;
    }

    TreeNode* temp = node->left;
    node->left = node->right;
    node->right = temp;

    mirrorTree(node->left);
    mirrorTree(node->right);
}

void printInOrder(TreeNode* node) // in-order traversal for verification
{
    if (node == nullptr)
    {
        return;
    }
    printInOrder(node->left);
    cout << node->val << " ";
    printInOrder(node->right);
}
