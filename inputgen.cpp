#include <iostream>
#include <random>
using namespace std;
int rand50()
{
    return (rand() & 1);
}
bool rand75()
{
    return !(rand50() | rand50());
}
int main() {
    int rows, columns;
    std::cout << "Enter the number of rows: ";
    std::cin >> rows;
    std::cout << "Enter the number of columns: ";
    std::cin >> columns;
    std::cout << "Binary Matrix" << std::endl;
    for (int i = 0; i < rows; ++i) {
        for (int j = 0; j < columns; ++j) {
            cout << rand75()<<" ";
        }
        std::cout << std::endl;
    }
}
