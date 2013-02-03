var
  path = require("path"),
  _ = require("lodash"),
  async = require("async"),
  parse = require("./parse"),
  ignores = [
    "/node_modules/",
    "/examples/",
    "/test/"
  ];

module.exports = {
  run: function (options, callback) {
    var fullFiles = [];

    _.each(options.files, function (file) {
      var fullPath = path.normalize(options.baseDir + path.sep + file),
        include = !_.any(ignores, function (ignore) {
          return fullPath.indexOf(ignore) !== -1;
        });
      if (include) {
        fullFiles.push(fullPath);
      }
    });

    async.map(fullFiles, parse, function (err, results) {
      if (err) {
        return callback(err);
      }

      var deps = {};

      _.each(results, function (result) {
        deps[result.name] = {
          name: result.name,
          classes: result.classes,
          includes: 0
        };
      });

      _.each(_.flatten(_.pluck(deps, "classes")), function (cls) {
        deps[cls] = deps[cls] || {name: cls, includes: 0, untracked: true};
        deps[cls].includes += 1;
      });

      //callback(null, _.keys(deps));
      callback(null, deps);
    });
  }
};
