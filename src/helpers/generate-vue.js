const { standardizeString } = require('./standardize-string');
const { parseLayers } = require('./parse-layers');

const generateSCSS = (nodesArray, level, tabSize) => {
    const indent = new Array(level + 1).join(' '.repeat(tabSize));
    const indentStyles = new Array(level + 2).join(' '.repeat(tabSize));

    const array = [];

    nodesArray.forEach((object, i) => {
        const hasClass = !!object.attributes.class;

        if (hasClass) { // do not process nested components
            let string = indent + '&' + object.classElementName + ' {\n';
            for (let name in object.attributes.styles) {
                const value = object.attributes.styles[name];
                string += indentStyles + name + ': ' + value + ';\n';
            }
            string += indent + '}';

            array.push(string);
            
            if (object.childrens.length > 0) {
                array.push(...generateSCSS(object.childrens, level, tabSize));
            }
        }
    });

    return array;
};

// creating of html-tags
const createElement = (tag, attributes) => {
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

    return element;
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

const formatHTML = (node, level, tabSize) => {
    const indentBefore = new Array(level++ + 1).join(' '.repeat(tabSize));
    const indentAfter = new Array(level - 1).join(' '.repeat(tabSize));
    let textNode;

    for (let i = 0; i < node.children.length; i++) {
        textNode = document.createTextNode('\n' + indentBefore);
        node.insertBefore(textNode, node.children[i]);

        formatHTML(node.children[i], level, tabSize);

        if (node.lastElementChild === node.children[i]) {
            textNode = document.createTextNode('\n' + indentAfter);
            node.appendChild(textNode);
        }
    }

    return node;
};

const generateVue = (component, options) => {
    const name = standardizeString(component.name);

    // parsing the component to get html and scss
    return parseLayers(component, [], name, options).then(domArray => {
        // generate styles
        const scss = generateSCSS(domArray, 1, options.tabSize).join('\n\n');

        // create the root element
        const root = generateHTML(document.createElement('div'), domArray);
        root.setAttribute('class', name);

        // convert html to formatted string
        var div = document.createElement('div');
        div.innerHTML = root.outerHTML;

        let formattedHTML = formatHTML(div, 1, options.tabSize).innerHTML;
        formattedHTML = formattedHTML.replace(/><\/path>/g, ' />');

        // change to self-closed tag
        formattedHTML = formattedHTML.split('\n').map(str => {
            if (str.indexOf('<div') === -1 && str.indexOf('></') > 0) {
                // potentially component
                const array = str.split('></');
                array[1] = ' />';
                return array.join('');
            } else {
                return str;
            }
        }).join('\n');

        let html = `<template>${ formattedHTML }</template>

<script>
export default {};
</script>

<style lang="scss">
.${ name } {
${ scss }
}
</style>
`;

        return html;
    });
};

exports.generateVue = generateVue;
