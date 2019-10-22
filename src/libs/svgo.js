const { SVG2JS } = require('./custom-svgo/svg2js');
const { PLUGINS } = require('./custom-svgo/plugins');
const { JS2SVG } = require('./custom-svgo/js2svg');

const plugins = [
    {
        removeHiddenElems: true,
    },
    {
        removeEmptyText: true,
    },
    {
        removeEmptyContainers: true,
    },
    {
        cleanupEnableBackground: true,
    },
    // {
    //     convertStyleToAttrs: true,
    // },
    {
        convertPathData: true,
    },
    {
        convertTransform: true,
    },
    {
        collapseGroups: true,
    },
    {
        sortAttrs: {
            order: [
                'viewBox',
                'fill', 'stroke', 'marker',
                'id',
                'x', 'x1', 'x2',
                'y', 'y1', 'y2',
                'width', 'height',
                'cx', 'cy', 'r',
                'd', 'points',
                'xmlns'
            ],
            xmlnsOrder: false,
        },
    },
    {
        removeDimensions: true,
    },
    {
        removeStyleElement: true,
    },
    {
        removeAttrs: {
            attrs: ['id', 'class', 'style', 'data-name'], // removeAttrs: {attrs: '(stroke|fill)'},
        },
    },
    {
        vueCleaner: true,
    },
];

const preparePlugins = () => {
    return plugins.map(plugin => {
        const name = Object.keys(plugin)[0];
        const params = plugin[name];

        const pluginTemp = require(`./custom-svgo/plugins/${ name }`);
        if (typeof params === 'object') {
            pluginTemp.params = Object.assign(pluginTemp.params, params);
        }

        pluginTemp.active = true;

        return [Object.assign({}, pluginTemp)];
    });
};

const svgo = svgstr => {
    let result = '';

    let svgjs;

    SVG2JS(svgstr, object => {
        svgjs = object;
    });

    svgjs = PLUGINS(svgjs, preparePlugins(plugins));

    result = new JS2SVG().convert(svgjs);

    return result;
};

exports.svgo = svgo;