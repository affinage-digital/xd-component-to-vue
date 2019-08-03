<template>
    <form method="dialog">
        <h1 v-html="manifest.name"></h1>
        <div class="notification" v-show="notification.text.length > 0"
            :style="{ color: notification.color }"
            v-html="notification.text"></div>
        <hr />

        <!-- <p>
            <b>Standard:</b>
            <button uxp-variant="cta">Call To Action</button>
            <button uxp-variant="primary">Primary</button>
            <button uxp-variant="secondary">Secondary</button>
            <button uxp-variant="warning">Warning</button>
        </p>
        <p>
            <b>Quiet:</b>
            <button uxp-quiet="true" uxp-variant="primary">Primary (Quiet)</button>
            <button uxp-quiet="true" uxp-variant="secondary">Secondary (Quiet)</button>
            <button uxp-quiet="true" uxp-variant="warning">Warning (Quiet)</button>
        </p> -->

        <div class="menu">
            <button :uxp-quiet="!isFirstTab" :uxp-variant="isFirstTab ? 'cta' : 'secondary'" @click="isFirstTab = true">Components</button>
            <button :uxp-quiet="isFirstTab" :uxp-variant="!isFirstTab ? 'cta' : 'secondary'" @click="isFirstTab = false">Variables</button>
        </div>
        <hr />

        <div :class="{ 'h-hide': !isFirstTab }">
            <p>
                Button has been clicked times.
            </p>
        </div>

        <div class="variables" :class="{ 'h-hide': isFirstTab }">
            <div class="variables__left">
                <h2>Color variables</h2>
                <textarea readonly v-model="scssVariables"></textarea>
                <button uxp-quiet="true" uxp-variant="primary" @click="copySCSSVariablesToClipboard">Copy colors</button>
            </div>

            <div class="variables__right">
                <h2>Typography</h2>
                <textarea readonly v-model="typographyVariables"></textarea>
                <button uxp-quiet="true" uxp-variant="primary" @click="copyTypographyVariablesToClipboard">Copy typography</button>
            </div>
        </div>

        <hr />
        <footer>
            <!-- <button uxp-variant="primary" @click="refresh">Refresh</button> -->
            <button uxp-variant="primary" @click="dialog.close()" type="submit">Close</button>
        </footer>
    </form>
</template>

<script>
const application = require('application');
const clipboard = require('clipboard');
const assets = require('assets');

module.exports = {
    props: {
        dialog: Object,
        manifest: Object
    },

    data() {
        return {
            notification: {
                text: '',
                color: 'red'
            },
            isFirstTab: true,
            assetsColors: [],
            assetsTypography: [],
        }
    },

    computed: {
        scssVariables: {
            get() {
                let result = '';

                this.assetsColors.forEach(color => {
                    if (color.color) {
                        let cssColor = color.color.toHex(false);
                        if (color.color.a < 255) {
                            cssColor = `rgba(${cssColor}, ${parseFloat(color.color.a / 255).toFixed(2)})`;
                        }

                        let name = color.name;
                        if (name) {
                            name = 'color' + name.charAt(0).toUpperCase() + name.substr(1);
                        } else {
                            name = 'color' + color.color.toHex(false).substr(1);
                        }

                        result += `$${name}:\t\t${cssColor};\n`;
                    }
                });

                return result;
            },
            set(newValue) {

            }
        },

        typographyVariables: {
            get() {
                let result = '';

                return result;
            },
            set(newValue) {

            }
        },
    },

    mounted() {
        // load assets
        this.assetsColors = assets.colors.get();
        this.assetsTypography = assets.characterStyles.get();

        if (this.assetsColors.filter(color => !color.name).length > 0) {
            this.showNotification({
                text: 'No-name colors available',
                color: 'red'
            });
        }
    },

    methods: {
        showNotification(notification) {
            this.notification = notification;

            setTimeout(() => {
                this.notification.text = '';
            }, 3000);
        },

        copySCSSVariablesToClipboard() {
            clipboard.copyText(this.scssVariables);

            this.showNotification({
                text: 'Colors for SCSS is now available on the clipboard',
                color: 'green'
            });
        },

        copyTypographyVariablesToClipboard() {
            clipboard.copyText(this.typographyVariables);

            this.showNotification({
                text: 'Typography for SCSS is now available on the clipboard',
                color: 'green'
            });
        }
    }
}
</script>
