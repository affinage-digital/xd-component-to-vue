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
} = require('scenegraph');

// создание html-тегов
const createElement = (tag, attributes, ...children) => {
    const element = document.createElement(tag);

    if (attributes) {
        for (let name in attributes) {
            const value = attributes[name];

            if (name === 'styles') {
                // Object.assign(element.style, value); // не нужно добавлять стили в html
            } else if (name === 'html') {
                element.innerHTML = value;
            } else {
                element.setAttribute(name, value);
            }
        }
    }

    // for (let child of children) {
    //     element.appendChild(typeof child === 'object' ? child : document.createTextNode(child));
    // }

    return element;
};

exports.createElement = createElement;

const standardizeString = string => {
    return string.toLowerCase().replace(/\ /g, '-');
};

exports.standardizeString = standardizeString;

const parseLayers = (xdNode, domArray, componentName) => {
    xdNode.children.forEach(xdNode => {
        const classElementName = '__' + standardizeString(xdNode.name);

        const nodeObject = {
            tag: 'div',
            attributes: {
                class: componentName + classElementName,
                styles: {},
                html: '',
            },
            classElementName,
            childrens: []
        };

        let canPlace = false;

        // simple group
        if (xdNode instanceof Group) {
            canPlace = true;
            nodeObject.childrens = parseLayers(xdNode, nodeObject.childrens, componentName);
        }

        // компонент в компоненте вставляем как компонент <component />
        else if (xdNode instanceof SymbolInstance) {

        }

        else if (xdNode instanceof RepeatGrid) {

        }

        else if (xdNode instanceof LinkedGraphic) {

        }

        // else if (node instanceof RootNode) {

        // }

        // GraphicNode
        // else if (node instanceof Artboard) {

        // }

        else if (xdNode instanceof Rectangle) {
            canPlace = true;
            nodeObject.attributes.styles = {
                'width': xdNode.width + 'px',
                'border': xdNode.strokeWidth + 'px solid ' + xdNode.stroke.toHex(false),
                'border-radius': xdNode.hasRoundedCorners ? xdNode.cornerRadii.topLeft + 'px' : '',
                'background': xdNode.fill.toHex(false)
            };
        }

        // else if (node instanceof Ellipse) {

        // }

        // else if (node instanceof Polygon) {

        // }

        else if (xdNode instanceof Line) {

        }

        // else if (node instanceof Path) {

        // }

        // else if (node instanceof BooleanGroup) {

        // }

        else if (xdNode instanceof Text) {
            canPlace = true;
            nodeObject.attributes.html = xdNode.text;
            if (xdNode.areaBox) {
                nodeObject.attributes.styles['width'] = xdNode.areaBox.width + 'px';
            }
            nodeObject.attributes.styles['font-family'] = xdNode.fontFamily;
            nodeObject.attributes.styles['font-size'] = xdNode.fontSize + 'px';
            if (xdNode.lineSpacing !== 0) {
                nodeObject.attributes.styles['line-height'] = '(' + xdNode.lineSpacing + ' / ' + xdNode.fontSize + ')';
            }
            // nodeObject.attributes.styles['font-weight'] = xdNode.fontStyle,
            nodeObject.attributes.styles['font-style'] = xdNode.fontStyle; // здесь нужно парсить слова 'Regular' Narrow Italic и т.д.
            if (xdNode.charSpacing !== 0) {
                nodeObject.attributes.styles['letter-spacing'] = xdNode.charSpacing + 'em';
            }
            if (xdNode.underline) {
                nodeObject.attributes.styles['text-decoration'] = 'underline';
            }
            if (xdNode.textTransform !== 'none') {
                nodeObject.attributes.styles['text-transform'] = xdNode.textTransform;
            }
            if (xdNode.textAlign !== 'ALIGN_LEFT') {
                if (xdNode.textAlign === 'ALIGN_CENTER') {
                    nodeObject.attributes.styles['text-align'] = 'center';
                } else if (xdNode.textAlign === 'ALIGN_RIGHT') {
                    nodeObject.attributes.styles['text-align'] = 'right';
                }
            }
            nodeObject.attributes.styles['color'] = xdNode.fill.toHex(false);
        }

        if (canPlace) {
            domArray.push(nodeObject);
        }
    });

    return domArray;
};

exports.parseLayers = parseLayers;

const generateSCSS = (string, nodesArray, level) => {
    const indent = new Array(level + 1).join('    ');
    const indentStyles = new Array(level + 2).join('    ');

    nodesArray.forEach((object, i) => {
        string += indent + '&' + object.classElementName + ' {\n';
        for (let name in object.attributes.styles) {
            const value = object.attributes.styles[name];
            string += indentStyles + name + ': ' + value + ';\n';
        }
        string += indent + '}';

        if (i !== nodesArray.length - 1) {
            string += '\n\n';
        }

        // if (object.childrens.length > 0) {
        //     generateSCSS(element, object.childrens);
        // }
    });

    return string;
};

exports.generateSCSS = generateSCSS;

const generateHTML = (parent, nodesArray) => {
    nodesArray.forEach(object => {
        const element = createElement(object.tag, object.attributes);
        parent.insertAdjacentElement('beforeend', element);

        if (object.childrens.length > 0) {
            generateHTML(element, object.childrens);
        }
    });

    return parent;
};

exports.generateHTML = generateHTML;

const formatHTML = (node, level) => {
    const indentBefore = new Array(level++ + 1).join('    ');
    const indentAfter = new Array(level - 1).join('    ');
    let textNode;

    for (let i = 0; i < node.children.length; i++) {
        textNode = document.createTextNode('\n' + indentBefore);
        node.insertBefore(textNode, node.children[i]);

        formatHTML(node.children[i], level);

        if (node.lastElementChild === node.children[i]) {
            textNode = document.createTextNode('\n' + indentAfter);
            node.appendChild(textNode);
        }
    }

    return node;
};

exports.formatHTML = formatHTML;

const generateVue = component => {
    const name = standardizeString(component.name);

    // парсим главный объект чтобы получить html
    const domArray = parseLayers(component, [], name);

    // генерируем стили
    const scss = generateSCSS('', domArray, 1);

    // создаем корневой элемент
    const root = generateHTML(document.createElement('div'), domArray);
    root.setAttribute('class', name);

    // конвертируем html в красивую строку
    var div = document.createElement('div');
    div.innerHTML = root.outerHTML;

    let html = `<template>${formatHTML(div, 1).innerHTML}</template>

<script>
export default {};
</script>

<style lang="scss">
.${name} {
${scss}
}
</style>
`;
    
    return { name, html };
};

exports.generateVue = generateVue;