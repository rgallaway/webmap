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
  constructor(props) {
    super(props);
    this.state = {url: "https://homedepot.com/", 
      limit: 1000,
      target: "",
      handler: props.updateHandler,
      filter: "none",
      ref: props.reference,
      loadingMessage: ""};
  }

  handle() {
    var self = this;
    this.setState({loadingMessage: "Please wait while we prepare your graph..."})
    this.state.handler.call(this.state.ref, this.state.url, 
      this.state.limit, this.state.target, this.state.filter, function() {
        console.log("Callback");
        self.setState({loadingMessage: ""});
      });       
  }

  setUrlChange(e) {
    this.setState({url: e.target.value});
  }

  setLimitChange(e) {
    this.setState({limit: e.target.value});
  }

  setTargetChange(e) {
    this.setState({target: e.target.value});
  }

  setFilterChange(e) {
    this.setState({filter: e.target.value});
  }

  setExternalChange(e) {
    this.setState({external: e.target.checked});
  }

  render() {
    return (
      <div style={{backgroundColor: "#4a4a4a", padding: '10px'}}>
        <h3 style={{color: '#EEEEEE'}}>{"Enter a valid url to get started"}</h3>
        <div><input type="text" value={this.state.url} style={{width: "150px"}} 
                    onChange={this.setUrlChange.bind(this)}/>
          <label style={{color: '#DDDDDD', padding: '5px'}}>{"url"}</label></div>
        <div style={{display: 'flex', justifyContent: 'center', padding: '10px'}}></div>
        <div><input type="number" value={this.state.limit} style={{width: "150px"}} 
                    onChange={this.setLimitChange.bind(this)}/>
          <label style={{color: '#DDDDDD', padding: '5px'}}>{"# of edges"}</label></div>
        <div style={{display: 'flex', justifyContent: 'center', padding: '10px'}}></div>

        <div><input type="text" value={this.state.target} style={{width: "150px"}} 
                    onChange={this.setTargetChange.bind(this)}/>
          <label style={{color: '#DDDDDD', padding: '5px'}}>{"target url"}</label></div>
        <div style={{display: 'flex', justifyContent: 'center', padding: '10px'}}></div>
        <div><input type="checkbox" value={this.state.target} style={{width: "15px"}} 
                    onChange={this.setExternalChange.bind(this)}/>
          <label style={{color: '#DDDDDD', padding: '5px'}}>{"allow external links"}</label></div>
        <h3 style={{color: '#EEEEEE'}}>{"Now select your desired edge weights"}</h3>
        <form>
            <input type="radio" name="filter" value="none" checked={this.state.filter=='none'}
                    onChange={this.setFilterChange.bind(this)} />
            <label style={{color: '#DDDDDD', padding: '5px'}}>None (Uniform)</label><br />
            <input type="radio" name="filter" value="access" checked={this.state.filter=='access'}
                    onChange={this.setFilterChange.bind(this)} />
            <label style={{color: '#DDDDDD', padding: '5px'}}> User Access Rate</label><br />
          </form>
          <div style={{display: 'flex', justifyContent: 'center', padding: '10px'}}></div>
        <button onClick={this.handle.bind(this)}>Update</button>
        <div style={{display: 'flex', justifyContent: 'center', padding: '30px'}}></div>
        <h4 style={{color: '#AAAA00'}}>{this.state.loadingMessage}</h4>
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
      ctx.fillStyle = this.state.nodesMap[id].color;
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

  changeUrl = function(url, limit, target, filter, callback) {
    var linksMap = {};
    var nodesMap = {};
    var f = filter == 'none' ? '0' : '1';
    fetch('http://localhost:5000/map?url=' + url + '&limit=' + limit + '&rand=' + f, {
      method: 'GET',
      'Content-Type': 'application/json'
    })
    .then(response => response.json())
    .then(response => {
      if (target != null && target != '') {
        fetch('http://localhost:5000/search?source=' + url + '&dest=' + target, {
          method: 'GET',
          'Content-Type': 'application/json'
        })
        .then(sresponse => sresponse.json())
        .then(sresponse => {
          var processed = this.readInGraph(response, linksMap, nodesMap, sresponse);
          this.setState({
            graph: processed, 
            dataLoaded: true, 
            linksMap: linksMap,
            nodesMap: nodesMap});
            if (callback != null) {
              callback();
            }
        });
      } else {
        var processed = this.readInGraph(response, linksMap, nodesMap, null);
        this.setState({
          graph: processed, 
          dataLoaded: true, 
          linksMap: linksMap,
          nodesMap: nodesMap});
          if (callback != null) {
            callback();
          }
      }
    });
  }

  componentDidMount() {
    this.changeUrl('https://homedepot.com/', 1000, null, "none");
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
    return this.getLinkWidth(l) * 4;
  }

  readInGraph(data, linksMap, nodesMap, searchNodes) {
    var seenNodes = new Set();
    var nodes = [];
    var links = [];
    var notSeen = data;
    var first = true;
    while (notSeen.length != 0) {
      var curr = notSeen.pop();
      var text = curr[0];
      if (!seenNodes.has(text)) {
        var color = first ? '#00FF00' : "#ee7125";
        if (searchNodes != null && searchNodes.indexOf(text) >= 0) {
          var i = searchNodes.indexOf(text);
          if (i == 0) {
            color = '#00FF00';
          } else if (i == searchNodes.length - 1) {
            color = '#FF0000';
          } else {
            color = '#0000FF';
          }
        }
        nodes.push( { 
          id: text, 
          name: text, 
          value: 10,
          color: color} 
        );
        first = false;
        seenNodes.add(text);
      }
      var edges = curr[1];
      for (var i = 0; i < edges.length; i++) {
        var e = edges[i];
        if (!seenNodes.has(e[0])) {
          var color = "#ee7125";
          if (searchNodes != null && searchNodes.indexOf(e[0]) >= 0) {
            var i = searchNodes.indexOf(e[0]);
            if (i == 0) {
              color = '#00FF00';
            } else if (i == searchNodes.length - 1) {
              color = '#FF0000';
            } else {
              color = '#FFFF00';
            }
          }
          nodes.push( { 
            id: e[0], 
            value: 10,
            name: e[0], 
            color: color } 
          );
          seenNodes.add(e[0]);
        }
        var linkColor = '#000000';
        if (searchNodes != null && searchNodes.indexOf(e[0]) >= 0 && searchNodes.indexOf(text) >= 0) {
          linkColor = "#00FFFF"
        }
        links.push( {
          source: text, 
          target: e[0], 
          color: linkColor,
          width: e[1][0] == null ? 1 : e[1][0]
        } )
      }
    }
    for (var i = 0; i < links.length; i++) {
      var l = links[i];
      linksMap[this.convertLinkToKey(l.source, l.target)] = l;
    }
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      nodesMap[n.id] = n;
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
        <ConfigPanel 
          updateHandler={this.changeUrl}
          reference={this}/>
        <ForceGraph2D
          width={1000}
          graphData={this.state.graph}
          backgroundColor="#8a8a8a"
          linkDirectionalArrowLength={(l) => this.getLinkArrowLength(l)}
          linkDirectionalArrowRelPos={0.8}
          nodeCanvasObject={this.state.customNodeCanvas}
          cooldownTicks={0}
          warmupTicks={150}
          linkDirectionalParticles={0}
          linkWidth={(l) => this.getLinkWidth(l)}
          />
      </div>);
    </div>);
  }
};

export default function showGraph() {
  ReactDOM.render(<Graph />, document.getElementById('root'));
}
