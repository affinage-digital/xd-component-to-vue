<template>
    <form method="dialog">
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
                <select ref="componentSelect" @change="selectChangeComponent($event)">
                    <option disabled selected>Choose component</option>
                    <option v-for="item in components" :key="item.guid"
                        :value="item.guid"
                        :selected="currentComponent && item.guid === currentComponent.guid"
                        v-html="`${ item.artboardName } // ${ item.name }`"></option>
                </select>
                
                <div>
                    <input uxp-quiet="true" type="text" placeholder="First setting" /><!-- v-model="" -->
                </div>

                <img src="" />
            </div>

            <div class="components__right">
                <h2 v-html="`${currentComponent ? currentComponent.name : 'Choose component for export to *.vue'}`"></h2>
                <textarea readonly v-model="htmlOfComponent"></textarea>
                <div class="components__right-buttons">
                    <button uxp-quiet="true" uxp-variant="primary">Copy component</button>
                    <button uxp-quiet="true" uxp-variant="primary">Save to file</button>
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

module.exports = {
    props: {
        dialog: Object,
        manifest: Object,
        selection: Object,
        documentRoot: Object,
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
            currentComponent: null,
        }
    },

    computed: {
        components() {
            const components = [];

            // парсим проект
            // ФУНКЦИЯ СОБИРАЕТ НЕ ВСЕ КОМПОНЕНТЫ, ОНА СМОТРИТ ТОЛЬКО ПОВЕРХНОСТНО // ПЕРЕПИСАТЬ
            this.documentRoot.children.forEach(node => {
                if (node instanceof Artboard) {
                    const moreComponents = node.children.filter(artboardChild => {
                        return artboardChild instanceof SymbolInstance;
                    });
                    components.push(...moreComponents);
                } else if (node instanceof SymbolInstance) {
                    components.push(node);
                }
            });

            return components.map(o => {
                return {
                    guid: o.guid,
                    name: o.name + (o.isMaster ? ' (master)' : ''),
                    artboardName: o.parent.name, // ПЕРЕПИСАТЬ
                    component: o,
                };
            });
        },

        htmlOfComponent: {
            get() {
                // парсим текущий выбранный компонент
                let result = '';

                if (this.currentComponent) {
                    const { name, html } = generateVue(this.currentComponent);
                    result = html;
                }

                return result;
            },
            set(newValue) {

            }
        },

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

        // set currentComponent
        const items = this.selection.itemsIncludingLocked;
        if (items.length === 1 && items[0] instanceof SymbolInstance) {
            this.currentComponent = items[0];
        }
    },

    methods: {
        showNotification(notification) {
            this.notification = notification;

            setTimeout(() => {
                this.notification.text = '';
            }, 3000);
        },

        selectChangeComponent($event) {
            this.currentComponent = this.components.filter(o => o.guid === this.$refs.componentSelect.value)[0].component;
        },

        copySCSSVariablesToClipboard() {
            console.log(123);
            application.editDocument(() => clipboard.copyText(this.scssVariables))
            //clipboard.copyText(this.scssVariables);
            console.log(124);

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
