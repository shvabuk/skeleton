const gulp = require('gulp');
const twig = require('gulp-twig');
const fs = require('fs');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const server = require('browser-sync').create();
 
sass.compiler = require('node-sass');

const json = JSON.parse(fs.readFileSync('./package.json'));

gulp.task('js', () =>
    gulp
        .src([
            // './src/js/throttle.js', 
            './src/js/index.js'
        ])
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(concat('all.js'))
        .pipe(
            babel({
                presets: ['env'],
            })
        )
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/js'))
);

gulp.task('css', () => 
    gulp.src('./src/scss/style.scss')
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/css'))
);

gulp.task('html', () => 
    gulp.src('./src/twig/index.twig')
        .pipe(twig({
            data: {
                title: json.name,
                description: json.description,
                author: json.author
            }
        }))
        .pipe(gulp.dest('./dist'))
);

gulp.task('reload', (done) => {
    server.reload();
    done();
});

gulp.task('serve', (done) => {
    server.init({
      server: {
        baseDir: './dist'
      }
    });
    done();
});

gulp.task('watch', () =>  {
    gulp.watch('./src/scss/**/*.scss', gulp.series('css', 'reload'));
    gulp.watch('./src/twig/**/*.twig', gulp.series('html', 'reload'));
    gulp.watch('./src/js/**/*.js', gulp.series('js', 'reload'));
});

gulp.task('build', gulp.parallel(['html', 'js', 'css']));

gulp.task('dev', gulp.series('build', 'serve', 'watch'));

gulp.task('default', gulp.series(['dev']));
