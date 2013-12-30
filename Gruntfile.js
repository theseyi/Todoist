module.exports = function (grunt) {

    //Project  and task config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            build: {
                files: [
                    {
                        src : [
                            '<%= src_dir %>/**/todo.js',
                            '<%= src_dir %>/collections/*.js',
                            '<%= src_dir %>/views/*.js',
                            '<%= src_dir %>/routers/*.js',
                            '<%= src_dir %>/app.js',
                            '!<%= src_dir %>/**/*.min.js'
                        ],
                        dest: '<%= src_dir %>/<%= dest_dir %>/<%= pkg.name %>-<%= pkg.version %>.js'
                    }
                ]
            }
        },

        uglify: {
            options: {
                banner  : '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                beautify: false,
                mangle  : true,
                report  : 'gzip'
            },
            build  : {
                src : ['<%= concat.build.files[0].dest %>', '!*.min.js'],
                dest: '<%= src_dir %>/<%= dest_dir %>/<%= pkg.name %>.min.js'
            }
        },

        watch: {
            files: ['<%= src_dir %>/**/*.js', '!<%= src_dir %>/**/*.min.js'],
            tasks: ['concat', 'uglify']
        },

        src_dir: 'js',

        dest_dir: 'build'
    });


    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.loadNpmTasks('grunt-contrib-watch');

    //Default tasks
    grunt.registerTask('default', ['concat', 'uglify']);
};