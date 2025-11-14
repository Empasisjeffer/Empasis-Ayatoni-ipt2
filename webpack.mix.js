const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | We are compiling React (JSX) and SCSS into public/js and public/css.
 |
 */

mix.js('resources/js/app.js', 'public/js')
   .react() // <-- important for React JSX
   .sass('resources/sass/app.scss', 'public/css')
   .version();
