/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 14: Dijkstra's Shortest Path Algorithm
 */
#include <iostream>
#include <vector>
#include <climits>
using namespace std;

#define V 5

int minDistance(int dist[], bool sptSet[]) {
    int minVal = INT_MAX, min_index = -1;
    for (int v = 0; v < V; v++) {
        if (!sptSet[v] && dist[v] <= minVal) {
            minVal = dist[v];
            min_index = v;
        }
    }
    return min_index;
}

void dijkstra(int graph[V][V], int src) {
    int dist[V];
    bool sptSet[V];

    for (int i = 0; i < V; i++) {
        dist[i] = INT_MAX;
        sptSet[i] = false;
    }
    dist[src] = 0;

    for (int count = 0; count < V - 1; count++) {
        int u = minDistance(dist, sptSet);
        if (u == -1) break;
        sptSet[u] = true;

        for (int v = 0; v < V; v++) {
            if (!sptSet[v] && graph[u][v] && dist[u] != INT_MAX
                && dist[u] + graph[u][v] < dist[v]) {
                dist[v] = dist[u] + graph[u][v];
            }
        }
    }

    cout << "Vertex \t Distance from Source " << src << "\n";
    for (int i = 0; i < V; i++) cout << i << " \t\t " << dist[i] << "\n";
}

int main() {
    int graph[V][V] = {
        {0, 4, 0, 0, 8},
        {4, 0, 8, 0, 11},
        {0, 8, 0, 7, 0},
        {0, 0, 7, 0, 9},
        {8, 11, 0, 9, 0}
    };

    dijkstra(graph, 0);
    return 0;
}
