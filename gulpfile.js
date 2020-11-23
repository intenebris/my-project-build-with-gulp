// Для старта сборки:
// 1) Запустить gulp fonts для конвертации шритов и создания подключения их в css;
// 2) Запустить gulp svg для создания спрайта из svg-файлов;
// 3) Запустить gulp для начала работы.
// 4) Запустить gulp build для компиляции итоговой сборки на продакшн.
// Конвертация и сжатие изображений и html происходит только при gulp build.
// Рабочие html-файлы расположены в "html_modules/".
// В данной сборке подключен jQuery, можно сразу использовать, ничего дополнительно прописывать не нужно.

let source_folder = '#app'
let dist_folder = 'dist';

let fs = require('fs');

const { src, dest, watch, parallel, series } = require('gulp');
const fileinclude = require('gulp-file-include');
const scss = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const groupMedia = require('gulp-group-css-media-queries');
const minify = require('gulp-minifier');
const webp = require('gulp-webp');
const webpHTML = require('gulp-webp-html');
const webpcss = require('gulp-webpcss');
const strip = require('gulp-strip-comments');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require('gulp-ttf2woff');
const ttfToWoff2 = require("gulp-ttftowoff2");
const fonter = require('gulp-fonter');


function browsersync() {
    browserSync.init({
        server: {
            baseDir: source_folder+'/'
        }
    });
}

function cleanDist() {
    return del(dist_folder)
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        source_folder+'/js/main.js'
    ])
        .pipe(fileinclude())
        .pipe(concat('main.min.js'))
        .pipe(strip())
        .pipe(uglify())
        .pipe(dest(source_folder+'/js'))
        .pipe(browserSync.stream())
}

function html() {
    return src([source_folder+'/html_modules/*.html', '!'+source_folder+'/html_modules/_*.html'])
        .pipe(fileinclude())
        .pipe(dest(source_folder))
}

function styles() {
    return src(source_folder+'/scss/style.scss')
        .pipe(scss({outputStyle: 'compressed'}).on('error', scss.logError))
        .pipe(concat('style.min.css'))
        .pipe(dest(source_folder+'/css'))
        .pipe(browserSync.stream())
}

function toWoff() {
    return src(source_folder+'/fonts/*.ttf')
        .pipe(ttf2woff())
        .pipe(dest(source_folder+'/fonts'))
        .pipe(src(source_folder+'/fonts/*.ttf'))
        .pipe(ttfToWoff2())
        .pipe(dest(source_folder+'/fonts'))
}
function toTtf() {
    return src(source_folder+'/fonts/*.otf')
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(dest(source_folder+'/fonts'))
}

function fontsStyle() {
    let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
    if (file_content == '') {
        fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
        return fs.readdir(source_folder+'/fonts', function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}
function cb() {}

// Функции, выполняющиейся только при gulp build - start
function images() {
    return src(source_folder+'/img/**/*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 4}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: false},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest(dist_folder+'/img'))
        .pipe(src(source_folder+'/img/**/*'))
        .pipe(webp({
            quality: 70
        }))
        .pipe(dest(dist_folder+'/img'))
}

function distHtml() {
    return src(source_folder+'/*.html')
        .pipe(webpHTML())
        .pipe(minify({
            minify: true,
            minifyHTML: {
            collapseWhitespace: true,
            conservativeCollapse: true,
            removeComments: true,
            },
        }))
        .pipe(dest(dist_folder))
}

function distStyles() {
    return src(source_folder+'/scss/style.scss')
        .pipe(scss({outputStyle: 'expanded'}))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(webpcss({
            webpClass: '.webp',
            noWebpClass: '.no-webp'
        }))
        .pipe(groupMedia())
        .pipe(concat('style.css'))
        .pipe(dest(dist_folder+'/css'))
        .pipe(scss({outputStyle: 'compressed'}).on('error', scss.logError))
        .pipe(concat('style.min.css'))
        .pipe(dest(dist_folder+'/css'))
}

function distScripts() {
    return src(source_folder+'/js/init.js')
        .pipe(concat('init.min.js'))
        .pipe(uglify())
        .pipe(dest(source_folder+'/js'))
}

function build() {
    return src([
        source_folder+'/fonts/**/*.ttf',
        source_folder+'/fonts/**/*.woff',
        source_folder+'/fonts/**/*.woff2',
        source_folder+'/js/main.min.js',
        source_folder+'/js/init.min.js',
    ], {base: source_folder})
    .pipe(dest(dist_folder))
}
// Функции, выполняющиейся только при gulp build - end

// Создание svg-спрайта из всех svg в папке img. Запускается вручную командой gulp svg. Файл создается в этой же папке.
function createSprite() {
    return src([source_folder + '/img/*.svg'])
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../sprite.svg", // имя файла со спрайтами
                    example: true
                }
            },
        }))
        .pipe(dest(source_folder+'/img'))
}

function watching() {
    watch([source_folder+'/scss/**/*.scss'], styles);
    watch([source_folder+'/js/**/*.js', '!'+source_folder+'/js/main.min.js'], scripts);
    watch([source_folder+'/html_modules/*.html'], html).on('change',browserSync.reload);
}

exports.scripts = scripts;
exports.html = html;
exports.styles = styles;
exports.distStyles = distStyles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.images = images;
exports.cleanDist = cleanDist;
exports.distScripts = distScripts;
exports.distHtml = distHtml;
exports.svg = createSprite;
exports.toWoff = toWoff;
exports.toTtf = toTtf;
exports.fontsStyle = fontsStyle;


exports.fonts = series(toTtf, toWoff, fontsStyle); //Конвертация шрифтов из otf в ttf и из ttf в woff и woff2. Запускается вручную командой gulp fonts.
exports.build = series(cleanDist, images, distHtml, distStyles, distScripts, build);
exports.default = parallel(html, styles, scripts, watching, browsersync);