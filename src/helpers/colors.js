const getColorName = color => {
    const { assetsColors } = require('../main').getVueAppClass();

    // first check color is fill or simple color object
    // https://adobexdplatform.com/plugin-docs/reference/LinearGradientFill.html
    if (color.colorStops) {
        let gradientArray = [];

        color.colorStops.forEach(color2 => {
            const tempColor = color2.color;
            let desiredColor = tempColor.toHex(false); // false - means get 3 chars if possible
            if (tempColor.a < 255) {
                desiredColor = `rgba(${ desiredColor }, ${ parseFloat(tempColor.a / 255).toFixed(2) })`;
            };

            const result = (assetsColors[desiredColor] || desiredColor) + ' ' + color2.stop * 100 + '%';

            gradientArray.push(result);
        });

        return `linear-gradient(90deg, ${ gradientArray.join(', ') })`;
    } else {
        let desiredColor = color.toHex(false); // false - means get 3 chars if possible
        if (color.a < 255) {
            desiredColor = `rgba(${ desiredColor }, ${ parseFloat(color.a / 255).toFixed(2) })`;
        };
    
        return assetsColors[desiredColor] || desiredColor;
    }
};

exports.getColorName = getColorName;