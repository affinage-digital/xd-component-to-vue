<template>
    <form method="dialog">
        <a ref="linkForFakeClick" class="h-hide" href="javascript:;">for fake click to clipboard</a>

        <h1 v-html="manifest.name"></h1>
        <div class="notification" v-show="notification.text.length > 0"
            :style="{ color: notification.color }"
            v-html="notification.text"></div>
        <hr />

        <div class="menu">
            <button :uxp-quiet="!isFirstTab" :uxp-variant="isFirstTab ? 'cta' : 'secondary'" @click="isFirstTab = true">Components</button>
            <button :uxp-quiet="isFirstTab" :uxp-variant="!isFirstTab ? 'cta' : 'secondary'" @click="isFirstTab = false">Variables</button>
        </div>
        <hr />

        <div class="components" :class="{ 'h-hide': !isFirstTab }">
            <div class="components__left">
                <h2>Settings</h2>

                <div class="components__row">
                    <label for="option-only-master">Only Master components</label>
                    <input id="option-only-master" type="checkbox" v-model="options.onlyMasterComponent" @change="changeOnlyMastersComponent" />
                </div>

                <div class="components__row components__row--mr8">
                    <label for="option-tab-size">Tab size</label>
                    <input id="option-tab-size" uxp-quiet="true" type="number" v-model="options.tabSize" @input="changeComponent" />
                </div>

                <div class="components__row">
                    <label for="option-use-typograf">Use typograf for texts</label>
                    <input id="option-use-typograf" type="checkbox" v-model="options.useTypograf" @change="changeComponent" />
                </div>
            </div>

            <div class="components__center">
                <h2>Component</h2>

                <select ref="componentSelect" @change="changeComponent">
                    <option disabled selected>Choose component</option>
                    <option v-for="item in components" :key="item.guid"
                        :value="item.guid"
                        :selected="currentComponent.node && item.guid === currentComponent.node.guid"
                        v-html="`${ item.artboardName } // ${ item.name }`"></option>
                </select>

                <div class="components__center-preview">
                    <img :src="currentComponent.preview" />
                </div>
            </div>

            <div class="components__right">
                <h2 v-html="`${currentComponent.node ? currentComponent.name : 'Choose component for export to *.vue'}`"></h2>

                <textarea readonly v-model="currentComponent.html"></textarea>

                <div class="components__right-buttons">
                    <button uxp-quiet="true" uxp-variant="primary" @click="copyComponentToClipboard">Copy component</button>
                    <button uxp-quiet="true" uxp-variant="primary" @click="saveComponent">Save to file</button>
                </div>
            </div>
        </div>

        <div class="variables" :class="{ 'h-hide': isFirstTab }">
            <div class="variables__left">
                <h2>Color variables</h2>
                <textarea readonly v-model="scssVariables"></textarea>
                <div>
                    <button uxp-quiet="true" uxp-variant="primary" @click="copySCSSVariablesToClipboard">Copy colors</button>
                </div>
            </div>

            <div class="variables__right">
                <h2>Typography</h2>
                <textarea readonly v-model="typographyVariables"></textarea>
                <div>
                    <button uxp-quiet="true" uxp-variant="primary" @click="copyTypographyVariablesToClipboard">Copy typography</button>
                </div>
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
const { 
    SymbolInstance, 
    Group, 
    RepeatGrid, 
    LinkedGraphic, 
    Artboard, 
    Rectangle, 
    Ellipse, 
    Polygon, 
    Line, 
    Path, 
    BooleanGroup, 
    Text
} = require('scenegraph'); // https://adobexdplatform.com/plugin-docs/reference/scenegraph.html#scenegraph
const { generateVue } = require('./helpers/generate-vue');
const { saveComponentAsFile } = require('./helpers/save-file');
const { createPreviewOfComponent } = require('./helpers/component-preview');
const { getFontParameters } = require('./helpers/fonts');

