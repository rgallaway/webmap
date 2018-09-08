class Node:
    def __init__(self, text, edges):
        self.text = text
        self.edges = edges


class Edge:
    def __init__(self, weights, node):
        self.weights = weights
        self.node = node


class Weight:
    def __init__(self, type, value):
        self.type = type
        self.value = value


w1 = Weight("link_size", 45)
w2 = Weight("link_depth", 10)
wa = {w1, w2}
n1 = Node("Home", [])
n2 = Node("Login", [])
n1.edges.append(Edge(wa, n2))
i = 0
