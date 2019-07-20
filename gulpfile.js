"use strict";

const gulp = require("gulp"),
    tslint = require("gulp-tslint"),
    tsc = require("gulp-typescript"),
    runSequence = require("run-sequence"),
    mocha = require("gulp-mocha"),
    istanbul = require("gulp-istanbul"),
    sourcemaps = require("gulp-sourcemaps");

gulp.task("lint", () => {
    const config = {
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

const tsLibProject = tsc.createProject("tsconfig.json", {
    module: "commonjs"
});

gulp.task("build-lib", () => {
    return gulp.src([
        "src/**/*.ts"
    ])
        .pipe(tsLibProject())
        .on("error", (err) => {
            process.exit(1);
        })
        .js.pipe(gulp.dest("lib/"));
});

const tsEsProject = tsc.createProject("tsconfig.json", {
    module: "es2015"
});

gulp.task("build-es", () => {
    return gulp.src([
        "src/**/*.ts"
    ])
        .pipe(tsEsProject())
        .on("error", (err) => {
            process.exit(1);
        })
        .js.pipe(gulp.dest("es/"));
});

const tsDtsProject = tsc.createProject("tsconfig.json", {
    declaration: true,
    noResolve: false
});

gulp.task("build-dts", () => {
    return gulp.src([
        "src/**/*.ts"
    ])
        .pipe(tsDtsProject())
        .on("error", (err) => {
            process.exit(1);
        })
        .dts.pipe(gulp.dest("dts"));

});

const tstProject = tsc.createProject("tsconfig.json");

gulp.task("build-src", () => {
    return gulp.src([
        "src/**/*.ts"
    ])
        .pipe(sourcemaps.init())
        .pipe(tstProject())
        .on("error", (err) => {
            process.exit(1);
        })
        .js.pipe(sourcemaps.write(".", {
            sourceRoot: (file) => {
                return file.cwd + '/src';
            }
        }))
        .pipe(gulp.dest("src/"));
});

gulp.task("istanbul:hook", () => {
    return gulp.src(["src/**/*.js"])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task("test", (cb) => {
    runSequence("istanbul:hook", cb);
});

gulp.task("build", (cb) => {
    runSequence(
        ["build-src", "build-es", "build-lib", "build-dts"],
        cb);
});

gulp.task("default", (cb) => {
    runSequence(
        "lint",
        "test",
        "build",
        cb);
});
