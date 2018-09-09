/* this is the code used to get responsive images that will be used in our application
We will be generating images with differing sizes to accomodate different break points.
so the images will end up being something like: name-small_1x.jpg at 60% compression and 600px wide
*/
module.exports = function(grunt) {
  grunt.initConfig({
    responsive_images: {
      dev: {
        options:{
          engine: 'gm',
          sizes: [
            { name: "small", suffix: "_1x", quality: 60, width: 320 },
            { name: "small", suffix: "_2x", quality: 60, width: 640 },
            { name: "med", suffix: "_1x", quality: 60, width: 600 },
            { name: "med", suffix: "_2x", quality: 60, width: 1200 },
            { name: "large", suffix: "_1x", quality: 60, width: 900 },
            { name: "large", suffix: "_2x", quality: 60, width: 1800 },
          ]
        },
        files: [{
          expand: true,
          src: ['*.{gif,jpg,png}'],
          cwd: 'img',
          dest: 'img/'
        }]
      }
    },
    /* Generate the images directory if it is missing */
    mkdir: {
      dev: {
        options: {
          create: ['img']
        },
      },
    },
    /* Copy the "fixed" images that don't go through processing into the images/directory */
    copy: {
      dev: {
        files: [{
          expand: true,
          src: 'images_src/fixed/*.{gif,jpg,png}',
          dest: 'img/'
        }]
      },
    },//do I need this comma?
  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.registerTask('default', ['mkdir', 'copy', 'responsive_images']);
};
