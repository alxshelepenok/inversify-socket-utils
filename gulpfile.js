"use strict";

const gulp = require("gulp");
const tslint = require("gulp-tslint");
const tsc = require("gulp-typescript");
const mocha = require("gulp-mocha");
const istanbul = require("gulp-istanbul");
const sourcemaps = require("gulp-sourcemaps");

const tsLibProject = tsc.createProject("tsconfig.json", {
  module: "commonjs"
});

const tsEsProject = tsc.createProject("tsconfig.json", {
  module: "es2015"
});

const tsDtsProject = tsc.createProject("tsconfig.json", {
  declaration: true,
  noResolve: false
});

const tsProject = tsc.createProject("tsconfig.json");

const buildLib = () => {
  return gulp.src([
    "src/**/*.ts"
  ])
    .pipe(tsLibProject())
    .on("error", (err) => {
      process.exit(1);
    })
    .js.pipe(gulp.dest("lib/"));
}

const buildEs = () => {
  return gulp.src([
    "src/**/*.ts"
  ])
    .pipe(tsEsProject())
    .on("error", (err) => {
      process.exit(1);
    })
    .js.pipe(gulp.dest("es/"));
}

const buildDts = () => {
  return gulp.src([
    "src/**/*.ts"
  ])
    .pipe(tsDtsProject())
    .on("error", (err) => {
      process.exit(1);
    })
    .dts.pipe(gulp.dest("dts"));
}

const buildSrc = () => {
  return gulp.src([
    "src/**/*.ts"
  ])
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .on("error", (err) => {
        process.exit(1);
    })
    .js.pipe(sourcemaps.write(".", {
        sourceRoot: (file) => {
          return file.cwd + '/src';
        }
    }))
    .pipe(gulp.dest("src/"));
}

const lintTask = () => {
   const config = {
    formatter: "verbose",
    emitError: (process.env.CI) ? true : false
  };

  return gulp.src([
    "src/**/**.ts",
    "test/**/**.test.ts"
  ])
    .pipe(tslint(config))
    .pipe(tslint.report());
}

const testTask = () => {
  return gulp.src(["src/**/*.js"])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire());
}

const buildTask = gulp.parallel(buildSrc, buildEs, buildLib, buildDts);
const defaultTask = gulp.series(lintTask, testTask, buildTask);

exports.lint = lintTask;
exports.test = testTask;
exports.build = buildTask;
exports.default = defaultTask;
