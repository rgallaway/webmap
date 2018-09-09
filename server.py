import constants
from flask import Flask
from flask import request
from flask import send_file
from flask import Response
from search import search
import json
import subprocess
app = Flask(__name__)
app.debug = False

@app.route('/test')
def test_endpoint():
    resp = Response(json.dumps(constants.example))
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.mimetype = 'application/json'
    return resp

@app.route('/map')
def do_map():
    url = request.args.get('url', type=str)
    depth = request.args.get('limit', default='100', type=str)
    rand = request.args.get('rand', default='0', type=str)
    resp = Response()
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.mimetype = 'application/json'
    # Pass URL and depth to Ryan's scraper engine
    output = subprocess.check_output(['python', '-m', 'scrapy', 'runspider', '-a', 'start=' + url, '-a', 'edgeLimit=' + depth, '-a', 'rand=' + rand, 'scrapytest.py'])
    with open("data.json", "r") as datafile:
        resp.set_data(datafile.read())
    return resp

@app.route('/search')
def run_search():
    source_url = request.args.get('source', type=str)
    dest_url = request.args.get('dest', type=str)
    resp = Response()
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.mimetype = 'application/json'
    # Pass source & dest URLs to search function
    # Will return JSON of path between nodes
    output = search(source_url, dest_url)
    resp.set_data(json.dumps(output))
    return resp

@app.route('/')
def index():
    # This will host Sam's React frontend page
    return send_file('static/index.html')

if __name__ == '__main__':
    app.run()