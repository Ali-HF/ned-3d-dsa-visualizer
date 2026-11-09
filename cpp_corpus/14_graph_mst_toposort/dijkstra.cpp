#include <iostream>
using namespace std;

const int V = 5;
const int INF = 9999;

int graph[V][V];

void addEdge(int u, int v, int w) {
    graph[u][v] = w;
    graph[v][u] = w;
}

int findMinNode(int dist[], bool done[]) {
    int min = INF;
    int minIndex = -1;
    for (int i = 0; i < V; i++) {
        if (!done[i] && dist[i] < min) {
            min = dist[i];
            minIndex = i;
        }
    }
    return minIndex;
}

void dijkstra(int start) {
    int dist[V];
    bool done[V];

    for (int i = 0; i < V; i++) {
        dist[i] = INF;
        done[i] = false;
    }
    dist[start] = 0;

    for (int count = 0; count < V; count++) {
        int u = findMinNode(dist, done);
        if (u == -1) {
            break;
        }
        done[u] = true;

        for (int v = 0; v < V; v++) {
            if (graph[u][v] != 0 && !done[v]) {
                if (dist[u] + graph[u][v] < dist[v]) {
                    dist[v] = dist[u] + graph[u][v];
                }
            }
        }
    }

    cout << "Shortest distance from node " << start << endl;
    for (int i = 0; i < V; i++) {
        cout << start << " to " << i << " = " << dist[i] << endl;
    }
}

int main() {
    for (int i = 0; i < V; i++) {
        for (int j = 0; j < V; j++) {
            graph[i][j] = 0;
        }
    }

    addEdge(0, 1, 4);
    addEdge(0, 2, 1);
    addEdge(2, 1, 2);
    addEdge(1, 3, 1);
    addEdge(2, 3, 5);
    addEdge(3, 4, 3);

    dijkstra(0);

    return 0;
}
