#include <iostream>
#include <queue>

using namespace std;

class TreeNode
{
public:
    int val;
    TreeNode* left;
    TreeNode* right;

    TreeNode(int x) // initialize binary tree node
    {
        val = x;
        left = nullptr;
        right = nullptr;
    }
};

class BinaryTree
{
private:
    TreeNode* root;

    void destroyTree(TreeNode* node) // recursively free all allocated nodes
    {
        if (node == nullptr)
        {
            return;
        }
        destroyTree(node->left);
        destroyTree(node->right);
        delete node;
    }

    void preOrderHelper(TreeNode* node) const // root -> left -> right
    {
        if (node == nullptr)
        {
            return;
        }
        cout << node->val << " ";
        preOrderHelper(node->left);
        preOrderHelper(node->right);
    }

    void inOrderHelper(TreeNode* node) const // left -> root -> right
    {
        if (node == nullptr)
        {
            return;
        }
        inOrderHelper(node->left);
        cout << node->val << " ";
        inOrderHelper(node->right);
    }

    void postOrderHelper(TreeNode* node) const // left -> right -> root
    {
        if (node == nullptr)
        {
            return;
        }
        postOrderHelper(node->left);
        postOrderHelper(node->right);
        cout << node->val << " ";
    }

public:
    BinaryTree()
    {
        root = nullptr;
    }

    ~BinaryTree()
    {
        destroyTree(root);
    }

    void insertLevelOrder(int val) // insert at first available position in level order
    {
        TreeNode* newNode = new TreeNode(val);
        if (root == nullptr)
        {
            root = newNode;
            return;
        }

        queue<TreeNode*> q;
        q.push(root);

        while (!q.empty())
        {
            TreeNode* curr = q.front();
            q.pop();

            if (curr->left == nullptr)
            {
                curr->left = newNode;
                return;
            }
            q.push(curr->left);

            if (curr->right == nullptr)
            {
                curr->right = newNode;
                return;
            }
            q.push(curr->right);
        }
    }

    void preOrder() const
    {
        preOrderHelper(root);
        cout << endl;
    }

    void inOrder() const
    {
        inOrderHelper(root);
        cout << endl;
    }

    void postOrder() const
    {
        postOrderHelper(root);
        cout << endl;
    }

    void levelOrder() const // breadth-first traversal using a queue
    {
        if (root == nullptr)
        {
            cout << endl;
            return;
        }

        queue<TreeNode*> q;
        q.push(root);

        while (!q.empty())
        {
            TreeNode* curr = q.front();
            q.pop();

            cout << curr->val << " ";

            if (curr->left != nullptr)
            {
                q.push(curr->left);
            }
            if (curr->right != nullptr)
            {
                q.push(curr->right);
            }
        }
        cout << endl;
    }
};

int main()
{
    BinaryTree tree;

    for (int i = 1; i <= 7; i++) // construct complete binary tree with values 1..7
    {
        tree.insertLevelOrder(i);
    }

    cout << "Preorder traversal (DFS):    ";
    tree.preOrder();

    cout << "Inorder traversal (DFS):     ";
    tree.inOrder();

    cout << "Postorder traversal (DFS):   ";
    tree.postOrder();

    cout << "Level-order traversal (BFS): ";
    tree.levelOrder();

    return 0;
}

