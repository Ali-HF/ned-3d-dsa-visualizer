#include <iostream>
using namespace std;

const int V = 5;

class MatrixGraph {
    int matrix[V][V];

public:
    MatrixGraph() {
        for (int i = 0; i < V; i++) {
            for (int j = 0; j < V; j++) {
                matrix[i][j] = 0;
            }
        }
    }

    void addEdge(int u, int v) {
        matrix[u][v] = 1;
        matrix[v][u] = 1;
    }

    void addDirectedEdge(int u, int v) {
        matrix[u][v] = 1;
    }

    void display() {
        cout << "  ";
        for (int i = 0; i < V; i++) {
            cout << i << " ";
        }
        cout << endl;
        for (int i = 0; i < V; i++) {
            cout << i << " ";
            for (int j = 0; j < V; j++) {
                cout << matrix[i][j] << " ";
            }
            cout << endl;
        }
    }
};

struct Node {
    int data;
    Node* next;
};

class ListGraph {
    Node* list[V];

public:
    ListGraph() {
        for (int i = 0; i < V; i++) {
            list[i] = NULL;
        }
    }

    void addDirectedEdge(int u, int v) {
        Node* newNode = new Node;
        newNode->data = v;
        newNode->next = NULL;

        if (list[u] == NULL) {
            list[u] = newNode;
        } else {
            Node* temp = list[u];
            while (temp->next != NULL) {
                temp = temp->next;
            }
            temp->next = newNode;
        }
    }

    void addEdge(int u, int v) {
        addDirectedEdge(u, v);
        addDirectedEdge(v, u);
    }

    void display() {
        for (int i = 0; i < V; i++) {
            cout << i << " -> ";
            Node* temp = list[i];
            while (temp != NULL) {
                cout << temp->data << " ";
                temp = temp->next;
            }
            cout << endl;
        }
    }
};

int main() {
    cout << "Undirected Graph - Adjacency Matrix" << endl;
    MatrixGraph m1;
    m1.addEdge(0, 1);
    m1.addEdge(0, 2);
    m1.addEdge(1, 3);
    m1.addEdge(2, 4);
    m1.display();

    cout << endl << "Directed Graph - Adjacency Matrix" << endl;
    MatrixGraph m2;
    m2.addDirectedEdge(0, 1);
    m2.addDirectedEdge(0, 2);
    m2.addDirectedEdge(1, 3);
    m2.addDirectedEdge(2, 4);
    m2.display();

    cout << endl << "Undirected Graph - Adjacency List" << endl;
    ListGraph l1;
    l1.addEdge(0, 1);
    l1.addEdge(0, 2);
    l1.addEdge(1, 3);
    l1.addEdge(2, 4);
    l1.display();

    cout << endl << "Directed Graph - Adjacency List" << endl;
    ListGraph l2;
    l2.addDirectedEdge(0, 1);
    l2.addDirectedEdge(0, 2);
    l2.addDirectedEdge(1, 3);
    l2.addDirectedEdge(2, 4);
    l2.display();

    return 0;
}
