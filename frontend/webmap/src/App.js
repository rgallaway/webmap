import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';

import { ForceGraph2D  } from 'react-force-graph';
import 'whatwg-fetch';
 
export class Landing extends React.Component {
  render() {
    return (
    <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '50vh'}}>
      <h1>Welcome to WebMap</h1><br />
      <input type="text" />
    </div>);
  }
}

export class Graph extends React.Component {

  constructor(props) {
    super(props);

    const textSize = 6;
    const customNodeCanvas = ({ id, x, y }, ctx) => {
      const r = 3;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI, false);
      ctx.fillStyle = '#ee7125';
      ctx.fill();
      ctx.fillStyle = "#EEEEEE"
      ctx.font = textSize + 'px Sans-Serif'; 
      ctx.textAlign = 'center'; 
      ctx.textBaseline = 'middle'; 
      ctx.fillText(id, x, y - (r * 3));
    }
    this.state = {
      customNodeCanvas: customNodeCanvas,
      textSize: textSize,
      dataLoaded: false
    };
  }

  componentDidMount() {
    var linksMap = {};
      fetch('http://localhost:5000/map?url=http://hytechracing.gatech.edu/&limit=1', {
        method: 'GET',
        'Content-Type': 'application/json'
      })
      .then(response => response.json())
      .then(response => {
        var processed = this.readInGraph(response, linksMap);
        this.setState({
          graph: processed, 
          dataLoaded: true, 
          linksMap: linksMap,});
      });
  }

  convertLinkToKey(source, target) {
    if (source.id != null) {
      return "SOURCE:" + source.id + " TARGET:" + target.id;
    }
    return "SOURCE:" + source + " TARGET:" + target;
  }

  getLinkWidth = function(l) {
    return this.state.linksMap[this.convertLinkToKey(l.source, l.target)].width;
  }

  getLinkArrowLength = function(l) {
    return this.getLinkWidth(l) * 2;
  }

  readInGraph(data, linksMap) {
    var nodes = [];
    var links = [];
    var seen = new Set();
    var notSeen = [];
    notSeen.push(data);
    while (notSeen.length != 0) {
      var curr = notSeen.pop();
      if (!seen.has(curr.text)) {
        seen.add(curr.text);
        nodes.push( { 
          id: curr.text, 
          name: curr.text, 
          color: "#ee7125" } );
        var edges = curr.edges;
        for (var i = 0; i < edges.length; i++) {
          var e = edges[i];
          notSeen.push(e.endpoint);
          links.push( {
            source: curr.text, 
            target: e.endpoint.text, 
            color: "#000000",
            width: e.weights[0] == null ? 1 : e.weights[0].value,
            directionalParticles: 1
          } )
        }
      }
    }
    for (var i = 0; i < links.length; i++) {
      var l = links[i];
      linksMap[this.convertLinkToKey(l.source, l.target)] = l;
    }
    console.log(linksMap);
    return {
      nodes: nodes, links: links
    }
  }

  render() {
    return this.state.dataLoaded === false ? null : (
    <div className="App">
      <ForceGraph2D
        graphData={this.state.graph}
        backgroundColor="#8a8a8a"
        linkDirectionalArrowLength={(l) => this.getLinkArrowLength(l)}
        linkDirectionalArrowRelPos={0.8}
        nodeVal={3}
        nodeCanvasObject={this.state.customNodeCanvas}
        cooldownTicks={0}
        warmupTicks={1000}
        linkDirectionalParticles={0}
        linkWidth={(l) => this.getLinkWidth(l)}
        />
    </div>);
  }
};


export default function showLanding() {
  //ReactDOM.render(<Landing />, document.getElementById('root'));
  showGraph();
}

function showGraph() {
  ReactDOM.render(<Graph />, document.getElementById('root'));
}