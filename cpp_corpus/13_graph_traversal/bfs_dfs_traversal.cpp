/**
 * NED University - CT-159 Data Structure Algorithms & Applications
 * Week 13: BFS and DFS Graph Traversals
 */
#include <iostream>
#include <vector>
#include <queue>
using namespace std;

void BFS(int start, const vector<vector<int>>& adj, int V) {
    vector<bool> visited(V, false);
    queue<int> q;

    visited[start] = true;
    q.push(start);

    cout << "BFS starting from " << start << ": ";
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        cout << u << " ";

        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
    cout << endl;
}

void DFSUtil(int u, const vector<vector<int>>& adj, vector<bool>& visited) {
    visited[u] = true;
    cout << u << " ";
    for (int v : adj[u]) {
        if (!visited[v]) {
            DFSUtil(v, adj, visited);
        }
    }
}

void DFS(int start, const vector<vector<int>>& adj, int V) {
    vector<bool> visited(V, false);
    cout << "DFS starting from " << start << ": ";
    DFSUtil(start, adj, visited);
    cout << endl;
}

int main() {
    int V = 5;
    vector<vector<int>> adj(V);
    adj[0] = {1, 2};
    adj[1] = {0, 3, 4};
    adj[2] = {0};
    adj[3] = {1};
    adj[4] = {1};

    BFS(0, adj, V);
    DFS(0, adj, V);

    return 0;
}
