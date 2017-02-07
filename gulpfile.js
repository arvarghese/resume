var pkg = require("./package.json");
var gulp = require("gulp");
var sass = require("gulp-sass");
var jshint = require("gulp-jshint");
var stylish = require("jshint-stylish");
var beautify = require("gulp-jsbeautifier");
var cleanCSS = require("gulp-clean-css");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var browserSync = require("browser-sync").create();
var autoprefixer = require("gulp-autoprefixer");
var header = require("gulp-header");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var sourcemaps = require('gulp-sourcemaps');
var del = require("del");
var runSequence = require("run-sequence");

var defaultTasks = ['scss', 'format', 'jshint'];

var banner = ["/*\n",
  " * <%= pkg.title %> (<%= pkg.homepage %>)\n",
  " * Copyright 2016-" + (new Date()).getFullYear(), " <%= pkg.author %>\n",
  " */\n",
  ""
].join("");

gulp.task('default', ['serve']);


gulp.task("typescript", function () {
  tsProject.src()
    .pipe(tsProject())
    .js.pipe(gulp.dest("assets/js"));
});

gulp.task('scss', function () {
  return gulp.src('assets/css/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest('assets/css'));
});

gulp.task('jshint', function () {
  return gulp.src([
      'assets/js/resume.js',
      '*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});

gulp.task('format', function () {
  return gulp.src([
      'assets/css/resume.css',
      'client/js/resume.js',
      'index.html',
      '*.{js,json}'
    ], {
      base: './'
    })
    .pipe(beautify())
    .pipe(gulp.dest('./'));
});

gulp.task("clean-css", function () {
  return del.sync([
    "assets/css/*.min.css",
    "assets/css/*.map"
  ], {
    force: true
  });
});

gulp.task("clean-js", function () {
  return del.sync([
    "assets/js/*.min.js",
    "assets/js/*.map"
  ], {
    force: true
  });
});

gulp.task("minify", function () {
  return runSequence("clean-css", "scss", "minify-css", "sourcemap-css", "clean-js", "typescript", "minify-js", "sourcemap-js");
});

gulp.task('minify-css', ['scss'], function () {
  return gulp.src([
      'assets/css/resume.css'
    ])
    .pipe(cleanCSS({
      compatibility: 'ie8'
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('assets/css'));
});

gulp.task('minify-js', function () {
  return gulp.src([
      'assets/js/resume.js'
    ])
    .pipe(uglify())
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('assets/js'));
});

gulp.task('browserSync', function () {
  return browserSync.init({
    server: {
      baseDir: ''
    },
    port: process.env.PORT || 4790
  });
});

gulp.task("sourcemap-css", function () {
  return gulp.src([
      "assets/css/*.min.css"
    ])
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("assets/css"));
});

gulp.task("sourcemap-js", function () {
  return gulp.src([
      "assets/js/*.min.js",
      "!assets/js/*spec.js"
    ])
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("assets/js"));
});

gulp.task('serve', function () {
  runSequence("browserSync", "minify");

  gulp.watch('assets/css/**/*.scss', ['scss']);
  gulp.watch('assets/css/resume.css', ['minify-css']);
  gulp.watch("assets/js/resume.ts", ["typescript"]);
  gulp.watch('assets/js/resume.js', ['minify-js']);
  gulp.watch('index.html', browserSync.reload);
  gulp.watch([
    'assets/js/resume.min.js',
    'assets/css/resume.min.css'
  ], browserSync.reload);
});

module.exports = gulp;
