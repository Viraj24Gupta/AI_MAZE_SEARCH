// From http://www.redblobgames.com/pathfinding/a-star/
// Copyright 2014 Red Blob Games <redblobgames@gmail.com>
// License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
///<reference path="typings/tsd.d.ts" />
///<reference path="graph/grid.ts" />
///<reference path="graph/search.ts" />
///<reference path="graph/diagram.ts" />
"use strict";
// Load save buttons
var LoadSave = (function () {
    function LoadSave(parent_selector, loadCallback, saveCallback) {
        var _this = this;
        this.parent_selector = parent_selector;
        this.loadCallback = loadCallback;
        this.saveCallback = saveCallback;
        this.load_button = null;
        this.load_filename = null;
        this.save_button = null;
        this.save_filename = null;
        var parent = d3.select(parent_selector);
        var div = parent.append('div')
            .attr('class', "loadsave")
            .style('text-align', "center");
        this.load_filename = div.append('input')
            .attr('class', "filename")
            .attr('type', "file");
        this.load_button = div.append('button')
            .attr('class', "load")
            .text("Load")
            .on('click', function () { return _this.load(); });
        this.save_button = div.append('button')
            .attr('class', "save")
            .text("Save")
            .on('click', function () { return _this.save(); });
        //            <label>Filename: <input type="text" class="filename" id="text-filename" placeholder="a plain document"/>.txt</label>
        this.save_filename = div.append('input')
            .attr('type', 'text')
            .attr('class', 'filename')
            .attr('value', 'customMap.json');
    }
    LoadSave.prototype.load = function () {
        var filename = this.load_filename.node().value;
        //console.log("Load from " + filename);
        if (filename && this.load_filename.node().files.length > 0) {
            var fileToLoad = this.load_filename.node().files[0];
            var fileReader = new FileReader();
            fileReader.onload = function (fileLoadedEvent) {
                var textFromFileLoaded = fileLoadedEvent.target.result;
                this.loadCallback(textFromFileLoaded);
            }.bind(this);
            fileReader.readAsText(fileToLoad, "UTF-8");
        }
        else {
            alert("Please select file to load");
        }
    };
    LoadSave.prototype.save = function () {
        var filename = this.save_filename.node().value;
        if (!filename)
            filename = this.save_filename.attr('placeholder');
        console.log("Save to " + filename);
        this.saveCallback(filename);
    };
    return LoadSave;
})();
// Algorithm selector
var AlgorithmSelector = (function () {
    function AlgorithmSelector(parent_selector, defaultAlgorithm, selectCallback) {
        var _this = this;
        this.parent_selector = parent_selector;
        this.defaultAlgorithm = defaultAlgorithm;
        this.selectCallback = selectCallback;
        this.algorithms = ['BFS', 'DFS', 'Dijkstra', 'GreedyBest', 'A*'];
        this.select_dropdown = null;
        var parent = d3.select(parent_selector);
        var div = parent.append('div')
            .attr('class', "layer-selector")
            .style('text-align', "center");
        var select_dropdown = div.append('select')
            .on("change", function () { return _this.select(_this.select_dropdown.node().value); });
        this.select_dropdown = select_dropdown;
        this.algorithms.forEach(function (opt) {
            return select_dropdown.append('option')
                .attr('value', opt).text(opt)
                .property('selected', opt === _this.defaultAlgorithm);
        });
    }
    AlgorithmSelector.prototype.select = function (algorithm) {
        if (this.selectCallback)
            this.selectCallback(algorithm);
    };
    AlgorithmSelector.prototype.getSelected = function () {
        return this.select_dropdown.node().value;
    };
    return AlgorithmSelector;
})();
var LayerSelector = (function () {
    function LayerSelector(parent_selector, setCallback) {
        var _this = this;
        this.parent_selector = parent_selector;
        this.setCallback = setCallback;
        this.dropdown_options = ['visit_order', 'cost_so_far', 'steps', 'sort_key'];
        this.layers = [
            { name: 'backpointer', 'type': 'boolean', options: [], element: null },
            { name: 'color', 'type': 'dropdown', options: this.dropdown_options, element: null },
            { name: 'number', 'type': 'dropdown', options: this.dropdown_options, element: null }
        ];
        var parent = d3.select(parent_selector);
        this.layers.forEach(function (layer) {
            var div = parent.append('div')
                .attr('class', "layer-selector")
                .style('text-align', "center");
            var label = div.append('label').text(layer.name);
            if (layer.type == 'boolean') {
                layer.element = div.append('input')
                    .attr('type', 'checkbox')
                    .on("change", function () { return _this.set(layer.name, layer.element.node().checked); });
            }
            else if (layer.type == 'dropdown') {
                layer.element = div.append('select')
                    .on('change', function () { return _this.set(layer.name, layer.element.node().value); });
                layer.element.append('option').attr('value', '').text('-');
                layer.options.forEach(function (opt) { return layer.element.append('option').attr('value', opt).text(opt); });
            }
        });
    }
    LayerSelector.prototype.set = function (name, value) {
        if (this.setCallback)
            this.setCallback(name, value);
    };
    LayerSelector.prototype.getOptions = function () {
        var options = {};
        this.layers.forEach(function (layer) {
            if (layer.type == 'boolean') {
                options[layer.name] = layer.element.node().checked;
            }
            else if (layer.type == 'dropdown') {
                options[layer.name] = layer.element.node().value;
            }
        });
    };
    return LayerSelector;
})();
// Loading and saving of grids
function diagram_to_saved_map(diagram, exit, tile_types) {
    // Saved map
    // {
    //    graph: {
    //       width: ...
    //       height: ...
    //       edges: ...
    //       weights: ...
    //    }
    //    start: [...]
    //    end: [...]
    //    tile_types: [...]
    // }
    var map = {};
    map['graph'] = diagram.graph.to_json();
    if (diagram.options) {
        map['start'] = diagram.options.starts;
    }
    if (exit) {
        if (exit['id'] !== undefined) {
            map['exit'] = [exit.id];
        }
        else if (exit.length) {
            map['exit'] = exit;
        }
    }
    if (tile_types) {
        map['tile_types'] = tile_types;
    }
    return map;
}
function load_saved_map(json) {
    var graph = new SquareGrid(json.graph.width, json.graph.height);
    if (json.graph.tiles) {
        json.graph.tiles.forEach(function (tile) { return graph.set_tile_weights(tile['ids'], tile['weight']); });
    }
    else {
        graph.from_json(json.graph);
    }
    var tile_weights;
    if (json.tile_types) {
        tile_weights = json.tile_types.map(function (x) { return x.weight; });
    }
    else {
        tile_weights = graph.get_ordered_weights();
    }
    var exit = { id: json.exit[0] };
    var starts = json.start;
    return {
        graph: graph,
        starts: starts,
        exit: exit,
        tile_types: json.tile_types
    };
}
// Take plain text (from a <pre> section) and a set of words, and turn
// the text into html with those words marked. This code is for my own
// use and assumes that the words are \w+ with no spaces or
// punctuation etc.
function highlight_words(text, words) {
    var pattern = new RegExp("\\b(" + words.join("|") + ")\\b", 'g');
    return text.replace(pattern, "<span class='$&'>$&</span>");
}
function makeDiagram_custom_default() {
    var graph = new SquareGrid(40, 20);
    var exit = { id: graph.to_id(38, 10) };
    var starts = [graph.to_id(7, 11)];
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 40, 49, 55, 60, 65, 80, 84, 95, 105, 120, 124, 129, 140, 145, 160, 162, 163, 164, 165, 166, 169, 175, 180, 185, 200, 202, 206, 209, 215, 220, 221, 222, 224, 225, 240, 242, 246, 249, 250, 251, 255, 260, 265, 280, 282, 286, 291, 292, 294, 295, 296, 297, 299, 300, 305, 320, 322, 326, 335, 345, 360, 362, 366, 367, 368, 369, 400, 402, 409, 415, 425, 440, 449, 450, 451, 452, 455, 456, 457, 458, 459, 460, 461, 462, 464, 465, 480, 482, 489, 492, 495, 500, 505, 520, 522, 529, 535, 540, 545, 560, 562, 563, 564, 565, 566, 567, 568, 569, 572, 575, 580, 585, 600, 606, 612, 615, 620, 625, 640, 646, 652, 655, 665, 680, 692, 700, 705, 720, 726, 732, 735, 740, 745, 760, 761, 762, 763, 764, 765, 766, 767, 768, 769, 770, 771, 772, 773, 774, 775, 776, 777, 778, 779, 780, 781, 782, 783, 784, 785, 35, 77, 149, 158, 227, 230, 308, 311, 389, 427, 557, 594, 676].forEach(function (id) { return graph.set_tile_weight(id, Infinity); });
    [26, 27, 29, 30, 31, 32, 36, 37, 38, 39, 66, 67, 70, 71, 72, 75, 76, 78, 79, 106, 107, 108, 109, 112, 113, 116, 117, 118, 119, 146, 147, 148, 150, 153, 156, 157, 159, 186, 187, 188, 189, 190, 191, 196, 197, 198, 199, 226, 228, 229, 231, 232, 235, 236, 237, 238, 239, 266, 267, 268, 269, 270, 271, 272, 276, 277, 278, 279, 306, 307, 309, 310, 312, 316, 317, 318, 319, 346, 347, 348, 349, 350, 351, 352, 356, 357, 388, 390, 391, 426, 428, 429, 466, 467, 468, 506, 507, 546, 586, 626].forEach(function (id) { return graph.set_tile_weight(id, 2); });
    [355, 358, 359, 392, 395, 396, 397, 398, 399, 430, 431, 432, 435, 436, 437, 438, 439, 469, 470, 471, 475, 476, 477, 478, 479, 508, 509, 510, 514, 515, 516, 517, 518, 519, 547, 548, 549, 550, 553, 554, 555, 556, 558, 559, 587, 588, 589, 590, 593, 595, 596, 597, 598, 599, 627, 628, 629, 632, 633, 634, 635, 636, 637, 638, 639, 666, 667, 668, 673, 674, 675, 677, 678, 679, 706, 707, 708, 709, 712, 713, 714, 715, 716, 717, 718, 719, 746, 747, 748, 749, 752, 753, 754, 755, 756, 757, 758, 759, 786, 787, 788, 789, 790, 793, 794, 795, 796, 797, 798, 799].forEach(function (id) { return graph.set_tile_weight(id, 3); });
    [28, 33, 34, 68, 69, 73, 74, 110, 111, 114, 115, 151, 152, 154, 155, 192, 193, 194, 195, 233, 234, 273, 274, 275, 313, 314, 315, 353, 354, 393, 394, 433, 434, 472, 473, 474, 511, 512, 513, 551, 552, 591, 592, 630, 631, 710, 711, 750, 751, 791, 792].forEach(function (id) { return graph.set_tile_weight(id, 20); });
    var tile_types = [
        { name: 'default', weight: 1 },
        { name: 'grass', weight: 2 },
        { name: 'sand', weight: 3 },
        { name: 'water', weight: 20 },
        { name: 'wall', weight: Infinity }
    ];
    var diagram_opts = {
        graph: graph,
        starts: starts,
        exit: exit,
        tile_types: tile_types,
        algorithm_a: 'Dijkstra',
        algorithm_b: 'A*',
        layers: { 'edit': true, 'path': true },
        basic_layers: { 'edit': true, 'path': true }
    };
    function create_diagrams(opts) {
        var diagram = makeDiagram_custom(new SimpleDiagramOptions("#diagram_custom_0", opts.graph, opts.starts, opts.exit, opts.tile_types, 'A*', opts.basic_layers));
        var diagram_a = makeDiagram_custom(new SimpleDiagramOptions("#diagram_custom_1a", opts.graph, opts.starts, opts.exit, opts.tile_types, opts.algorithm_a, opts.layers));
        var diagram_b = makeDiagram_custom(new SimpleDiagramOptions("#diagram_custom_1b", opts.graph, opts.starts, opts.exit, opts.tile_types, opts.algorithm_b, opts.layers));
        link_diagrams([diagram, diagram_a, diagram_b]);
        d3.select("#diagram_custom_1").selectAll('.slider').remove();
        var oldPosition = (opts.slider) ? opts.slider.position : 0;
        opts.slider = new Slider("#diagram_custom_1", [diagram_a, diagram_b]);
        opts.slider.set_slider_to(oldPosition);
        return { main: diagram, a: diagram_a, b: diagram_b };
    }
    var diagrams = create_diagrams(diagram_opts);
    var loadCallback = function (textFromFileLoaded) {
        var json = JSON.parse(textFromFileLoaded);
        var opts = load_saved_map(json);
        diagram_opts.graph = opts.graph;
        diagram_opts.starts = opts.starts;
        diagram_opts.exit = opts.exit;
        if (opts.tile_types) {
            diagram_opts.tile_types = opts.tile_types;
        }
        create_diagrams(diagram_opts);
    };
    var saveCallback = function (filename) {
        var json = diagram_to_saved_map(diagrams.main, exit, tile_types);
        var jsonAsBlob = new Blob([JSON.stringify(json)], { type: 'text/json' });
        saveAs(jsonAsBlob, filename);
    };
    var selectAlgorithmA = function (alg) {
        diagram_opts.algorithm_a = alg;
        create_diagrams(diagram_opts);
    };
    var selectAlgorithmB = function (alg) {
        diagram_opts.algorithm_b = alg;
        create_diagrams(diagram_opts);
    };
    var setLayer = function (name, value) {
        diagram_opts.layers[name] = value;
        create_diagrams(diagram_opts);
    };
    var loadsave = new LoadSave("#diagram_custom_loadsave", loadCallback, saveCallback);
    var algorithm_select_a = new AlgorithmSelector("#diagram_custom_1a_alg", diagram_opts.algorithm_a, selectAlgorithmA);
    var algorithm_select_b = new AlgorithmSelector("#diagram_custom_1b_alg", diagram_opts.algorithm_b, selectAlgorithmB);
    var layer_select = new LayerSelector('#diagram_custom_1_layers', setLayer);
    return diagrams;
}
var diagram_custom = makeDiagram_custom_default();
