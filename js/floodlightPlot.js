var w = 1200,
    h = 900;

var projection = d3.geo.azimuthal()
    .mode("equidistant")
    // .origin([-98, 38])
	.origin([-98, 40])
    .scale(1200)
    .translate([440, 260]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").insert("svg:svg", "h2")
    .attr("width", w)
    .attr("height", h);

var states = svg.append("svg:g")
    .attr("id", "states");

var circles = svg.append("svg:g")
    .attr("id", "circles");

var cells = svg.append("svg:g")
    .attr("id", "cells");

var circuits = svg.append("svg:g")
    .attr("id", "circuits");

d3.select("input[type=checkbox]").on("change", function() {
  cells.classed("voronoi", this.checked);
});

d3.json("us-states.json", function(collection) {
  states.selectAll("path")
      .data(collection.features)
    .enter().append("svg:path")
      .attr("d", path);
});

var polygons;
var linksByOrigin    = {},
    countByDevice    = {},
	deviceByDPID     = {},
	DPIDByDevice     = {},
	locationByDevice = {},
	circuitLinksById = {},
    positions        = [];

var arc = d3.geo.greatArc()
    .source(function(d) { 
	  switch (d.type) {
	  case 'LINK':
		  return locationByDevice[d.source];
		  break;
	  case 'CIRCUIT':
		  return [locationByDevice[d.source][0],locationByDevice[d.source][1]+.1];
		  break
	  }

  })
    .target(function(d) { 
	  switch (d.type) {
	  case 'LINK':
		  return locationByDevice[d.target];
		  break;
	  case 'CIRCUIT':
		  return [locationByDevice[d.target][0],locationByDevice[d.target][1]+.1];
		  break
	  }
  });

function parseFloodlightTopology() {
	d3.json("data/floodlighttopo.json", function(topology) {

		topology.forEach(function(topologyLink) {
			var origin      = cleanDPID(topologyLink["src-switch"]),
				destination = cleanDPID(topologyLink["dst-switch"]),
				links = linksByOrigin[origin] || (linksByOrigin[origin] = []);

			links.push({
				type: 'LINK',
				source: origin,
				target: destination
			});
			//alert('pushing '+origin+' to '+destination)
			countByDevice[origin] = (countByDevice[origin] || 0) + 1;
			countByDevice[destination] = (countByDevice[destination] || 0) + 1;
		});
	});
}

function drawFloodlightTopology() {
	d3.csv("data/floodlightLocationMap.csv", function(netDevices) {

      // Only consider netDevices with at least one link.
      netDevices = netDevices.filter(function(netDevice) {
      	if (countByDevice[netDevice.dpid]) {
      		var location = [+netDevice.longitude, + netDevice.latitude];
      		locationByDevice[netDevice.dpid] = location;
      		positions.push(projection(location));
      		return true;
      	}
      });
	
      // Compute the Voronoi diagram of netDevices' projected positions.
      polygons = d3.geom.voronoi(positions);
	
      var g = cells.selectAll("g")
          .data(netDevices)
        .enter().append("svg:g");

      g.append("svg:path")
          .attr("class", "cell")
          .attr("d", function(d, i) { return "M" + polygons[i].join("L") + "Z"; })
          .on("mouseover", function(d, i) { d3.select("h2 span").text(d.name); });

      g.selectAll("path.arc")
          .data(function(d) { return linksByOrigin[d.dpid] || []; })
        .enter().append("svg:path")
          .attr("class", "arc")
          .attr("d", function(d) { return path(arc(d)); });

      circles.selectAll("circle")
          .data(netDevices)
        .enter().append("svg:circle")
          .attr("cx", function(d, i) { return positions[i][0]; })
          .attr("cy", function(d, i) { return positions[i][1]; })
          .attr("r", function(d, i) { return countByDevice[d.dpid]*2; })
  		  .style("fill", function(d,i) {
  			if (netDevices[i].type == 1) {
  				return "red";
  			}
  			return "blue";
		  })
          .sort(function(a, b) { return countByDevice[b.dpid] - countByDevice[a.dpid]; });
    });
}

function drawFloodlightCircuits() {
	d3.text("data/circuits.json", function(txt) {
		var circuitLinks = jsonObjectListToArray(txt),
			circuitIDs   = {},
			previousHop  = '',
			previousID   = 0;


		circuitLinks.forEach(function(circuitLink) {
			var id    = circuitLink.name,
				links = circuitLinksById[id] || (circuitLinksById[id] = []);
				hop   = circuitLink.Dpid;

			// Set ID
			circuitLink.id = id;

			// This assumes that all circuit links are sequential in the input file
			// i.e. no link from a circuit's set of links is mixed with other circuit's 
			// set of links in json
			if (previousID != id) {
				previousID  = id;
				previousHop = '';
			}

			if (previousHop != '') {
				links.push({
					id: id,
					type: 'CIRCUIT',
					source: cleanDPID(previousHop),
					target: cleanDPID(hop),
					color: circuitLink.color || ('#'+colorFromString(id))
				});
			}
			previousHop = hop
		});

		var g = circuits.selectAll("g")
			.data(circuitLinks)
			.enter()
			.append("svg:g");
		
		g.selectAll("path.arc")
			.data(function(d) { return circuitLinksById[d.id] || []; })
			.enter()
			.append("svg:path")
			.attr("class", "circuit")
			.style("stroke", function(d) { return d.color; })
			.attr("d", function(d) { return path(arc(d)); });
	});
}
parseFloodlightTopology();
drawFloodlightTopology();
drawFloodlightCircuits();

