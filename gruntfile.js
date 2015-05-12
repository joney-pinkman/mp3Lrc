/**
 * Created by nemo on 2015/5/12.
 */
module.exports = function(grunt) {

    grunt.initConfig({
        concat: {
            dist: {
                src: [ 'src/getParseLrc.js', 'src/constructLrc.js','src/lrc.js'],
                dest: 'build/lrc.js'
            }
        },
        uglify:{
            my_target:{
                files:{
                    'build/lrc.min.js':['build/lrc.js']
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['concat','uglify']);

};