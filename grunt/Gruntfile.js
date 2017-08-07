/*

UTILISATION :

- Watch
    grunt

- Déploiement recette :
    grunt recette

- Concaténation JS :
    grunt concat

- Minification JS :
    grunt minjs

- Packaging :
    grunt package -tag=1.1.5

*/


module.exports = function(grunt) {
    var app = 'project'; // Application name
    var env = grunt.option('env') || 'dev'; // Environnement
    var tag = grunt.option('tag') || null; // Tag
    var production = grunt.option('production') || false; // Production
    var paramForce = grunt.option('force') || false;
    var local = grunt.option('local') || false; // Recette

    // CHEMIN d'accès au répertoire COMMUN
    var pathToCommun = '../../commun/';
    // CHEMINS d'accès aux répertoires projets
    var pathsToProject = '../';
    
    // CHEMINS pour les déploiement sur plateform de recette
    
    // Mac OS Path
    var pathToSrvIIS02 = "/Volumes/wwwroot/ressources/";
    
    // Windows Path
    if (process.platform == 'win32')
        pathToSrvIIS02 = "\\\\srv-iis02\\wwwroot\\ressources\\";

    // SOURCES JS
    var sourcesJS = {
        'main' : [
            // JQUERY
            pathToCommun        + 'js/jquery/jquery-2.1.3/jquery-2.1.3.min.js',
            pathToCommun        + 'js/jquery-ui/jquery-ui-1.10/jquery-ui-1.10.3.1.custom.min.js',
            pathToCommun        + 'js/jquery/jquery.confirm/jquery.confirm_4.0.js',

            // EXTERNALS
            pathsToProject + '_sources/js/plugins/cookies/jquery.cookie.js',
            pathsToProject + '_sources/js/plugins/validate/jquery.validate.js',
            pathsToProject + '_sources/js/plugins/unobtrusive/jquery.validate.unobtrusive.js',
            pathsToProject + '_sources/js/plugins/unobtrusive/jquery.unobtrusive-ajax.min.js',

            // SCRIPTS ASPX
            pathsToProject + '_sources/js/classes/bouton/bouton_1.00.class.js',
            pathsToProject + '_sources/js/classes/form/jquery.form_4.00.js',
            pathsToProject + '_sources/js/scripts.js'
        ]
    };


    // CONF commune copy for tag
    var confCopyTag = {
        main: {
            files: [
                { expand: true, cwd: pathsToProject + '/', src: ['css/**'], dest: pathsToProject + '/tags/' + tag + '/'},
                { expand: true, cwd: pathsToProject + '/', src: ['js/**'], dest: pathsToProject + '/tags/' + tag + '/'},
                { expand: true, cwd: pathsToProject + '/', src: ['img/**'], dest: pathsToProject + '/tags/' + tag + '/'},
                { expand: true, cwd: pathsToProject + '/', src: ['fonts/**'], dest: pathsToProject + '/tags/' + tag + '/'}
            ]
        },
        recette: {
             files: [
                { expand: true, cwd: pathsToProject + '/', src: ['css/**'], dest: pathToSrvIIS02 + app },
                { expand: true, cwd: pathsToProject + '/', src: ['js/**'], dest: pathToSrvIIS02 + app },
                { expand: true, cwd: pathsToProject + '/', src: ['img/**'], dest: pathToSrvIIS02 + app },
                { expand: true, cwd: pathsToProject + '/', src: ['fonts/**', '!fonts/web.config'], dest: pathToSrvIIS02 + app },
                { expand: true, cwd: pathsToProject + '/', src: ['integration/**'], dest: pathToSrvIIS02 + app }
            ]
        }
    };


    // CONFIGURATION de l'application
    var conf = {
        pkg: grunt.file.readJSON('package.json'),
        // SASS
        sass: {
            dist: {
                options: {
                    // includePaths: require('node-bourbon').with('other/path', 'another/path')
                    // - or -
                    includePaths: require('node-bourbon').includePaths,
                    outputStyle: 'compressed'
                },
                files: {
                    '../css/screen.css': '../_sources/css/screen.scss'
                }
            }
        },
        // POSTCSS (Autoprefixer)
        postcss: {
            options: {
                processors: [
                    require('autoprefixer')({ browsers: 'last 2 versions' })
                ]
            },
            dist: {
                src: '../css/screen.css'
            }
        },
        // SPRITES
        sprite: {
            pictos: {
                src: '../img/sprites/pictos/*.png',
                dest: '../img/sprite-pictos.png',
                destCss: '../_sources/css/sprites/_sprite-pictos.scss',
                imgPath: '../img/sprite-pictos.png'
            },
            pictos2x: {
                src: '../img/sprites/pictos2x/*.png',
                dest: '../img/sprite-pictos2x.png',
                destCss: '../_sources/css/sprites/_sprite-pictos2x.scss',
                imgPath: '../img/sprite-pictos2x.png'
            }
        },
        // IMAGE MIN
        imagemin: {                          // Task
            static: {
                files: {                         // Dictionary of files
                    '../img/sprite-pictos.png': '../img/sprite-pictos.png', // 'destination': 'source'
                    '../img/sprite-pictos2x.png': '../img/sprite-pictos2x.png'
                }
            }
        },
        // CONCAT
        concat: {
            project: {
                options: {
                    separator: "\n\n"
                },
                files: {
                    "../js/main.js": sourcesJS.main
                }
            }
        },
        // UGLIFY
        uglify: {
            min: {
                files: {
                    "../js/main.min.js": ["../js/main.js"]
                }
            }
        },
        // BROWSERSYNC
        browserSync: {
            dev: {
                bsFiles: {
                    src: [
                        pathsToProject + 'css/**/*.css',
                        pathsToProject + 'js/**/*.js'
                    ]
                },
                options: {
                    watchTask: true,
                    open: 'external',
                    proxy: 'localhost:REPLACE_BY_PROJECT_PORT',
                    port: 1337
                }
            }
        },
        // WATCH
        watch: {
            grunt: { files: ['Gruntfile.js'] },
            css: {
                files: pathsToProject + '_sources/css/**/*.scss',
                tasks: ['sprite', 'sass', 'postcss']
            },
            js: {
                files: sourcesJS.main,
                tasks: ['concat']
            }
        },
        // CREATE TAG
        copy: confCopyTag
    };


    // CHARGEMENT DE LA CONF GRUNT

    // To use grunt-sass
    require('load-grunt-tasks')(grunt);

    // INIT CONFIG
    grunt.initConfig(conf);

    // TASKS
    grunt.registerTask('default', ['browserSync', 'watch']);
    grunt.registerTask('minjs', ['concat', 'uglify']);
    grunt.registerTask('recette', ['sprite', 'sass', 'postcss', 'concat', 'imagemin', 'copy:recette' ] ); // déploiement vers ressources.regionsjob.dom


    // Le numéro de tag doit être renseigné et correct
    if (tag !== null && /^[1-9](.)[0-9]{2}(.)[0-9]{2}$/.test(tag)) {
        grunt.registerTask('package', ['sprite', 'sass', 'postcss', 'minjs', 'imagemin' ,'copy:main']);
    }


    // CHARGEMENT PLUGINS
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-spritesmith');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-notify');
};