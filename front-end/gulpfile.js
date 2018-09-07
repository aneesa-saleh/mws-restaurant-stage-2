/* eslint-env node */

const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

const path = require('path');

require('gulp-grunt')(gulp, {
  prefix: '',
});

gulp.task('serve', ['styles'], () => {
  gulp.watch('./*.html', ['copy-html']);
  gulp.watch('scss/*.scss', ['styles']);
  gulp.watch('js/*.js', ['scripts']);
  gulp.watch('./dist/*.html').on('change', browserSync.reload);
  gulp.watch('./dist/js/*.js').on('change', browserSync.reload);
  gulp.watch('./dist/css/*.css').on('change', browserSync.reload);

  browserSync.init({
    server: './dist',
    port: 8000,
  });
});

gulp.task('grunt-imgs', [
  'clean', 'mkdir', 'responsive_images',
]);

gulp.task('grunt-favicons', ['favicons']);

gulp.task('styles', () => {
  gulp.src('scss/*.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('copy-html', () => {
  gulp.src('./*.html')
    .pipe(gulp.dest('./dist'));
});

gulp.task('copy-sw', () => {
  gulp.src('./service-worker.js')
    .pipe(gulp.dest('./dist'));
});

gulp.task('scripts', () => {
  gulp.src('js/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env'],
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist', () => {
  gulp.src('js/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env'],
    }))
    .pipe(sourcemaps.write())
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('dist', [
  'grunt-imgs',
  'copy-html',
  'copy-sw',
  'styles',
  'scripts-dist',
]);

gulp.task('default', ['grunt-imgs', 'copy-html', 'copy-sw', 'styles', 'scripts', 'serve']);
