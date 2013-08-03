#!/usr/bin/env python

import os
import sys
import webapp
import oscars
import floodlight

request = webapp.parseURL('http://trash/gui.py?%s' % os.environ['QUERY_STRING'])
query   = request['query_dict']

# Floodlight controller url/ip address and port
controller = 'localhost:8080'
if query.has_key('controller'):
    controller = query['controller']

# OSCARS mysql db address
oscarsdb = 'localhost'
if query.has_key('oscars'):
    oscarsdb = query['oscars']


try:
    floodlight.update_topology(controller)
    #oscars.update_active_circuits(oscarsdb)

    index_file = open('gui.html', 'r')
    index_contents = index_file.read()
    index_file.close()

    print webapp.httpHeader(200);

    if query.has_key('plot') and query['plot'] == 'infinerademo':
        index_contents = index_contents.replace('floodlightPlot', 'infinerademoPlot')
    print index_contents

except Exception, e:
    print webapp.httpHeader(500)
    print '500: Internal server error\n\n'
    print floodlight.err
    print oscars.err
    sys.exit(0)


#curl http://192.168.56.99:8080/wm/topology/links/json 
#curl http://ud64:8080/wm/topology/links/json f

