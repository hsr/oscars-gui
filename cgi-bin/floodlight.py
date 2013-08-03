#!/usr/bin/python

import sys
import os

err = ''

def get_topology(host, port):
    command = "curl -s http://%s:%s/wm/topology/links/json" % (host,port)
    try:
        return os.popen(command).read()
    except Exception, e:
        sys.stderr.write('No response from controller. %s\n' % e.message)
        return ''
    
    
def update_topology(host):
    global err;
    
    host,port = (host,8080)
    if len(host.split(':')) > 1:
        host,port = host.split(':')
    
    floodlightTopology = get_topology(host, port)
    if not len(floodlightTopology):
        sys.stderr.write('Could not get topology\n')
        err += 'Could not get topology. Are you sure your controller is running?\n'
        raise IOException

    try:
        topology_file = open('data/topology.json', 'w');
    except Exception, e:
        sys.stderr.write('Could not open topology output file\n');
        err += 'Could not open topology output file.\n'
        err += 'Do you have write permission to /data/topology.json?\n'
        raise IOException
    
    topology_file.write(floodlightTopology)
    
    topology_file.close()

    #print circuitsById

#curl http://192.168.56.99:8080/wm/topology/links/json 
#curl http://ud64:8080/wm/topology/links/json f

