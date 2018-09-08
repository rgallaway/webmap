import json
import heapq

# Priority queue taken from GT CS3600 project 1
class PriorityQueue:
    """
      Implements a priority queue data structure. Each inserted item
      has a priority associated with it and the client is usually interested
      in quick retrieval of the lowest-priority item in the queue. This
      data structure allows O(1) access to the lowest-priority item.

      Note that this PriorityQueue does not allow you to change the priority
      of an item.  However, you may insert the same item multiple times with
      different priorities.
    """
    def  __init__(self):
        self.heap = []
        self.count = 0

    def push(self, item, priority):

        entry = (priority, self.count, item)
        # entry = (priority, item)
        heapq.heappush(self.heap, entry)
        self.count += 1

    def pop(self):
        (_, _, item) = heapq.heappop(self.heap)
        #  (_, item) = heapq.heappop(self.heap)
        return item

    def isEmpty(self):
        return len(self.heap) == 0

def search(start, finish):
    jsonFile = open('data.json')
    jsonString = jsonFile.read()
    jsonList = json.loads(jsonString)
    jsonDict = {}

    for i in jsonList:
        jsonDict[i[0]] = i[1]


    visited = []
    visit = PriorityQueue()
    path = [start]
    node = start
    visit.push((node, path, 0), 0)
    while (node != finish) and (not visit.isEmpty()):
        node, path, costSoFar = visit.pop()

        if node == finish:
            return path
        if node not in visited and node in jsonDict.keys():
            visited.append(node)
            for successor, stepCost in jsonDict[node]:
                if not visited.__contains__(successor):
                    newPath = path[:]
                    newPath.append(successor)
                    visit.push((successor, newPath, costSoFar + stepCost[0]), costSoFar + stepCost[0])
    if node == finish:
        return path
    else:
        return None




if __name__ == "__main__":
    print search("http://hytechracing.gatech.edu", "/images/adopt-a-cell/Batteries_Rendering.jpg")

