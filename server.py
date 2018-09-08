import constants
from flask import Flask
from flask import request
from flask import send_file
import json
app = Flask(__name__)

@app.route('/test')
def test_endpoint():
    response = app.response_class(
        response=json.dumps(constants.example),
        status=200,
        mimetype='application/json'
    )
    return response

@app.route('/map')
def do_map():
    url = request.args.get('url', type=str)
    depth = request.args.get('depth', default=50, type=int)
    # Pass URL and depth to Ryan's scraper engine
    return str.format('Map endpoint: {}, depth: {}', url, depth)

@app.route('/')
def index():
    # This will host Sam's React frontend page
    return send_file('static/index.html')

if __name__ == '__main__':
    app.run()