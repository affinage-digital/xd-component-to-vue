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

const getFontParameters = fontStyle => {
    let tempWeight = 400;
    let tempStyle = 'normal';

    for (const key in weights) {
        if (weights[key].some(word => fontStyle.includes(word))) {
            tempWeight = key;
            break;
        }
    }

    if (fontStyle.includes('italic') || fontStyle.includes('oblique')) {
        tempStyle = 'italic';
    }

    return {
        fontWeight: tempWeight,
        fontStyle: tempStyle
    };
};

exports.getFontParameters = getFontParameters;