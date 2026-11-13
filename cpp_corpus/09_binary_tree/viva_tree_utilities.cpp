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

int main()
{
    TreeNode* root = new TreeNode(1); // construct sample binary tree
    root->left = new TreeNode(2);
    root->right = new TreeNode(3);
    root->left->left = new TreeNode(4);
    root->left->right = new TreeNode(5);
    root->right->right = new TreeNode(6);

    cout << "Original tree (in-order): ";
    printInOrder(root);
    cout << endl;

    cout << "Tree height:      " << getHeight(root) << endl;
    cout << "Total nodes:      " << countTotalNodes(root) << endl;
    cout << "Leaf node count:  " << countLeafNodes(root) << endl;

    mirrorTree(root); // invert tree structure

    cout << "Mirrored tree (in-order): ";
    printInOrder(root);
    cout << endl;

    destroyTree(root);
    return 0;
}

