module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    less: {
      development: {
        options: {
          paths: ["styles/css"]
        },
        files: {
          "path/to/result.css": "path/to/source.less"
        }
      },
      production: {
        options: {
          paths: ["assets/css"],
          cleancss: true
        },
        files: {
          "path/to/result.css": "path/to/source.less"
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');


  // Default task(s).
  grunt.registerTask('default', ['uglify']);

};