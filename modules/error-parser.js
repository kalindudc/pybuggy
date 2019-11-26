require('dotenv').config();

const Errors = require('../modules/errors');

const ERROR_PREFIX = "builtins."

const ERROR_VALUE = "ValueError";
const ERROR_TYPE = "TypeError";
const ERROR_INDENTATION = "IndentationError";
const ERROR_SYNTAX = "SyntaxError";
const ERROR_INDEX = "IndexError";
const ERROR_ATTRIBUTE = "AttributeError";
const ERROR_ZERO_DIVISION = "ZeroDivisionError";
const ERROR_NAME = "NameError";

function extract_line_number(lines) {
    var line = -1;
    var i;

    for (i = lines.length - 1; i >= 0; i--) {
        
        if (lines[i].includes('line')) {
            var numberPattern = /\d+/g;
            line = lines[i].match(numberPattern)[0];
            break;
        }
    }

    return [i,line];
}


function parseHelper(type, error, content, lines, callback) {

    if (error.includes(ERROR_PREFIX)) {
        error = error.split(".")[1];
    }

    var [index, linenumber] = extract_line_number(lines);
    var formatted = ["Line " + linenumber + ":\r"];

    if (type == 1) {
        for (var i = index + 1; i < lines.length; i++) {
            formatted.push(lines[i])
        }
        var output = content.concat(formatted).join('\n');
        callback(null, {output: output});
    }
    else {
        Errors.findByError(error, (err, data) => {
            if (err || !data || (data && data.length == 0)) {
                var output = content.concat(lines).join('\n');
                callback(null, {output: output});
            }
            else {
                if (error === ERROR_TYPE) {
                    var filter = 'concatenate';
                    if (lines[lines.length-1].includes('subscriptable')) {
                        filter = 'subscriptable';
                    }
                    else if (lines[lines.length-1].includes('iterable')) {
                        filter = 'iterable';
                    }
    
                    Errors.findByErrorAndFilter(error, filter, (err, data) => {
                        if (err || !data || (data && data.length == 0)) {
                            formatted = lines;
                        }
                        else {
                            var msg = data[0].type2;
                            if (filter === 'subscriptable') {
                                var datatype = lines[lines.length - 1].match("'(.*)'")[0];
                                msg = msg.replace(/<DATATYPE>/g, datatype);
                            }
                            else if (filter === 'concatenate') {

                                var datatype1 = lines[lines.length - 1].match("\"(.*)\"")[0];
                                msg = msg.replace(/<DATATYPE1>/g, "\"str\"");
                                msg = msg.replace(/<DATATYPE2>/g, datatype1);
                            }
                            formatted.push(msg); 
                        }
                        var output = content.concat(formatted).join('\n');
                        callback(null, {output: output});
                    });
                }
                else {
                    var msg = data[0].type2;
    
                    if (error === ERROR_VALUE) {
    
                    }
                    else if (error === ERROR_SYNTAX) {
                    
                    }
                    else if (error === ERROR_ATTRIBUTE) {
                        var sections = lines[lines.length - 1].split('attribute');
                        var datatype = sections[0].match("'(.*)'")[0];
                        var attribute = sections[1].match("'(.*)'")[0];
                        msg = msg.replace(/<DATATYPE>/g, datatype);
                        msg = msg.replace(/<ATTRIBUTE>/g, attribute);
                    }
                    else if (error === ERROR_NAME) {
                        var regex = "'(.*)'";
                        var variable = lines[lines.length - 1].match(regex)[0];
                        msg = msg.replace(/<VARIABLE>/g, variable);
                    }

                    formatted.push(msg);
                    var output = content.concat(formatted).join('\n');
                    callback(null, {output: output});
                }
            }
        });
    }

    
}

function parse(type, output, callback) {
    
    if (type == 0) {
        callback(null, {output: output});
    }
    else {
        var lines = output.trim().split('\n');
        var errorIndex = -1;

        for (var i = 0; i < lines.length; i++) {
            if (lines[i].includes("Traceback") || lines[i].includes('File "./script.py') ) {
                errorIndex = i;
                break;
            }
        }

        var error = lines[lines.length - 1].split(':')[0].trim();

        var parsedError = parseHelper(type, error, lines.slice(0, errorIndex) , lines.slice(errorIndex), callback);
    }
}

// export the new Schema so we could modify it using Node.js
module.exports = {
    parse:parse
};