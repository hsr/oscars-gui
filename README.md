oscars-gui: Graphical user interface for OSCARS circuits using D3
==========

In the summer of 2013, I worked with the integration of [OSCARS](http://www.es.net/services/virtual-circuits-oscars/ OSCARS) and [Floodlight](http://www.projectfloodlight.org/floodlight/). In the SDN context, OSCARS is an application that controls the [es.net](http://es.net/) 100G network and Floodlight is a SDN controller that communicates with network devices using [OpenFlow](http://www.openflow.org/). oscars-gui was created to visualize OSCARS circuits on top of the topology exported by Floodlight. The code is simple and uses python cgi to interact with OSCARS and Floodlight and the [D3](http://d3js.org/ "D3 js") library to draw network devices, links, and circuits.
