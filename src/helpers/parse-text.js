const { getColorName } = require('./colors');

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

    const fontStyle = textNode.fontStyle.toLowerCase();

    // https://developer.mozilla.org/ru/docs/Web/CSS/font-weight
    const weights = {
        100: ['hairline', 'thin'],
        200: ['extra light', 'extralight', 'ultra light', 'ultralight'],
        300: ['light'],
        400: ['normal', 'regular', 'book'],
        500: ['medium'],
        600: ['semi bold', 'semibold', 'semi', 'demi bold', 'demibold', 'demi'],
        700: ['bold'],
        800: ['extra bold', 'extrabold', 'ultra bold', 'ultrabold'],
        900: ['heavy', 'black'],
    };

    let tempWeight = 0;
    for (const key in weights) {
        if (weights[key].some(word => fontStyle.includes(word))) {
            tempWeight = key;
            break;
        }
    }

    if (tempWeight > 0 && tempWeight !== '400') {
        result['font-weight'] = tempWeight;
    }

    if (fontStyle.includes('italic') || fontStyle.includes('oblique')) {
        result['font-style'] = 'italic';
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
