import React from 'react';
import './App.css';

import { ForceGraph2D  } from 'react-force-graph';

var example = {
  text: "Home",
  edges: [
    {
      weights: [],
      endpoint: {
        text: "Second",
        edges: [
          {
            weights: [],
            endpoint: {
              text: "Third",
              edges: [
                {
                  weights: [
                    {
                      type: "ALKDJFLSKDJ",
                      value: 5
                    }
                  ],
                  endpoint: {
                    text: "Fourth",
                    edges: []
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      weights: [],
      endpoint: {
        text: "Fourth",
        edges: []
      }
    },
    {
      weights: [],
      endpoint: {
        text: "RIP RYAN LMFAO",
        edges: []
      }
    }
  ]
 }
 
 
 

class App extends React.Component {

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
    var linksMap = {};
    const graph = this.readInGraph(example, linksMap);
    this.state = {
      customNodeCanvas: customNodeCanvas,
      textSize: textSize,
      raw: example,
      graph: graph,
      linksMap: linksMap
    };
  }

  // componentDidMount() {
  //   const graph = this.readInGraph(this.state.raw);
  //   this.setState({graph: graph});
  // }

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
    return (<div className="App">
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

export default App;