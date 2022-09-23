var Encore = require('@symfony/webpack-encore');
var WebpackShellPlugin = require('webpack-shell-plugin');

Encore
    // the project directory where all compiled assets will be stored
    .setOutputPath('public/build/')

    .setManifestKeyPrefix('public/build')

    // enable asset versioning, so browser caches don't need to be cleared
    .enableVersioning()

    // the public path used by the web server to access the previous directory
    .setPublicPath(Encore.isProduction() ? '/build/' : '/build/')

    // allow pug templates in vue components
    // .enableVueLoader()
    .enableVueLoader(() => {}, { runtimeCompilerBuild: false })

    // Add javascripts
    .addEntry('main', './assets/js/main/main.js')
    .addEntry('charter-search', './assets/js/main/charter-search.js')
    .addEntry('charter-view', './assets/js/main/charter-view.js')

    // allow sass/scss files to be processed
    .enableSassLoader()

    // Add stylesheets
    //.addStyleEntry('screen', './assets/scss/screen.scss')

    // provide source maps for dev environment
    .enableSourceMaps(!Encore.isProduction())

    // don't load chunks of code
    .disableSingleRuntimeChunk()

    // empty the outputPath dir before each build
    .cleanupOutputBeforeBuild()

    // enable pug templates in vue
    .addLoader({
        test: /\.pug$/,
        loader: 'pug-plain-loader'
    })
    
    // copy files
    .copyFiles({
        from: './assets/images',
        to: 'static/images/[name].[ext]'
    })
;

Encore.addAliases({ vue$: 'vue/dist/vue.esm.js' });

if (process.env.NODE_ENV === 'analyze') {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
    Encore.addPlugin(new BundleAnalyzerPlugin())
}

// further config tweaking
const config = Encore.getWebpackConfig();


// Make sure watch works
// https://github.com/symfony/webpack-encore/issues/191
// Use polling instead of inotify
config.watchOptions = {
    poll: true,
};

// Export the final configuration
module.exports = config;
