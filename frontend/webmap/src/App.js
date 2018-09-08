import React from 'react';
import ReactDOM from 'react-dom';
import './App.css';

import { ForceGraph2D  } from 'react-force-graph';
import 'whatwg-fetch';

import header_bg from './images/header_bg.jpg';

export class Header extends React.Component {
  render() {
    return (
      <div style={{
        display: 'flex', 
        justifyContent: 'center',
        backgroundImage: `url(${header_bg})`
      }}><h1 style={{color: '#EEEEEE'}}>{"Welcome to WebMap"}</h1></div>
    )}
}

export class ConfigPanel extends React.Component {
  render() {
    return (
      <div style={{backgroundColor: "#4a4a4a"}}>
        <h1>Config Panel Goes Here</h1>
      </div>
    )
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
      // ctx.fillStyle = "#EEEEEE"
      // ctx.font = textSize + 'px Sans-Serif'; 
      // ctx.textAlign = 'center'; 
      // ctx.textBaseline = 'middle';
      // var str = id;
      // if (str.length > 8) {
      //   str = "..." + id.substring(str.length - 8, str.length);
      // }
      // ctx.fillText(str, x, y - (r * 3));
    }
    this.state = {
      customNodeCanvas: customNodeCanvas,
      textSize: textSize,
      dataLoaded: false
    };
  }

  componentDidMount() {
    var linksMap = {};
      fetch('http://localhost:5000/map?url=https://homedepot.com/&limit=100', {
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
      if (target.id != null) {
        return "SOURCE:" + source.id + " TARGET:" + target.id;
      }
      return "SOURCE:" + source.id + " TARGET:" + target;
    }
    if (target.id != null) {
      return "SOURCE:" + source + " TARGET:" + target.id;
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
    var seenNodes = new Set();
    var nodes = [];
    var links = [];
    var notSeen = data;
    while (notSeen.length != 0) {
      var curr = notSeen.pop();
      var text = curr[0];
      if (!seenNodes.has(text)) {
        nodes.push( { 
          id: text, 
          name: text, 
          value: 10,
          color: "#ee7125" } 
        );
        seenNodes.add(text);
      }
      var edges = curr[1];
      for (var i = 0; i < edges.length; i++) {
        var e = edges[i];
        if (!seenNodes.has(e[0])) {
          nodes.push( { 
            id: e[0], 
            value: 10,
            name: e[0], 
            color: "#ee7125" } 
          );
          seenNodes.add(e[0]);
        }
        links.push( {
          source: text, 
          target: e[0], 
          color: "#000000",
          width: e[1][0] == null ? 1 : e[1][0]
        } )
      }
    }
    for (var i = 0; i < links.length; i++) {
      var l = links[i];
      linksMap[this.convertLinkToKey(l.source, l.target)] = l;
    }
    return {
      nodes: nodes, links: links
    }
  }

  render() {
    return this.state.dataLoaded === false ? null : (
    <div className="App">
      <Header />
      <div style={{display:"flex", flexDirection: "row"}}> 
        <ConfigPanel />
        <ForceGraph2D
          width={1000}
          graphData={this.state.graph}
          backgroundColor="#8a8a8a"
          linkDirectionalArrowLength={(l) => this.getLinkArrowLength(l)}
          linkDirectionalArrowRelPos={0.8}
          nodeVal={3}
          nodeCanvasObject={this.state.customNodeCanvas}
          cooldownTicks={0}
          warmupTicks={100}
          linkDirectionalParticles={0}
          linkWidth={(l) => this.getLinkWidth(l)}
          />
        </div>
    </div>);
  }
};

export default function showGraph() {
  ReactDOM.render(<Graph />, document.getElementById('root'));
}
