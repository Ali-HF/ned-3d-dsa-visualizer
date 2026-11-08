import { describe, it, expect } from 'vitest';
import { useViewportStore } from '../../src/state/useViewportStore';
import { executeCustomCodeTrace } from '../../src/engine/codeRunner';

const USER_BST_PROGRAM = `#include <iostream>
#include <stack>
using namespace std;

class TreeNode
{
public:
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int value) { val = value; left = nullptr; right = nullptr; }
};

class BinarySearchTree
{
public:
    TreeNode* root;
    BinarySearchTree() { root = nullptr; }

    TreeNode* insertRec(TreeNode* node, int key)
    {
        if (node == nullptr) return new TreeNode(key);
        if (key < node->val) node->left = insertRec(node->left, key);
        else if (key > node->val) node->right = insertRec(node->right, key);
        return node;
    }
    void insert(int key) { root = insertRec(root, key); }

    void preorderTraversal()
    {
        if (root == nullptr) return;
        stack<TreeNode*> s;
        s.push(root);
        while (!s.empty()) {
            TreeNode* curr = s.top(); s.pop();
            cout << curr->val << " ";
            if (curr->right != nullptr) s.push(curr->right);
            if (curr->left != nullptr) s.push(curr->left);
        }
        cout << endl;
    }

    void postorderTraversal()
    {
        if (root == nullptr) return;
        stack<TreeNode*> s1; stack<TreeNode*> s2;
        s1.push(root);
        while (!s1.empty()) {
            TreeNode* curr = s1.top(); s1.pop();
            s2.push(curr);
            if (curr->left != nullptr) s1.push(curr->left);
            if (curr->right != nullptr) s1.push(curr->right);
        }
        while (!s2.empty()) { cout << s2.top()->val << " "; s2.pop(); }
        cout << endl;
    }
};

int main()
{
    BinarySearchTree bst;
    bst.insert(50); // build test BST
    bst.insert(30);
    bst.insert(20);
    bst.insert(40);
    bst.insert(70);
    bst.insert(60);
    bst.insert(80);
    bst.preorderTraversal();
    bst.postorderTraversal();
}`;

describe('Run My Code — Binary Search Tree programs', () => {
  it('builds the tree from main() inserts and replays pre-order then post-order', () => {
    const res = executeCustomCodeTrace(USER_BST_PROGRAM, [1, 2, 3], undefined, 'Task1.cpp');
    expect(res.scene).toBe('bst');

    const created = res.events.filter((e) => e.t === 'create').map((e) => (e as { value: number }).value);
    expect(created).toEqual([50, 30, 20, 40, 70, 60, 80]);

    const notes = res.events.filter((e) => e.t === 'note').map((e) => (e as { text: string }).text);
    expect(notes).toContain('preorderTraversal() printed: 50 30 20 40 70 60 80');
    expect(notes).toContain('postorderTraversal() printed: 20 40 30 60 80 70 50');
    expect(res.extractedArray).toEqual([20, 30, 40, 50, 60, 70, 80]);
  });

  it('renders all 7 user values with a correct dynamic tree layout on the 3D stage and opens the code editor panel', () => {
    const store = useViewportStore.getState();
    store.setDetailsOpen(false);
    store.runCustomCodeNow(USER_BST_PROGRAM, 'Task1.cpp');
    expect(useViewportStore.getState().detailsOpen).toBe(true);

    store.skipToEnd();
    const objs = Object.values(useViewportStore.getState().sceneObjects);
    expect(objs.map((o) => o.value).sort((a, b) => Number(a) - Number(b))).toEqual([
      20, 30, 40, 50, 60, 70, 80,
    ]);
    const root = objs.find((o) => o.value === 50)!;
    const left = objs.find((o) => o.value === 30)!;
    const right = objs.find((o) => o.value === 70)!;
    expect(root.position[1]).toBeGreaterThan(left.position[1]);
    expect(left.position[0]).toBeLessThan(root.position[0]);
    expect(right.position[0]).toBeGreaterThan(root.position[0]);
  });

  it('supports delete and search calls made from main()', () => {
    const code = `
      int main() {
        BST t;
        t.insert(50); t.insert(30); t.insert(70); t.insert(60); t.insert(80);
        t.deleteNode(70);
        t.search(60);
        t.inorder();
      }
      // node->left node->right
    `;
    const res = executeCustomCodeTrace(code, [], undefined, 'del.cpp');
    expect(res.scene).toBe('bst');
    const notes = res.events.filter((e) => e.t === 'note').map((e) => (e as { text: string }).text);
    expect(notes).toContain('inorder() printed: 30 50 60 80');
    expect(notes.some((n) => n.includes('found 60'))).toBe(true);
  });
});
