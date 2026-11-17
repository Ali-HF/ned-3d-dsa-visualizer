#include <iostream>
using namespace std;

const int V = 6;

struct Node {
    int data;
    Node* next;
};

Node* graph[V];
bool visited[V];

void addDirectedEdge(int u, int v) {
    Node* newNode = new Node;
    newNode->data = v;
    newNode->next = NULL;

    if (graph[u] == NULL) {
        graph[u] = newNode;
    } else {
        Node* temp = graph[u];
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

void resetVisited() {
    for (int i = 0; i < V; i++) {
        visited[i] = false;
    }
}

void bfs(int start) {
    int queue[V];
    int front = 0;
    int rear = 0;

    visited[start] = true;
    queue[rear] = start;
    rear++;

    while (front < rear) {
        int node = queue[front];
        front++;
        cout << node << " ";

        Node* temp = graph[node];
        while (temp != NULL) {
            int next = temp->data;
            if (!visited[next]) {
                visited[next] = true;
                queue[rear] = next;
                rear++;
            }
            temp = temp->next;
        }
    }
    cout << endl;
}

void dfs(int node) {
    visited[node] = true;
    cout << node << " ";

    Node* temp = graph[node];
    while (temp != NULL) {
        int next = temp->data;
        if (!visited[next]) {
            dfs(next);
        }
        temp = temp->next;
    }
}
