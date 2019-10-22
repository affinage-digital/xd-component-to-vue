const { 
    SymbolInstance, 
    Group, 
    // RepeatGrid, 
    // LinkedGraphic, 
    // RootNode,
    // Artboard, 
    Rectangle, 
    // Ellipse, 
    // Polygon, 
    // Line, 
    // Path, 
    // BooleanGroup, 
    Text
} = require('scenegraph');
const { standardizeString } = require('./standardize-string');
const { getStylesForRectangle } = require('./parse-rectangle');
const { getStylesForText } = require('./parse-text');
const { parseSVG } = require('./parse-svg');
const { typografText } = require('../libs/typograf');

const parseLayers = (xdNode, domArray, componentName, options) => {
    const arrayOfPromises = [];

    xdNode.children.forEach(xdNode => {
        let classElementName = '__';

        // if layer has auto-generated string (e.g. "Rectangle 5" or text substring)
        if (xdNode.hasDefaultName) {
            classElementName += xdNode.guid.replace(/-/g, '');
        } else {
            classElementName += standardizeString(xdNode.name);
        }

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

        let canPlace = false; // can we add element to domArray? need for skip unknown type of node

        // simple group
        if (xdNode instanceof Group) {
            canPlace = true;

            let promise;

            // export svg as inline-svg
            if (classElementName.indexOf('__svg') === 0) {
                promise = parseSVG(xdNode).then(html => {
                    nodeObject.attributes.html = html;
                });
            } else {
                promise = parseLayers(xdNode, nodeObject.childrens, componentName, options).then(domArray2 => {
                    nodeObject.childrens = domArray2;
                });
            }

            arrayOfPromises.push(promise);
        }

        // insert the component in the component as a component <componentName />
        else if (xdNode instanceof SymbolInstance) {
            canPlace = true;
            nodeObject.tag = standardizeString(xdNode.name);
            delete nodeObject.attributes.class;
        }

        else if (xdNode instanceof Rectangle) {
            canPlace = true;
            nodeObject.attributes.styles = getStylesForRectangle(xdNode);
        }

        else if (xdNode instanceof Text) {
            canPlace = true;
            nodeObject.attributes.html = options.useTypograf ? typografText(xdNode.text) : xdNode.text.replace(/\r?\n|\r/g, '<br>');
            nodeObject.attributes.styles = getStylesForText(xdNode);
        }

        if (canPlace) {
            domArray.push(nodeObject);
        }
    });

    return Promise.all(arrayOfPromises).then(() => {
        return domArray;
    });
};

exports.parseLayers = parseLayers;
