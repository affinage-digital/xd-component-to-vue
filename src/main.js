const styles = require('./styles.css'); // add style for dialog
const Vue = require('vue').default;
const app = require('./app.vue').default;
const manifest = require('../manifest.json');
const clipboard = require('clipboard');

let dialog;
let appVue;

const copyToClipboard = string => {
    clipboard.copyText(string);
};

const getDialog = (selection, documentRoot) => {
    if (!dialog) {
        document.body.insertAdjacentHTML('beforeend', '<dialog><div id="container"></div></dialog>');

        dialog = document.querySelector('dialog');

        appVue = new Vue({
            el: '#container',
            components: {
                app,
            },
            render(h) {
                return h(app, {
                    props: {
                        dialog,
                        manifest,
                        selection,
                        documentRoot,
                        copyToClipboard,
                    },
                });
            }
        });
    } else {
        // just update UI dialog state and data
        appVue.$children[0].loadUI();
    }

    return dialog;
};

module.exports = {
    getVueAppClass: () => {
        return appVue.$children[0]; // for get actual app in inner js files from webpack require()
    },
    commands: {
        exportToVue: async (selection, documentRoot) => {
            await getDialog(selection, documentRoot).showModal();
        }
    }
};