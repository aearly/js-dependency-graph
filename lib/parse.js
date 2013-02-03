var
  fs = require("fs"),
  _ = require("lodash"),
  esprima = require("esprima");

function fullName(expression) {
  if (expression.type !== "Identifier") {
    try {
      return fullName(expression.object) + "." + expression.property.name;
    } catch (e) {}
  }

  return expression.name;
}

function getIdentifiers(data, prop, parentProp, parent2Prop, parent) {
  if (!_.isObject(data)) {
    return [];
  }
  var idents = [];
  if (data.type === "Identifier" &&
    data.name.match(/^[A-Z][A-Za-z0-9]+$/) &&
    parentProp !== "left" &&
    parent2Prop !== "arguments") {
    idents.push(fullName(parent));
  }
  return idents.concat(_.flatten(_.map(data, function (d, p) {
    return getIdentifiers(d, p, prop, parentProp, data);
  })));
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

      classes = getIdentifiers(parseData, "", "", "", {});

    } catch (e) {
      return callback(new Error("Error parsing file: " + file + ", " + e.message));
    }

    callback(null, {
      name: name,
      classes: classes
    });

  });

};
