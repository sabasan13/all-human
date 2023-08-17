var gulp = require('gulp'),
    browserify = require('browserify'),
    sourcemaps = require('gulp-sourcemaps'),
    posthtml = require('gulp-posthtml'),
    // postcss = require('gulp-postcss'),
    sass = require('gulp-sass')(require('sass')),
    csso = require('gulp-csso'),
    autoprefixer = require('gulp-autoprefixer'),
    fontmin = require('gulp-fontmin'),
    uglify = require('gulp-uglify'),
    plumber = require('gulp-plumber'),
    imagemin = require('gulp-imagemin'),
    gzip = require('gulp-gzip'),
    webp = require('gulp-webp'),
    //tinypng = require('gulp-tinypng'),
    webserver = require('gulp-webserver'),
    argv = require('yargs').argv,
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    through2 = require('through2')

var is_build = Boolean(argv.build) || false
let is_watch = Boolean(argv.W) || false
var is_webserver = Boolean(argv.webserver) || false
let is_notify = Boolean(argv.notify) || false

const notify = is_notify
    ? require('gulp-notify')
    : () => {
          return through2.obj((file, _, cb) => {
              cb(null, file)
          })
      }

// Пути к файлам
var paths = {
    vendor_js: {
        compile: ['./src/js/vendor/index.js'],
        watch: ['./src/js/vendor/**/*.js'],
    },
    js: {
        custom: ['./src/js/**/*.js', '!./src/js/vendor/**/*.js'],
    },
    css: {
        compile: ['./src/css/*.{css,scss,sass}'],
        watch: ['./src/css/**/*.sass'],
    },
    images: {
        all: [
            './src/img/**/*.jpg',
            './src/img/**/*.gif',
            './src/img/**/*.png',
            './src/img/**/*.svg',
        ],
        any: ['./src/img/**/*.jpg', './src/img/**/*.gif', './src/img/**/*.svg'],
        png: ['./src/img/**/*.png'],
    },
    webp: {
        all: ['./src/img/**/*.{png,jpg}', './src/img/*.{png,jpg}'],
    },
    static: {
        all: ['./src/s/**/*'],
    },
    favicon: {
        all: ['./src/favicon/**/*'],
    },
    fonts: {
        ttf: './src/fonts/*.ttf',
        all: './src/fonts/**/*',
    },
    html: {
        watch: ['./src/**/*.html'],
        build: ['./src/html/*.html'],
    },
}

// Собираем css

gulp.task('css', function () {
    let pipe = gulp.src(paths.css.compile).pipe(plumber())

    if (is_build) {
        pipe = pipe
            .pipe(sass())
            .pipe(autoprefixer(['last 15 versions']))
            .pipe(csso())
    } else {
        pipe = pipe
            .pipe(sourcemaps.init({ debug: true }))
            .pipe(sass())
            .pipe(autoprefixer(['last 15 versions']))
            .pipe(sourcemaps.write('.'))
    }

    return pipe
        .pipe(gulp.dest(`./public/css`))
        .pipe(notify({ message: 'Build css', onLast: true }))
})

// Собираем js
gulp.task('js', function () {
    var pipe = browserify(`./src/js/index.js`)
        .transform('babelify')
        .transform('localenvify')
        .bundle()
        .pipe(source('index.js'))
        .pipe(plumber())
        .pipe(buffer())

    if (is_build) {
        pipe.pipe(uglify())
    }

    return pipe
        .pipe(gulp.dest(`./public/js`))
        .pipe(notify({ message: 'Build custom js', onLast: true }))
})

gulp.task('vendor-js', function () {
    return gulp
        .src(paths.vendor_js.compile)
        .pipe(gulp.dest('./public/js/vendor'))
        .pipe(plumber())
        .pipe(notify({ message: 'Copy vendor js', onLast: true }))
})

// Копируем и минимизируем изображения

