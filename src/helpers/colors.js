const getColorName = color => {
    const { assetsColors } = require('../main').getVueAppClass();
    
    let desiredColor = color.toHex(false); // false - means get 3 chars if possible
    if (color.a < 255) {
        desiredColor = `rgba(${desiredColor}, ${parseFloat(color.a / 255).toFixed(2)})`;
    };

    return assetsColors[desiredColor] || desiredColor;
};

exports.getColorName = getColorName;