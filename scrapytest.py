import scrapy
import Queue
import json
import logging
from random import randint

# this is hackathon code; it will not be well documented or put together. please forgive me

class LinksSpider(scrapy.Spider):
    name = 'links'
    start_urls = [
        'https://www.homedepot.com/',
    ]

    def __init__(self, start, edgeLimit, rand, external, *args, **kwargs):
        super(LinksSpider,self).__init__(*args, **kwargs)
        self.start_urls[0] = start

        self.seen = Queue.Queue()  # all nodes we have seen
        self.expanded = []  # set of expanded nodes
        self.children = {}  # dictionary of parents to set of children

        self.current = self.start_urls[0]

        self.seen.put(self.current)
        self.limit = int(edgeLimit)
        self.counter = 0
        self.rand = int(rand)
        self.external = int(external)

    def parse(self, response):
        self.expanded.append(self.current)

        lines = response.css('a::attr("href")')

        links = set()

        start = self.cleanString(self.start_urls[0])
        length = start.__len__()

        for line in lines:
            link = line.extract()
            link = self.cleanString(link)
            if link[:length] == (start):
                link = link.replace(start, '')
                link = '/' + link
                links.add(link)
            if self.external and link[:2] != "//":
                links.add(link)
            elif not self.external and link[:1] == '/' and link[:2] != "//":
                links.add(link)

        if '/' in links:
            links.remove('/')

        self.children[self.current] = links
        for link in links:
            self.seen.put(link)
            self.counter += 1

        nextLink = None
        while nextLink is None and not self.seen.empty():
            next = self.seen.get()
            if next not in self.expanded:
                if self.external and not (next.endswith(".jpg") or next.endswith(".png") or next.endswith("pdf") or next.startswith("http") or next.startswith("javascript")):
                    nextLink = next
                elif not self.external and not (next.endswith(".jpg") or next.endswith(".png") or next.endswith("pdf")):
                    nextLink = next 

        if nextLink is not None and self.counter < self.limit:
            logging.info('URL: ' + str(self.counter) + ' ' + ', limit: ' + str(self.limit))
            self.current = nextLink
            yield response.follow(nextLink, callback = self.parse, dont_filter=True)


    def closed(self, reason):
        self.createStructure()

    built = set()

    def createStructure(self):
        graph = []
        for parent in self.expanded:
            edges = []
            if parent not in self.children.keys():
                entry = (parent, edges)
                graph.append(entry)
            elif not len(self.children[parent]):
                entry = (parent, edges)
                graph.append(entry)
            else:
                for child in self.children[parent]:
                    if self.rand:
                        edge = (child, [randint(1,5)])
                    else:
                        edge = (child, [1])
                    edges.append(edge)
            graph.append((parent, edges))
        graph.reverse()

        with open('data.json', 'w') as outfile:
            json.dump(graph, outfile)


    def cleanString(self, string):
        if not self.external or (self.external and self.start_urls[0] in string[:len(self.start_urls[0])]):
            string = string.replace('https://', '')
            string = string.replace('http://', '')
            string = string.replace('//www.', '')
            string = string.replace('www.', '')
        return string

    def setStart(self, string):
        self.start_urls[0] = string

    def setLimit(self, limit):
        self.limit = limit