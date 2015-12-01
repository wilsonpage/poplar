// Karma configuration
// Generated on Wed May 06 2015 11:43:05 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '..',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: [
      'mocha',
      'chai-sinon'
    ],

    // list of files / patterns to load in the browser
    files: [
      'poplar.js',
      'test/*.js'
    ],

    client: {
      captureConsole: true,
      mocha: {'ui': 'tdd'}
    },

    browsers: [
      'Chrome',
      'Firefox'
    ],

    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    }
  });

  if (process.env.TRAVIS){
    config.browsers = [
      'Chrome_travis_ci',
      'Firefox'
    ];
  }

  config.set(config);
};
