"use strict";

var gulp = require("gulp"),
    tslint = require("gulp-tslint"),
    tsc = require("gulp-typescript"),
    runSequence = require("run-sequence"),
    mocha = require("gulp-mocha"),
    istanbul = require("gulp-istanbul"),
    sourcemaps = require("gulp-sourcemaps");

gulp.task("lint", function () {

    var config = {
        fornatter: "verbose",
        emitError: (process.env.CI) ? true : false
    };

    return gulp.src([
        "src/**/**.ts",
        "test/**/**.test.ts"
    ])
        .pipe(tslint(config))
        .pipe(tslint.report());
});

var tsLibProject = tsc.createProject("tsconfig.json", {
    module: "commonjs"
});

gulp.task("build-lib", function () {
    return gulp.src([
        "src/**/*.ts"
    ])
        .pipe(tsLibProject())
        .on("error", function (err) {
            process.exit(1);
        })
        .js.pipe(gulp.dest("lib/"));
});

var tsEsProject = tsc.createProject("tsconfig.json", {
    module: "es2015"
});

gulp.task("build-es", function () {
    return gulp.src([
        "src/**/*.ts"
    ])
        .pipe(tsEsProject())
        .on("error", function (err) {
            process.exit(1);
        })
        .js.pipe(gulp.dest("es/"));
});

var tsDtsProject = tsc.createProject("tsconfig.json", {
    declaration: true,
    noResolve: false
});

gulp.task("build-dts", function () {
    return gulp.src([
        "src/**/*.ts"
    ])
        .pipe(tsDtsProject())
        .on("error", function (err) {
            process.exit(1);
        })
        .dts.pipe(gulp.dest("dts"));

});

var tstProject = tsc.createProject("tsconfig.json");

gulp.task("build-src", function () {
    return gulp.src([
        "src/**/*.ts"
    ])
        .pipe(sourcemaps.init())
        .pipe(tstProject())
        .on("error", function (err) {
            process.exit(1);
        })
        .js.pipe(sourcemaps.write(".", {
            sourceRoot: function (file) {
                return file.cwd + '/src';
            }
        }))
        .pipe(gulp.dest("src/"));
});

gulp.task("istanbul:hook", function () {
    return gulp.src(["src/**/*.js"])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task("test", function (cb) {
    runSequence("istanbul:hook", cb);
});

gulp.task("build", function (cb) {
    runSequence(
        "lint", ["build-src", "build-es", "build-lib", "build-dts"],
        cb);
});

gulp.task("default", function (cb) {
    runSequence(
        "build",
        "test",
        cb);
});
