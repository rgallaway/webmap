import constants
from flask import Flask
from flask import request
from flask import send_file
from flask import Response
from scrapytest import Runner
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
    depth = request.args.get('depth', default=50, type=int)
    # Pass URL and depth to Ryan's scraper engine
    return subprocess.check_output(['scrapy', 'runspider', '-a', 'url=' + url, 'scrapytest.py'])

@app.route('/')
def index():
    # This will host Sam's React frontend page
    return send_file('static/index.html')

if __name__ == '__main__':
    app.run()