const { standardizeString } = require('./standardize-string');
const { parseLayers } = require('./parse-layers');

// creating of html-tags
const createElement = (tag, attributes, ...children) => {
    const element = document.createElement(tag);

    if (attributes) {
        for (let name in attributes) {
            const value = attributes[name];

            if (name === 'styles') {
                // Object.assign(element.style, value); // dont need add inline-styles
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

        if (object.childrens.length > 0) {
            string = generateSCSS(string + '\n\n', object.childrens, level);
        }
    });

    return string;
};

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

const generateVue = component => {
    const name = standardizeString(component.name);

    // parsing the component to get html and scss
    const domArray = parseLayers(component, [], name);

    // generate styles
    const scss = generateSCSS('', domArray, 1);

    // create the root element
    const root = generateHTML(document.createElement('div'), domArray);
    root.setAttribute('class', name);

    // convert html to formatted string
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
