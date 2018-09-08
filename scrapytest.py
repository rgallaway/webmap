import scrapy
import Queue
import sys

from scrapy.crawler import CrawlerProcess

class Response():
    def __init__(self, name, children, edge):
        self.name = name
        self.children = children.toList()

class Edge():
    def __init__(self, type, width):
        self.type = type
        self.width = width

class Runner():
    def __init__(self, startUrl, nodeLimit):
        self.startUrl = startUrl
        self.nodeLimit = nodeLimit

    def run(self):
        process = CrawlerProcess({
            'USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36'
        })

        spiderboi = LinksSpider()
        spiderboi.setStart(self.startUrl)
        process.crawl(spiderboi)
        process.start()
        return spiderboi.children


class LinksSpider(scrapy.Spider):
    name = 'links'

    def __init__(self, url=None, *args, **kwargs):
        super(LinksSpider, self).__init__(*args, **kwargs)
        self.start_urls = [url]

        self.seen = Queue.Queue()  # all nodes we have seen
        self.expanded = set()  # set of expanded nodes
        self.children = {}  # dictionary of parents to set of children

        self.seen.put(self.start_urls[0])

    def parse(self, response):
        parent = response.url
        self.expanded.add(parent)

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
                #links.add(link)
            if link[:1] == '/' and link[:2] != "//":
                links.add(link)

        if '/' in links:
            links.remove('/')

        self.children[parent] = links
        for link in links:
            self.seen.put(link)

        nextLink = None
        while nextLink is None and not self.seen.empty():
            next = self.seen.get()
            if next not in self.expanded:
                nextLink = next

        if nextLink is not None:
            yield response.follow(nextLink, callback = self.parse)


    def closed(self, reason):
        print self.children

    def cleanString(self, string):
        string = string.replace('https://', '')
        string = string.replace('http://', '')
        string = string.replace('//www.', '')
        string = string.replace('www.', '')
        return string

    def setStart(self, string):
        self.start_urls[0] = string


if __name__ == '__main__':
    a = Runner('https://www.homedepot.com/', None)
    print a.run()


