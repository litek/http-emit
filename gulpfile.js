"use strict";
var gulp = require("gulp"),
    jshint = require("gulp-jshint");

gulp.task("lint", function() {
  gulp.src("{lib,test,.}/*.js")
    .pipe(jshint())
    .pipe(jshint.reporter());
});

gulp.task("default", ["lint"]);
