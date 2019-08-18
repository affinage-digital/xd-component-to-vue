const styles = require('./styles.css'); // add style for dialog
const Vue = require('vue').default;
const app = require('./app.vue').default;
const manifest = require('../manifest.json');
const application = require('application');
const clipboard = require('clipboard');

let dialog;
let appVue;

const getDialog = (selection, documentRoot) => {
    if (!dialog) {
        document.body.insertAdjacentHTML('beforeend', '<dialog><div id="container"></div></dialog>');

        dialog = document.querySelector('dialog');

        Vue.mixin({
            methods: {
                copy: str => {
                    application.editDocument(selection2 => {
                        console.log(selection2);

                        //clipboard.copyText('selection.items[0].name333');
                    });
                },
            },
        });

        appVue = new Vue({
            el: '#container',
            components: {
                app,
            },
            data() {
                return {
                    dialog,
                    manifest,
                    selection,
                    documentRoot,
                };
            },
            render(h) {
                return h(app, { 
                    props: { 
                        dialog, 
                        manifest,
                        selection,
                        documentRoot,
                    },
                });
            }
        });
    }

    return dialog;
};

module.exports = {
    getVueAppClass: () => {
        return appVue.$children[0]; // for get actual app in inner js files from webpack require()
    },
    commands: {
        exportToVue: (selection, documentRoot) => {
            getDialog(selection, documentRoot).showModal();
        }
    }
};