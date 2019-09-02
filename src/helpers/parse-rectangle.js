const { getColorName } = require('./colors');

const getStylesForRectangle = rectangleNode => {
    const result = {};

    result['width'] = rectangleNode.width + 'px';

    if (rectangleNode.strokeEnabled) {
        result['border'] = rectangleNode.strokeWidth + 'px solid ' + getColorName(rectangleNode.stroke);
    }

    if (rectangleNode.hasRoundedCorners) {
        const { topLeft, topRight, bottomRight, bottomLeft } = rectangleNode.cornerRadii;
        if (topLeft === topRight && topLeft === bottomRight && topLeft === bottomLeft) {
            result['border-radius'] = topLeft + 'px';
        } else {
            result['border-radius'] = '';
            result['border-radius'] += topLeft === 0 ? '0 ' : topLeft + 'px ';
            result['border-radius'] += topRight === 0 ? '0 ' : topRight + 'px ';
            result['border-radius'] += bottomRight === 0 ? '0 ' : bottomRight + 'px ';
            result['border-radius'] += bottomLeft === 0 ? '0' : bottomLeft + 'px';
        }
    }

    if (rectangleNode.fillEnabled) {
        result['background'] = getColorName(rectangleNode.fill);
    }

    return result;
};

exports.getStylesForRectangle = getStylesForRectangle;
