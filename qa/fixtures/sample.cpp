/// Generic queue for C++ highlighting.
#include <concepts>
#include <iostream>
#include <string_view>
#include <vector>
#define CINDER_LOG(value) std::cout << value << '\n'

namespace cinder {
enum class Status { Ready, Full };

template <typename T>
requires std::integral<T>
class Queue {
    std::vector<T> items_;
public:
    static constexpr std::size_t limit = 32;
    [[nodiscard]] bool push(const T& value) {
        // TODO: persist the queue.
        if (items_.size() >= limit) return false;
        items_.push_back(value);
        return true;
    }
};
}

int main() {
    cinder::Queue<int> queue;
    auto scale = [](int value) -> int { return value * 2; };
    const std::string_view label = R"(Cinder queue)";
    CINDER_LOG(label);
    return queue.push(scale(21)) ? 0 : 1;
}
