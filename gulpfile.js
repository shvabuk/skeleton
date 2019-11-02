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
const eslint = require('gulp-eslint');
const notifier = require('node-notifier');
const gulpStylelint = require('gulp-stylelint');
const { exec } = require('child_process');

sass.compiler = require('node-sass');

const json = JSON.parse(fs.readFileSync('./package.json'));

const path = {
    js: {
        src: ['./src/js/index.js'],
        watch: './src/js/**/*.js',
        dist: './dist/js',
    },
    css: {
        src: './src/scss/style.scss',
        watch: './src/scss/**/*.scss',
        dist: './dist/css',
    },
    html: {
        src: './src/twig/index.twig',
        watch: './src/twig/**/*.twig',
        dist: './dist',
    },
};

gulp.task('js', () =>
    gulp
        .src(path.js.src)
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(concat('all.js'))
        .pipe(
            babel({
                presets: ['@babel/env'],
            })
        )
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.js.dist))
);

gulp.task('js-lint', () =>
    gulp
        .src(path.js.src)
        .pipe(eslint())
        .pipe(
            eslint.results(results => {
                console.log(`Total ESLint Results: ${results.length}`);
                console.log(`Total ESLint Warnings: ${results.warningCount}`);
                console.log(`Total ESLint Errors: ${results.errorCount}`);
                if (results.errorCount > 0) {
                    notifier.notify({
                        title: 'ES lint errors',
                        message: `${results.errorCount} errors found in ${results.length} files.`,
                        sound: true,
                    });
                }
            })
        )
);

gulp.task('css', () =>
    gulp
        .src(path.css.src)
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(path.css.dist))
);

gulp.task('css-lint', () =>
    gulp
        .src(path.css.src)
        .pipe(gulpStylelint())
        .on('error', e => {
            console.log(`Stylelint ${e.message}`);
            notifier.notify({
                title: 'Stylelint errors',
                message: e.message,
                sound: true,
            });
        })
);

gulp.task('twig', () =>
    gulp
        .src(path.html.src)
        .pipe(
            twig({
                data: {
                    title: json.name,
                    description: json.description,
                    author: json.author,
                },
            })
        )
        .pipe(gulp.dest(path.html.dist))
);

gulp.task('twig-lint', done => {
    exec('.\\vendor\\bin\\twigcs', (err, stdout, stderr) => {
        if (err) {
            // node couldn't execute the command
            done();
        }

        // the *entire* stdout and stderr (buffered)
        console.log(`Twig lint stdout: ${stdout}`);
        console.log(`Twig lint stderr: ${stderr}`);

        if (stdout.indexOf('ERROR') > 0) {
            notifier.notify({
                title: 'Twig lint errors',
                message: `Twig errors found`,
                sound: true,
            });
        }
        done();
    });
});

gulp.task('reload', done => {
    server.reload();
    done();
});

gulp.task('watch', () => {
    server.init({
        server: {
            baseDir: './dist',
        },
    });

    gulp.watch(
        path.html.watch,
        gulp.series(gulp.parallel('twig', 'twig-lint'), 'reload')
    );
    gulp.watch(
        path.css.watch,
        gulp.series(gulp.parallel('css', 'css-lint'), 'reload')
    );
    gulp.watch(
        path.js.watch,
        gulp.series(gulp.parallel('js', 'js-lint'), 'reload')
    );
});

gulp.task(
    'build',
    gulp.parallel(['twig', 'js', 'css', 'twig-lint', 'js-lint', 'css-lint'])
);

gulp.task('dev', gulp.series('build', 'watch'));

gulp.task('default', gulp.series(['dev']));
