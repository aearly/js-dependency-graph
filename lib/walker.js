var
  path = require("path"),
  _ = require("lodash"),
  async = require("async"),
  glob = require("glob"),
  parse = require("./parse"),
  ignores = [
    "/node_modules/",
    "/examples/",
    "/test/",
    "/dist/"
  ];

function setParents(deps) {
  _.each(deps, function (entry) {
    _.each(entry.classes, function (cls) {
      deps[cls].parents.push(entry.filename);
    });
  });
}

module.exports = {
  run: function (options, callback) {
    if (!options.files) {
      options.files = glob.sync("**/*.js", {
        cwd: options.baseDir
      });
    }

    var fullFiles = [],
      knownClasses = options.files.map(function (file) {
        return file.match(/([^\/]+)\.js$/)[1];
      });


    _.each(options.files, function (file) {
      var fullPath = path.normalize(options.baseDir + path.sep + file),
        include = !_.any(ignores, function (ignore) {
          return fullPath.indexOf(ignore) !== -1;
        });
      if (include) {
        fullFiles.push(fullPath);
      }
    });

    async.map(fullFiles, async.apply(parse, knownClasses), function (err, results) {
      if (err) { return callback(err); }

      var deps = {};

      _.each(results, function (result) {
        deps[result.name] = {
          name: result.name,
          id: result.name,
          filename: result.filename,
          classes: result.classes,
          parents: [],
          module: false,
          "native": false,
          mgroup: path.dirname(result.filename),
          includes: 0
        };
      });

      _.each(_.flatten(_.pluck(deps, "classes")), function (cls) {
        deps[cls] = deps[cls] || {name: cls, includes: 0, untracked: true};
        deps[cls].includes += 1;
      });

      setParents(deps);

      //callback(null, _.keys(deps));
      callback(null, _.values(deps));
    });
  }
};
