var
  fs = require("fs"),
  _ = require("lodash"),
  esprima = require("esprima"),
  classRE = /^[A-Z][A-Za-z0-9]+$/,
  builtins = [
    "Object",
    "Array",
    "String",
    "Number",
    "Math",
    "Context",
    "JSON",
    "Stub",
    "Stream",
    "Chunk",
    "Tap",
    "HCHARS",
    "SyntaxError",
    "Error"
  ];

function isBuiltin(string) {
  return _.indexOf(builtins, string) !== -1;
}

function fullName(expression) {
  if (expression.type !== "Identifier") {
    try {
      var name = expression.property.name;
      if (name.match(classRE) && name.toUpperCase() !== name) {
        //return fullName(expression.object) + "." + name;
        return name;
      } else {
        return fullName(expression.object);
      }
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
    data.name.match(classRE) &&
    parentProp !== "left" &&
    parent2Prop !== "params") {
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

      classes = _.uniq(getIdentifiers(parseData, "", "", "", {}));

      classes = _.filter(classes, function (cls) {
        return cls !== name && !_.isEmpty(cls) && !isBuiltin(cls);
      });

    } catch (e) {
      return callback(new Error("Error parsing file: " + file + ", " + e.message));
    }

    callback(null, {
      name: name,
      classes: classes
    });

  });

};
