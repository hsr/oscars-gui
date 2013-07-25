function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
} 

function intToRGB(i){
    return ((i>>16)&0xFF).toString(16) + 
           ((i>>8)&0xFF).toString(16) + 
           (i&0xFF).toString(16);
}

function colorFromString(s) {
	var rgb = intToRGB(hashCode(s));
	while (rgb.length < 6)
		rgb = '0' + rgb
	return rgb;
}

/**
 * Return the last hex value of a given floodlight's switch id.
 * Input example: '00:...:0e'
 * Output exmpaple: 'e'
 **/
function cleanDPID(s) {
	return parseInt(s.substring(s.lastIndexOf(":")+1),16).toString(16);
}

/*
 * This function takes an json object list given as a text string and returns
 * it as a json array. The following string is an example of what this function 
 * expects as input:
 *
 * var s = '{"a":2}\n{"a":3}'
 *
 */
function jsonObjectListToArray(txt) {
	txt = txt.replace(/\n/g,',');
	return JSON.parse('['+ txt.substring(0, txt.lastIndexOf(',')) +']');
}