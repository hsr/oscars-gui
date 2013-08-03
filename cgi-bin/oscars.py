#!/usr/bin/python

import sys
import MySQLdb as my

err = ''

URN_DOMAIN = 0
URN_NODE   = 1
URN_PORT   = 2
URN_LINK   = 3

# SELECT_CIRCUITS_SQL = "SELECT id,globalReservationId FROM reservations WHERE status = 'ACTIVE'"
# SELECT_CIRCUITPATH_SQL = "SELECT urn FROM pathElems WHERE pathId = '%d' ORDER BY seqNumber";

# SELECT_ACTIVE_CIRCUITS_SQL = \
# """SELECT reservations.id,seqNumber,urn FROM pathElems
#     JOIN reservations ON pathElems.pathId = reservations.id
#     WHERE reservations.status = 'ACTIVE'
#     ORDER BY pathId,seqNumber"""
    
SELECT_ACTIVE_CIRCUITS_SQL = \
"""SELECT r.id,p.seqNumber,urn FROM reservations AS r
    JOIN stdConstraints AS s ON s.reservationId = r.id
    JOIN pathElems as p ON p.pathId = s.pathId 
    WHERE r.status ='ACTIVE' and s.constraintType = 'reserved'
    ORDER BY p.pathId,seqNumber"""

def get_mysql_conn(host="infinerademo.es.net", port=3306, 
                   user="reader", passwd="reader", db="rm"):
    try:
        return my.connect(host=host, port=port, user=user, 
                          passwd=passwd, db=db)
    except Exception, e:
        sys.stderr.write('Could not connect to database: %s\n' % e.message)
    return None;

def get_active_circuits(host, port):
    conn = get_mysql_conn(host=host, port=port);
    if not conn:
        return None;
    
    cursor = conn.cursor()
    # for circuit in cursor.fetchall(SELECT_CIRCUIT_SQL):
    #     path = cursor.fetchall(SELECT_CIRCUIT_SQL)
    circuit_id   = None
    nodes        = []
    circuitsById = {}
    
    cursor.execute(SELECT_ACTIVE_CIRCUITS_SQL)
    for hop in cursor.fetchall():
        id,seq,urn = (hop[0],hop[1],urn_split(hop[2]))

        urn[URN_NODE] = urn[URN_NODE].replace('.', ':')
                    
        if circuit_id != id:
            if circuit_id:
                if not circuitsById.has_key(circuit_id):
                    circuitsById[circuit_id] = nodes
                #print '%s:' % circuit_id, nodes
            circuit_id = id
            nodes      = []
        
        if urn[URN_NODE] not in nodes:
            nodes += [urn[URN_NODE]]
        
        #print id,seq,urn

    if not circuitsById.has_key(circuit_id):
        circuitsById[circuit_id] = nodes

    if len(circuitsById.values()):
        return circuitsById
    return None

def urn_split(urn):
    return [value.split('=')[1] for value in urn.split(':')[3:]]
    
def update_active_circuits(host='localhost:3306'):
    host,port = (host,3306)
    if len(host.split(':')) > 1:
        host,port = host.split(':')
    
    circuitsById = get_active_circuits(host,port);
    if not circuitsById:
        sys.stderr.write('No circuits\n');
        return

    try:
        circuits_file = open('data/circuits.json', 'w');
    except Exception, e:
        sys.stderr.write('Could not open circuits output file\n');
        err += 'Could not open circuits output file.\n'
        err += 'Do you have write permission to data/circuits.json?\n'
        return;
    

    for id,hops in circuitsById.items():
        for hop in hops:
            circuits_file.write('{"name": "%s", "Dpid": "%s"}\n' % (id, hop));
    
    circuits_file.close()

    #print circuitsById

#curl http://192.168.56.99:8080/wm/topology/links/json 
#curl http://ud64:8080/wm/topology/links/json f

