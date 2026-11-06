/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 14: Topological Sorting (Kahn's BFS In-Degree Algorithm)
 */
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

void topologicalSortKahn(int V, const vector<vector<int>>& adj) {
    vector<int> inDegree(V, 0);
    for (int u = 0; u < V; u++) {
        for (int v : adj[u]) inDegree[v]++;
    }

    queue<int> q;
    for (int i = 0; i < V; i++) {
        if (inDegree[i] == 0) q.push(i);
    }

    int count = 0;
    cout << "Topological Order: ";
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        cout << u << " ";
        count++;

        for (int v : adj[u]) {
            if (--inDegree[v] == 0) q.push(v);
        }
    }
    cout << endl;

    if (count != V) {
        cout << "Cycle detected! Graph is not a DAG.\n";
    }
}

int main() {
    int V = 6;
    vector<vector<int>> adj(V);
    adj[5] = {2, 0};
    adj[4] = {0, 1};
    adj[2] = {3};
    adj[3] = {1};

    topologicalSortKahn(V, adj);
    return 0;
}
