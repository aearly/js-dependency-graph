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
      callback(null, results);
    });
  }
};
