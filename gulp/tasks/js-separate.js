/**
 * PLON Gulp task: js-separate
 */

module.exports = function() {
	'use strict';

	var babel = require('gulp-babel');
	var sourcemaps = require('gulp-sourcemaps');
	var concat = require('gulp-concat');
	var uglify = require('gulp-uglify');
	var rename = require('gulp-rename');

	return gulp.task('js-separate', function() {
		var jsFilesList;
		if (config.jsFiles && config.jsFiles.length > 0) {
			jsFilesList = config.jsFiles;
		}
		else jsFilesList = config.assetsDir + config.subDirs.assets.js + '*.js';

		return gulp
			.src(jsFilesList)
			.pipe(babel({
				presets: ['env']
			}).on('error', reportError))
			.pipe(gulp.dest(config.distDir + config.subDirs.dist.js))
			.pipe(uglify().on('error', reportError))
			.pipe(rename({suffix: '.min'}))
			.pipe(gulp.dest(config.distDir + config.subDirs.dist.js));
	});
}