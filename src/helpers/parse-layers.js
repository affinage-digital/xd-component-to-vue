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
const { standardizeString } = require('./standardize-string');

const getColorName = color => {
    const { assetsColors } = require('../main').getVueAppClass();
    
    let desiredColor = color.toHex(false);
    if (color.a < 255) {
        desiredColor = `rgba(${desiredColor}, ${parseFloat(color.a / 255).toFixed(2)})`;
    };

    return assetsColors[desiredColor] || desiredColor;
};

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

        // insert the component in the component as a component <componentName />
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
                'border': xdNode.strokeWidth + 'px solid ' + getColorName(xdNode.stroke),
                'border-radius': xdNode.hasRoundedCorners ? xdNode.cornerRadii.topLeft + 'px' : '',
                'background': getColorName(xdNode.fill)
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
            nodeObject.attributes.styles['font-style'] = xdNode.fontStyle; // here you need to parse the words 'Regular' Narrow Italic etc.
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
            nodeObject.attributes.styles['color'] = getColorName(xdNode.fill);
        }

        if (canPlace) {
            domArray.push(nodeObject);
        }
    });

    return domArray;
};

exports.parseLayers = parseLayers;
