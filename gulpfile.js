/**
 * Created by peijian.wang on 2016/6/29.
 */
var gulp            = require('gulp');
var browserSync     = require('browser-sync').create();//浏览器自动刷新

var del             = require('del');//删除文件
var htmlmin         = require('gulp-htmlmin'); //html压缩
var cleanCSS        = require('gulp-clean-css');//css压缩
var uglify          = require('gulp-uglify');//js压缩
var imagemin        = require('gulp-imagemin');//图片压缩
var pngcrush        = require('imagemin-pngcrush');//图片压缩
var notify          = require('gulp-notify');//提示信息

var rev             = require('gulp-rev');//对文件名MD5后缀
var revCollector    = require('gulp-rev-collector');//对文件名MD5后缀

var base64          = require('gulp-base64');//对文件中的图片进行base64

var runSequence     = require('gulp-sequence');//gulp任务管理

var contentIncluder = require('gulp-content-includer');//g

var custom = {
    //定义本机需要代理的端口号
    proxy_port : 63342,
    dev_path : "dev/",
    pack_path : "build/",

    //base64配置
    options : {
        baseDir: this.pack_path,
        extensions: ['png', 'jpg', 'gif'],
        maxImageSize: 10 * 1024, // bytes
        debug: false
    }
}


/**
 * 浏览器自动刷新任务
 */
gulp.task('browser-sync', function() {
    //使用代理的方式
    browserSync.init({
        proxy: "localhost:" + custom.proxy_port,
    });

    //监听html文件，刷新浏览器
    gulp.watch(custom.dev_path + "*.html").on('change', function(info){
    	console.log(info.type, info.path);
	
	    /*gulp.src(info.path)
		    .pipe(contentIncluder({
			    includerReg:/<!\-\-include\s+"([^"]+)"\-\->/g
		    }))
		    .pipe(gulp.dest(custom.dev_path));*/
    	
	    browserSync.reload();
    });
    //监听js文件，更新js
    gulp.watch(custom.dev_path + "**/*.js", function(){
        return gulp.src(custom.dev_path + "**/*.js").pipe(browserSync.stream());
    });
    //监听css文件，更新css
    gulp.watch(custom.dev_path + "**/*.css", function(){
        return gulp.src(custom.dev_path + "**/*.css").pipe(browserSync.stream());
    });
});

/**
 * 发布时打包方法，将css，js打包至build文件夹下
 */
gulp.task('pack',function(cb){
    /*["clean", 'html','css','js','fonts','img']*/
    runSequence('clean',['html','css','js','fonts','img'] ,'rev_css','rev_js', cb);
});

/**
 * 清理build文件夹
 */
gulp.task('clean', function(cb) {
    return del([custom.pack_path]);
});

/**
 * 压缩文件
 * */
gulp.task('html', function(cb){
    // 压缩html
    return gulp.src(custom.dev_path + '*.html')
	    .pipe(contentIncluder({
		    includerReg:/<!\-\-include\s+"([^"]+)"\-\->/g
	    }))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(custom.pack_path));
});

gulp.task('css', function(cb){
    return gulp.src(custom.dev_path + '**/*.css')      //压缩的文件
        .pipe(base64(custom.options))
        .pipe(cleanCSS())                    //执行压缩
        .pipe(rev())                           //- 文件名加MD5后缀
        .pipe(gulp.dest(custom.pack_path))  //输出文件夹
        .pipe(rev.manifest())                    //- 生成一个rev-manifest.json
        .pipe(gulp.dest(custom.pack_path + 'rev_css/'));              //- 将 rev-manifest.json 保存到 rev_css 目录内
});

gulp.task('js', function(cb){
    return gulp.src(custom.dev_path + '**/*.js')
        .pipe(uglify())                         //压缩
        .pipe(rev())                           //- 文件名加MD5后缀
        .pipe(gulp.dest(custom.pack_path))  //输出
        .pipe(rev.manifest())                    //- 生成一个rev-manifest.json
        .pipe(gulp.dest(custom.pack_path + 'rev_js/'));              //- 将 rev-manifest.json 保存到 rev_js 目录内
});

gulp.task('img', function(cb){
    return gulp.src(custom.dev_path + 'img/**/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngcrush()]
        }))
        .pipe(gulp.dest(custom.pack_path + 'img/'));
});

gulp.task('fonts', function(cb){
    return gulp.src(custom.dev_path + 'fonts/*')
        .pipe(gulp.dest(custom.pack_path + 'fonts/'));
});


gulp.task('rev_css', function(cb){
    return gulp.src([custom.pack_path + 'rev_css/*.json', custom.pack_path + '*.html'])   //- 读取 rev-manifest.json 文件以及需要进行css名替换的文件
        .pipe(revCollector({
            replaceReved: true
        }))                                   //- 执行文件内css名的替换
        .pipe(gulp.dest('build/'));                     //- 替换后的文件输出的目录
});

gulp.task('rev_js', function(cb){
    return gulp.src([custom.pack_path + 'rev_js/*.json', custom.pack_path + '/**/*.js', custom.pack_path + '*.html'])   //- 读取 rev-manifest.json 文件以及需要进行js名替换的文件
        .pipe(revCollector({
            replaceReved: true
        }))                                   //- 执行文件内js名的替换
        .pipe(gulp.dest('build/'));                     //- 替换后的文件输出的目录
});