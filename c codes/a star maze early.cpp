#ifndef MAZE_MAZE_H
#define MAZE_MAZE_H

#include <iostream>
#include <memory>
#include <algorithm>
#include <unordered_set>
#include <queue>
#include <cmath>
#include <utility>
#include <chrono>
#include <fstream>

#define MAZE_ROWS 18
#define MAZE_COLS 25
#define ASTAR_METHOD "L2"

using namespace std;
typedef pair<int, int> Point;

struct Node {
    Node(shared_ptr<Node> node_parent, int xx, int yy, double node_value, double node_cost)
            : parent(move(node_parent)), x(xx), y(yy), cont_value(node_value), cont_cost(node_cost) {}

    Node(shared_ptr<Node> node_parent, int xx, int yy, int node_value, int node_cost)
            : parent(move(node_parent)), x(xx), y(yy), disc_value(node_value), disc_cost(node_cost) {}

    shared_ptr<Node> parent;
    int x;
    int y;
    union {
        double cont_value;
        int disc_value;
    };
    union {
        double cont_cost;
        int disc_cost;
    };
};

struct PointHash {
    inline std::size_t operator()(const Point &v) const {
        return v.first * 31 + v.second;
    }
};

struct ContNodePtrCmp {
    inline bool operator()(const shared_ptr<Node> &a, const shared_ptr<Node> &b) {
        return a->cont_value > b->cont_value;
    }
};

class Maze {
public:
    explicit Maze(ifstream &ifs);

    bool is_valid_coordinate(int x, int y);

private:
    unordered_set<Point, PointHash> obstacles;
    int rows;
    int cols;
};

class Search {
public:
    explicit Search(ifstream &ifs, const Point &maze_entry, const Point &maze_target);
    void search();
    string construct_path();

    chrono::microseconds search_duration;

    int num_nodes;

protected:
    virtual void maze_search() = 0;
    shared_ptr<Node> final;
    Maze maze;
    Point entry;
    Point target;
    vector<shared_ptr<Node>> visited;
    unordered_set<Point, PointHash> visited_points;
};

class AStarSearch : public Search {
public:
    explicit AStarSearch(ifstream &ifs, const Point &maze_entry, const Point &maze_target);

    void maze_search() override;

private:
    void extend_frontier(shared_ptr<Node> node);

    double get_evaluation(int x, int y, double cost);

    priority_queue<shared_ptr<Node>, vector<shared_ptr<Node>>, ContNodePtrCmp> queue;
};

#endif //MAZE_MAZE_H
Search::Search(ifstream &ifs, const Point &maze_entry, const Point &maze_target) : maze(ifs), entry(maze_entry),
                                                                                   target(maze_target), num_nodes(0) {}

string Search::construct_path() {
    string path;
    for (auto p = final; p->parent != nullptr; p = p->parent) {
        auto parent = p->parent;
        int delta_x = p->x - parent->x;
        int delta_y = p->y - parent->y;
        if (delta_x == 0 and delta_y == 1) path.push_back('R');
        else if (delta_x == 0 and delta_y == -1) path.push_back('L');
        else if (delta_x == 1 and delta_y == 0) path.push_back('D');
        else path.push_back('U');
    }
    reverse(path.begin(), path.end());
    return path;
}

void Search::search() {
    chrono::high_resolution_clock::time_point t1 = chrono::high_resolution_clock::now();
    maze_search();
    chrono::high_resolution_clock::time_point t2 = chrono::high_resolution_clock::now();
    search_duration = chrono::duration_cast<chrono::microseconds>(t2 - t1);
}
Maze::Maze(ifstream &ifs) : rows(MAZE_ROWS), cols(MAZE_COLS) {
    int status;
    for (int i = 0; i < rows; ++i)
        for (int j = 0; j < cols; ++j) {
            ifs >> status;
            if (status) obstacles.insert(make_pair(i, j));
        }
}

bool Maze::is_valid_coordinate(int x, int y) {
    if ((x < 0) or (x >= rows) or (y < 0) or (y >= cols)) return false;
    Point coord = make_pair(x, y);
    return obstacles.find(coord) == obstacles.end();
}
AStarSearch::AStarSearch(ifstream &ifs, const Point &maze_entry, const Point &maze_target) : Search(ifs, maze_entry,
                                                                                                    maze_target) {}

void AStarSearch::maze_search() {
    auto p = make_shared<Node>(nullptr, entry.first, entry.second, get_evaluation(entry.first, entry.second, 0.), 0.);
    queue.push(p);
    while (not queue.empty()) {
        auto p = queue.top();
        queue.pop();
        if (visited_points.find(make_pair(p->x, p->y)) != visited_points.end()) continue;
        num_nodes += 1;
        if (p->x == target.first && p->y == target.second) {
            final = p;
            visited.push_back(p);
            visited_points.insert(make_pair(p->x, p->y));
            break;
        }
        extend_frontier(p);
        visited.push_back(p);
        visited_points.insert(make_pair(p->x, p->y));
    }
}

void AStarSearch::extend_frontier(shared_ptr<Node> node) {
    // right, left, down, up
    const int delta_xs[] = {0, 0, 1, -1};
    const int delta_ys[] = {1, -1, 0, 0};
    for (int i = 0; i < 4; ++i) {
        auto dx = delta_xs[i];
        auto dy = delta_ys[i];
        int new_x = node->x + dx;
        int new_y = node->y + dy;
        if (not maze.is_valid_coordinate(new_x, new_y)) continue;
        if (visited_points.find(make_pair(new_x, new_y)) != visited_points.end()) continue;
        auto new_cost = node->cont_cost + 1.;
        auto new_value = get_evaluation(new_x, new_y, new_cost);
        auto new_node = make_shared<Node>(node, new_x, new_y, new_value, new_cost);
        queue.emplace(make_shared<Node>(node, new_x, new_y, new_value, new_cost));
    }
}

double AStarSearch::get_evaluation(int x, int y, double cost) {
    if (ASTAR_METHOD == "L2")
        return cost + sqrt(((x - target.first) * (x - target.first)) + ((y - target.second) * (y - target.second)));
    else
        return cost + fabs(x - target.first) + fabs(y - target.second);
}
int main(int argc, char **argv) {
    ifstream input_maze("input.txt");
    Point entry = make_pair(1, 0);
    Point target = make_pair(16, 24);
    AStarSearch maze_search(input_maze, entry, target);
    maze_search.search();
    auto result = maze_search.construct_path();
    ofstream ofs("output_A.txt");
    ofs << static_cast<double>(maze_search.search_duration.count()) * 1.e-6 << endl;
    ofs << result << endl;
    ofs << result.size() << endl;
    cout << "#search steps: " << maze_search.num_nodes << endl;
}
