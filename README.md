# Graphical user interface for OSCARS using D3

In the summer of 2013, I worked with the integration of [OSCARS](http://www.es.net/services/virtual-circuits-oscars/ OSCARS) and [Floodlight](http://www.projectfloodlight.org/floodlight/). In the SDN context, OSCARS is an application that controls the [es.net](http://es.net/) 100G network and Floodlight is a SDN controller that communicates with network devices using [OpenFlow](http://www.openflow.org/). Oscars-gui was created to visualize OSCARS circuits on top of the topology exported by Floodlight. The code is simple and uses python cgi to interact with OSCARS and Floodlight. The [D3](http://d3js.org/ "D3 js") library is used to draw network devices, links, and circuits. The code is based on the [US airport map D3 example](http://mbostock.github.io/d3/talk/20111116/airports.html).


## Usage

You need to have OSCARS and Floodlight running to use the gui. By default, the scripts under /cgi-bin try to fetch the Floodlight topology from [http://localhost:8080/wm/topology/links/json](http://localhost:8080/wm/topology/links/json) and OSCARS active circuits from OSCARS's mysql database named "rm" at localhost:3306 with username 'reader' and password 'reader'. You can change these default settings in (cgi-bin/floodlight.py and cgi-bin/oscars.py) to match your deployment. Alternatively, you can specify the hosts where Floodlight and OSCARS are installed in the query string of your request (using the arguments *controller* and *oscars* respectively).

Once you are done deploying OSCARS and Floodlight,  run the application using the python cgi server:

    # git clone https://github.com/hsr/oscars-gui
    # cd oscars-gui
    # python -m CGIHTTPServer <PORT>
    
Now you should be able to point your browser to http://<HOST>:<PORT> and access the index page that has two links to the gui.py application with different query strings. Here is a list with arguments that the __/cgi-bin/gui.py__ application interprets:

    http://<HOST>:<PORT>/cgi-bin/gui.py/
      ?controller=<host>:[port]   # Floodlight host:port
      ?oscars=<host>:[port]       # OSCARS mysql host:port
      ?plot=<plotScript>          # Plot script under /js

## Creating new plots

To create a new plot, you need to create a latitute/longitude map file and a javascript script that points to it. You can use the files [js/infinerademoPlot.js](https://github.com/hsr/oscars-gui/blob/master/js/infinerademoPlot.js) and [data/infinerademoPlotLocationMap.csv](https://github.com/hsr/oscars-gui/blob/master/js/infinerademoLocationMap.csv) as starting points. The csv file is indexed by the last two hex digits of switches' datapath id (dpid column). Just specify your switches, their type (1=L1/2=L2), latitude and longitude.

## Troubleshooting

You might have to give write permission to the files under /data/ updated by the gui.py script:

    chmod o+w data/circuits.json data/topology.json
    