gulp.task('img_copy', function () {
    return (
        gulp
            .src(paths.images.all)
            .pipe(plumber())
            // .pipe(imagemin())
            .pipe(gulp.dest('./public/img'))
            .pipe(notify({ message: 'Move images to build', onLast: true }))
    )
})

gulp.task('img_mini', function () {
    return gulp
        .src(paths.images.any)
        .pipe(plumber())
        .pipe(imagemin())
        .pipe(gulp.dest('./public/img'))
        .pipe(notify({ message: 'Minimize and move images', onLast: true }))

    /*
    gulp.src(paths.images.png)
        .pipe(plumber())
        //.pipe(tinypng('fiZxjIh3dTZNwFPP7YTmW4rfZkCPUg0S'))
        .pipe(gulp.dest('./build/img'))
        .pipe(notify({ message: 'Minimize and move .png', onLast: true }));
*/
})

gulp.task('conver_to_webp', function () {
    return gulp
        .src(paths.webp.all)
        .pipe(plumber())
        .pipe(webp())
        .pipe(gulp.dest('./public/img'))
        .pipe(notify({ message: 'Move images to build', onLast: true }))
})

// Создаем Шрифты

gulp.task('fonts', function () {
    return (
        gulp
            .src(paths.fonts.all)
            .pipe(plumber())
            //.pipe(fontmin())
            .pipe(gulp.dest('./public/fonts'))
            .pipe(notify({ message: 'Minimize and move fonts', onLast: true }))
    )
})

gulp.task('static', function () {
    return gulp
        .src(paths.static.all)
        .pipe(plumber())
        .pipe(gulp.dest('./public/s'))
        .pipe(notify({ message: 'Move Static Files!', onLast: true }))
})

gulp.task('favicon', function () {
    return gulp
        .src(paths.favicon.all)
        .pipe(plumber())
        .pipe(gulp.dest('./public'))
        .pipe(notify({ message: 'move favicons!', onLast: true }))
})

gulp.task('html', function () {
    const ctx = {
        is_build: is_build,
        // is_build: true,
    }

    return gulp
        .src(paths.html.build)
        .pipe(plumber())
        .pipe(posthtml(ctx))
        .pipe(gulp.dest('public'))
        .pipe(notify({ message: 'Build HTML Files!', onLast: true }))
})

gulp.task('webserver', function () {
    gulp.src('./public').pipe(
        webserver({
            host: 'localhost',
            livereload: {
                enable: false,
                filter: function (filename) {
                    return true
                },
            },
        })
    )
})

gulp.task('gzip', function () {
    return gulp
        .src('./public/**/*.{css,js,html}')
        .pipe(gzip())
        .pipe(gulp.dest('./public/'))
})

// Запуск сервера разработки gulp watch
gulp.task('watch', function () {
    gulp.watch(paths.css.watch, gulp.parallel('css'))
    gulp.watch(paths.js.custom, gulp.parallel('js'))
    gulp.watch(paths.images.all, gulp.parallel('img_copy'))
    gulp.watch(paths.webp.all, gulp.parallel('conver_to_webp'))
    gulp.watch(paths.fonts.all, gulp.parallel('fonts'))
    gulp.watch(paths.static.all, gulp.parallel('static'))
    gulp.watch(paths.favicon.all, gulp.parallel('favicon'))
    gulp.watch(paths.html.watch, gulp.parallel('html'))
})

// gulp.task('clean:dist', function () {
//     return del(['public/**', '!public']);
// });

var defaultTasks = [
    'css',
    'js',
    'html',
    'fonts',
    'static',
    'img_copy',
    // 'conver_to_webp',
    'favicon',
]
// если в режиме сборки
if (is_build) {
    // добавляем сжатие файлов
    defaultTasks.push('gzip')
}

if (is_watch) {
    defaultTasks.push('watch')
}

gulp.task(
    'default',
    is_webserver
        ? gulp.parallel(gulp.series(defaultTasks), 'webserver')
        : gulp.series(defaultTasks)
)
