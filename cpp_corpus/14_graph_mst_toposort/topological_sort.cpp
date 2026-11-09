#include <iostream>
using namespace std;

const int V = 6;

int graph[V][V];

void addEdge(int u, int v) {
    graph[u][v] = 1;
}

void topologicalSort() {
    int inDegree[V];
    int queue[V];
    int front = 0;
    int rear = 0;
    int count = 0;

    for (int i = 0; i < V; i++) {
        inDegree[i] = 0;
    }

    for (int i = 0; i < V; i++) {
        for (int j = 0; j < V; j++) {
            if (graph[i][j] == 1) {
                inDegree[j]++;
            }
        }
    }

    for (int i = 0; i < V; i++) {
        if (inDegree[i] == 0) {
            queue[rear] = i;
            rear++;
        }
    }

    cout << "Topological order: ";
    while (front < rear) {
        int node = queue[front];
        front++;
        cout << node << " ";
        count++;

        for (int j = 0; j < V; j++) {
            if (graph[node][j] == 1) {
                inDegree[j]--;
                if (inDegree[j] == 0) {
                    queue[rear] = j;
                    rear++;
                }
            }
        }
    }
    cout << endl;

    if (count != V) {
        cout << "Cycle found, topological sort not possible" << endl;
    }
}

int main() {
    for (int i = 0; i < V; i++) {
        for (int j = 0; j < V; j++) {
            graph[i][j] = 0;
        }
    }

    addEdge(5, 2);
    addEdge(5, 0);
    addEdge(4, 0);
    addEdge(4, 1);
    addEdge(2, 3);
    addEdge(3, 1);

    topologicalSort();

    return 0;
}
