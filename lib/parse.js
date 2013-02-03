var
  fs = require("fs"),
  _ = require("lodash"),
  esprima = require("esprima");

function getIdentifiers(data, prop) {
  if (!_.isObject(data)) {
    return [];
  }
  var idents = [];
  if (data.type === "Identifier") {
    idents.push(data.name);
  }
  return idents.concat(_.flatten(_.map(data, getIdentifiers)));
}

module.exports = function parse(file, callback) {

  fs.readFile(file, function (err, source) {
    if (err) {
      return callback(new Error("Error reading file: " + err.message));
    }
    var parseData,
      name,
      classes = [];

    try {

      name = file.match(/\/([A-Za-z_0-9]+)\.js$/)[1];

      parseData = esprima.parse(source);

      classes = getIdentifiers(parseData);

    } catch (e) {
      return callback(new Error("Error parsing file: " + file + ", " + e.message));
    }

    callback(null, {
      name: name,
      classes: classes
    });

  });

};
