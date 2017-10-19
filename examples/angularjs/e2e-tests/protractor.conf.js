exports.config = {

    // directConnect: true,
    //
    // chromeDriver: '/Users/wangcong/Downloads/chromedriver', // download https://chromedriver.storage.googleapis.com/index.html?path=2.33/

    allScriptsTimeout: 11000,

    specs: [
    '*.js'
    ],

    capabilities: {
        'browserName': 'chrome'
    },

    baseUrl: 'http://localhost:3000/',

    framework: 'jasmine',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
    },

    onPrepare: function() {
        browser.ignoreSynchronization = true;
    }
};