module.exports = {
    props: {
        dialog: Object,
        elementForCopy: Object,
        manifest: Object,
        selection: Object,
        documentRoot: Object,
        copyToClipboard: Function,
    },

    data() {
        return {
            notification: {
                text: '',
                color: 'red',
            },
            isFirstTab: true,
            assetsColors: {},
            assetsTypography: [],
            currentComponent: {
                node: null,
                name: '',
                preview: '',
                html: '',
            },
            options: {
                onlyMasterComponent: false,
                tabSize: 4,
                useTypograf: false,
            }
        }
    },

    computed: {
        components() {
            const components = [];

            const push = component => {
                if (this.options.onlyMasterComponent && !component.isMaster) return;

                // check artboard name if exist
                let artboardName = 'Canvas';

                let tempNode = component;
                const parentsType = [];
                while (tempNode) {
                    if (tempNode.constructor.name === 'Artboard') {
                        artboardName = tempNode.name;
                    }
                    tempNode = tempNode.parent;
                }

                components.push({
                    guid: component.guid,
                    name: component.name + (component.isMaster ? ' (master)' : ''),
                    artboardName,
                    component,
                });
            };

            // parsing project
            const finderSymbolInstance = rootNode => {
                rootNode.children.forEach(node => {
                    if (node instanceof SymbolInstance) {
                        push(node);
                    }

                    if (node.children.length > 0) {
                        finderSymbolInstance(node);
                    }
                });
            };

            finderSymbolInstance(this.documentRoot);

            return components;
        },

        scssVariables: {
            get() {
                let result = '';
                
                for (const color in this.assetsColors) {
                    result += `${ this.assetsColors[color] }:\t\t${ color };\n`;
                }

                return result;
            },
            set(newValue) {

            }
        },

        typographyVariables: {
            get() {
                let result = `@mixin fontface($family, $localname, $localname2, $filename, $weight, $style) {
    @font-face {
        font-display: swap;
        font-family: $family;
        src: local('#{$localname}'),
            local('#{$localname2}'),
            url('/assets/fonts/#{$filename}.woff2') format('woff2'),
            url('/assets/fonts/#{$filename}.woff') format('woff');
        font-weight: $weight;
        font-style: $style;
    }
}\n\n`;

                this.assetsTypography.forEach(({ style }) => {
                    const { fontWeight, fontStyle } = getFontParameters(style.fontStyle.toLowerCase());

                    const family = style.fontFamily;
                    const localname = `${ style.fontFamily } ${ style.fontStyle }`;
                    const localname2 = `${ style.fontFamily }-${ style.fontStyle }`.replace(/\ /g, '');
                    const filename = `${ style.fontFamily + style.fontStyle }`.replace(/\ /g, '');

                    result += `@include fontface(${ family }, ${ localname }, ${ localname2 }, ${ filename }, ${ fontWeight }, ${ fontStyle });\n`
                });

                return result;
            },
            set(newValue) {

            }
        },
    },

    mounted() {
        this.loadUI();
    },

    methods: {
        loadUI() {
            // load assets
            this.parseAssetsColors();
            this.assetsTypography = assets.characterStyles.get();

            // set currentComponent
            const items = this.selection.itemsIncludingLocked;
            if (items.length === 1 && items[0] instanceof SymbolInstance) {
                this.currentComponent.node = items[0]; // for selected option in select-dropdown
            } else {
                this.$refs.componentSelect.selectedIndex = 0; // reset select-dropdown
            }

            this.$nextTick(() => {
                this.changeComponent(); // for generate html
            });
        },

        showNotification(notification) {
            this.notification = notification;

            setTimeout(() => {
                this.notification.text = '';
            }, 3000);
        },

        parseAssetsColors() {
            const tempColors = assets.colors.get();

            if (tempColors.filter(color => !color.name).length > 0) {
                this.showNotification({
                    text: 'No-name colors available',
                    color: 'red',
                });
            }

            tempColors.forEach(color => {
                if (color.color) {
                    let cssColor = color.color.toHex(false);
                    if (color.color.a < 255) {
                        cssColor = `rgba(${cssColor}, ${parseFloat(color.color.a / 255).toFixed(2)})`;
                    }

                    let name = color.name;
                    if (name) {
                        name = '$color' + name.charAt(0).toUpperCase() + name.substr(1);
                    } else {
                        name = '$color' + color.color.toHex(false).substr(1);
                    }

                    this.$set(this.assetsColors, cssColor, name);
                }
            });
        },

        changeOnlyMastersComponent() {
            setTimeout(() => {
                this.changeComponent();
            }, 33);
        },

        changeComponent() {
            if (this.$refs.componentSelect.value === undefined) {
                this.$refs.componentSelect.selectedIndex = 0;
            }

            const searchedComponents = this.components.filter(o => o.guid === this.$refs.componentSelect.value);

            if (searchedComponents.length > 0) {
                this.currentComponent.node = searchedComponents[0].component;
            } else {
                this.currentComponent.node = null;
            }

            if (this.currentComponent.node) {
                const { html } = generateVue(this.currentComponent.node, this.options);
                this.currentComponent.name = this.currentComponent.node.name + (this.currentComponent.node.isMaster ? ' (master)' : '');
                this.currentComponent.html = html;

                createPreviewOfComponent(this.currentComponent.node).then(base64string => {
                    this.currentComponent.preview = base64string;
                });
            } else {
                this.currentComponent.name = '';
                this.currentComponent.preview = '';
                this.currentComponent.html = '';
            }
        },

        saveComponent() {
            saveComponentAsFile(this.currentComponent.name, this.currentComponent.html).then(() => {
                this.showNotification({
                    text: 'Component successfully saved!',
                    color: 'green',
                });
            });
        },

        copyComponentToClipboard() {
            this.copyToClipboard(this.currentComponent.html);

            this.showNotification({
                text: 'Vue template of component is now available on the clipboard',
                color: 'green',
            });
        },

        copySCSSVariablesToClipboard() {
            this.copyToClipboard(this.scssVariables);

            this.showNotification({
                text: 'Colors for SCSS is now available on the clipboard',
                color: 'green',
            });
        },

        copyTypographyVariablesToClipboard() {
            this.copyToClipboard(this.typographyVariables);

            this.showNotification({
                text: 'Typography for SCSS is now available on the clipboard',
                color: 'green',
            });
        }
    }
}
</script>
