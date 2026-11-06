/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 13: Graph Representations (Adjacency Matrix & Adjacency List)
 */
#include <iostream>
#include <vector>
using namespace std;

class GraphMatrix {
    int V;
    vector<vector<int>> matrix;

public:
    GraphMatrix(int vertices) : V(vertices), matrix(vertices, vector<int>(vertices, 0)) {}

    void addEdge(int u, int v) {
        matrix[u][v] = 1;
        matrix[v][u] = 1; // Undirected
    }

    void display() {
        cout << "Adjacency Matrix:\n";
        for (int i = 0; i < V; i++) {
            for (int j = 0; j < V; j++) cout << matrix[i][j] << " ";
            cout << endl;
        }
    }
};

class GraphList {
    int V;
    vector<vector<int>> adj;

public:
    GraphList(int vertices) : V(vertices), adj(vertices) {}

    void addEdge(int u, int v) {
        adj[u].push_back(v);
        adj[v].push_back(u);
    }

    void display() {
        cout << "Adjacency List:\n";
        for (int i = 0; i < V; i++) {
            cout << i << " -> ";
            for (int v : adj[i]) cout << v << " ";
            cout << endl;
        }
    }
};

int main() {
    GraphMatrix gm(4);
    gm.addEdge(0, 1);
    gm.addEdge(1, 2);
    gm.addEdge(2, 3);
    gm.display();

    GraphList gl(4);
    gl.addEdge(0, 1);
    gl.addEdge(1, 2);
    gl.addEdge(2, 3);
    gl.display();

    return 0;
}
