const { getColorName } = require('./colors');
const { getFontParameters } = require('./fonts');

const getStylesForText = textNode => {
    const result = {};

    if (textNode.areaBox) {
        result['width'] = textNode.areaBox.width + 'px';
    }

    result['font-family'] = textNode.fontFamily;

    result['font-size'] = textNode.fontSize + 'px';

    if (textNode.lineSpacing !== 0) {
        result['line-height'] = '(' + textNode.lineSpacing + ' / ' + textNode.fontSize + ')';
    }

    const { fontWeight, fontStyle } = getFontParameters(textNode.fontStyle.toLowerCase());

    if (fontWeight !== '400') {
        result['font-weight'] = fontWeight;
    }

    if (fontStyle !== 'normal') {
        result['font-style'] = fontStyle;
    }

    if (textNode.charSpacing !== 0) {
        result['letter-spacing'] = textNode.charSpacing / 1000 + 'em';
    }

    if (textNode.underline) {
        result['text-decoration'] = 'underline';
    }

    if (textNode.textTransform !== 'none') {
        result['text-transform'] = textNode.textTransform;
    }

    if (textNode.textAlign !== 'ALIGN_LEFT') {
        if (textNode.textAlign === 'ALIGN_CENTER') {
            result['text-align'] = 'center';
        } else if (textNode.textAlign === 'ALIGN_RIGHT') {
            result['text-align'] = 'right';
        }
    }

    result['color'] = getColorName(textNode.fill);

    return result;
};

exports.getStylesForText = getStylesForText;
