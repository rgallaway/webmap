import constants
from flask import Flask
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

if __name__ == '__main__':
    app.run()