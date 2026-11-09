#include <iostream>
using namespace std;

const int V = 5;
const int E = 7;

struct Edge {
    int u;
    int v;
    int weight;
};

Edge edges[E];
int parent[V];

int find(int x) {
    while (parent[x] != x) {
        x = parent[x];
    }
    return x;
}

void unionSets(int a, int b) {
    int rootA = find(a);
    int rootB = find(b);
    parent[rootA] = rootB;
}

void sortEdges() {
    for (int i = 0; i < E - 1; i++) {
        for (int j = 0; j < E - i - 1; j++) {
            if (edges[j].weight > edges[j + 1].weight) {
                Edge temp = edges[j];
                edges[j] = edges[j + 1];
                edges[j + 1] = temp;
            }
        }
    }
}

void kruskal() {
    for (int i = 0; i < V; i++) {
        parent[i] = i;
    }

    sortEdges();

    int total = 0;
    int taken = 0;

    cout << "Edges in MST:" << endl;
    for (int i = 0; i < E; i++) {
        int u = edges[i].u;
        int v = edges[i].v;

        if (find(u) != find(v)) {
            cout << u << " - " << v << " (" << edges[i].weight << ")" << endl;
            total = total + edges[i].weight;
            unionSets(u, v);
            taken++;
        }

        if (taken == V - 1) {
            break;
        }
    }

    cout << "Total weight = " << total << endl;
}

int main() {
    edges[0] = {0, 1, 4};
    edges[1] = {0, 2, 3};
    edges[2] = {1, 2, 1};
    edges[3] = {1, 3, 2};
    edges[4] = {2, 3, 5};
    edges[5] = {3, 4, 7};
    edges[6] = {2, 4, 6};

    kruskal();

    return 0;
}
