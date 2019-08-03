const styles = require('./styles.css'); // добавляем стили для dialog
const Vue = require('vue').default;
const app = require('./app.vue').default;
const manifest = require('../manifest.json');

let dialog;

const getDialog = selection => {
    if (!dialog) {
        document.body.insertAdjacentHTML('beforeend', '<dialog><div id="container"></div></dialog>');

        dialog = document.querySelector('dialog');

        new Vue({
            el: '#container',
            components: {
                app,
            },
            data() {
                return {
                    dialog,
                    manifest,
                };
            },
            render(h) {
                return h(app, { 
                    props: { 
                        dialog, 
                        manifest,
                    },
                });
            }
        });
    }

    return dialog;
};

module.exports = {
    commands: {
        exportToVue: selection => {
            getDialog(selection).showModal();
        }
    }
};