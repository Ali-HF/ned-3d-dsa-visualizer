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
