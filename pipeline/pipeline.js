let _svg;
let _data
let _svgHeight = 1200;
let _svgWidth = 2600;
let _projectTypesPallette = "Set1";
let _activitiesColor = "#2b8cbe"
let _toolPallettes = ["YlGnBu", "Reds", "Blues", "Greens", "Oranges", "Purples"];
let _targetSideSize = 150;

let render = () => {
    var loaded = false;
    d3.json("./pipeline_data.json", function (fileError, fileData) {
        _data = fileData;
        loaded = true;
    });

    let checkLoad = setInterval(() => {
        if (loaded) {
            clearInterval(checkLoad);
            renderData();
        }
    }, 500);
}

let renderData = () => {
    setCanvas("canvas", _svgHeight, _svgWidth);
    renderPipelineTools();
    renderTargets();
    renderInitiatives();
    renderActivities();
    renderProjectTypes();
}

let setCanvas = (canvasId, height, width) => {
    _svg = d3.select(`#${canvasId}`);

    _svg.attr("height", height)
        .attr("width", width)
        .attr("style", "border: 1px solid black;");

    return _svg;
}

let renderInitiatives = () => {
    let _topMargin = 50;
    let _leftMargin = 100;
    let _initiativeSpace = 100;
    let _initiativeSide = 100;
    let _groupClass = "initiative"

    let _initiativesGroup = _svg.selectAll(`g.${_groupClass}`)
        .data(_data.initiativeWorkflow)
        .enter()
        .append("g")
        .attr("class", _groupClass);

    let _initiativeRect = _initiativesGroup
        .append("rect")
        .attr("height", _initiativeSide)
        .attr("width", _initiativeSide)
        .attr("x", (d, i) => i * (_initiativeSide + _initiativeSpace) + _leftMargin)
        .attr("y", 0)
        .attr("style", `fill: ${_activitiesColor};`)
        .attr("transform", (d, i) => `rotate(45,${i * (_initiativeSide + _initiativeSpace)},${_initiativeSide + _initiativeSpace + _leftMargin}) translate(-180)`);

    let _initiativeLabel = _initiativesGroup
        .append("text")
        .attr("dx", (d, i) => (i * (_initiativeSpace + _initiativeSide) + _leftMargin))
        .attr("dy", _topMargin + (.6 * _initiativeSide))
        .text(d => d);

}

let renderActivities = () => {
    let _topMargin = 250;
    let _leftMargin = 400;
    let _activitySpace = 300;
    let _activityHeight = 75;
    let _activityWidth = 250;
    let _textLeftMargin = 20
    let _groupClass = "activity"
    let _activityBarColor = "#aaa"
    let _activityBarWidth = 10;
    let _activityBarHeight = 800

    let _activitiesGroup = _svg.selectAll(`g.${_groupClass}`)
        .data(_data.activities)
        .enter()
        .append("g")
        .attr("class", _groupClass);

    let _activityRect = _activitiesGroup.append("rect")
        .attr("x", (d, i) => (i * _activitySpace + _activityWidth) + _leftMargin)
        .attr("y", _topMargin)
        .attr("height", _activityHeight)
        .attr("width", _activityWidth)
        .attr("style", (d, i) => `fill: ${_activitiesColor};`);

    let _activityLabel = _activitiesGroup
        .append("text")
        .attr("dx", (d, i) => (i * _activitySpace + _activityWidth) + _textLeftMargin + _leftMargin)
        .attr("dy", _topMargin + (.6 * _activityHeight))
        .text(d => d);

    let _activityBar = _activitiesGroup
        .append("rect")
        .attr("id", (d, i) => `ab-${i}`)
        .attr("x", (d, i) => (i * _activitySpace + _activityWidth) + (.5 * _activityWidth - .5 * _activityBarWidth) + _leftMargin)
        .attr("y", _topMargin + _activityHeight)
        .attr("height", _activityBarHeight)
        .attr("width", _activityBarWidth)
        .attr("style", (d, i) => `fill: ${_activityBarColor};`);
}

let renderProjectTypes = () => {
    let _topMargin = 350;
    let _leftMargin = 290;
    let _projectTypesSpace = 200;
    let _projectHeight = 75;
    let _projectWidth = 260;
    let _colorScheme = colorbrewer[_projectTypesPallette][4];
    let _textLeftMargin = 15;
    let _groupClass = "projectType"
    let _projectBarHeight = 20;
    let _projectBarWidth = 1600;
    let _projectBarSkipWidth = 2125;
    let _skipWidth = 30;

    let _projectTypesGroup = _svg.selectAll(`g.${_groupClass}`)
        .data(_data.projectTypes)
        .enter()
        .append("g")
        .attr("id", (d, i) => `pt-${i}`)
        .attr("class", _groupClass);

    let _projectTypesRect = _projectTypesGroup.append("rect")
        .attr("x", _leftMargin)
        .attr("y", (d, i) => (i * _projectTypesSpace + _projectHeight) + _topMargin)
        .attr("height", _projectHeight)
        .attr("width", _projectWidth)
        .attr("style", (d, i) => `fill: ${_colorScheme[i]};`);

    let _projectTypesLabel = _projectTypesGroup
        .append("text")
        .attr("dx", _leftMargin + _textLeftMargin)
        .attr("dy", (d, i) => (i * _projectTypesSpace + _projectHeight) + _topMargin + (.6 * _projectHeight))
        .text(d => d.name);

    _projectTypesGroup.data()
        .forEach((e, i) => {
            let _projectTypeGroup = _svg.select(`#pt-${i}`);
            _addDefArrowhead(i, _colorScheme[i]);

            //single bar if no skip intersections
            if (e.skip.length == 0) {
                addProjectBar(
                    _projectTypeGroup,
                    _leftMargin + _projectWidth,
                    (i * _projectTypesSpace + _projectHeight) + (.5 * _projectHeight - .5 * _projectBarHeight) + _topMargin,
                    _projectBarHeight,
                    _projectBarWidth,
                    _colorScheme[i]);
            } else {
                let _skipBarsX = [_leftMargin + _projectWidth];
                e.skip.forEach((_skip) => {
                    let _activityBar = d3.select(`#ab-${_skip}`);
                    _skipBarsX.push(parseInt(_activityBar.attr("x")));
                });

                _skipBarsX.forEach((_x, j) => {
                    let _last = !(j < _skipBarsX.length - 1);
                    let _width = _last ?
                        _projectBarSkipWidth - _x :
                        _skipBarsX[j + 1] - _x - (.5 * _skipWidth);

                    addProjectBar(
                        _projectTypeGroup,
                        j == 0 ? _x : _x + 10 + (.5 * _skipWidth),
                        (i * _projectTypesSpace + _projectHeight) + (.5 * _projectHeight - .5 * _projectBarHeight) + _topMargin,
                        _projectBarHeight,
                        _width,
                        _colorScheme[i]);
                })
            }
        });

    let _targets = _svg.selectAll(".target");
    let _projectTypeTarget = _projectTypesGroup
        .append("line")
        .style("stroke", (d, i) => `${_colorScheme[i]}`)
        .style("stroke-width", 24)
        .attr("x1", _leftMargin + _projectWidth + _projectBarWidth - 8)
        .attr("y1", (d, i) => (i * _projectTypesSpace + _projectHeight) + (.5 * _projectHeight) + _topMargin)
        .attr("x2", d => parseInt(_targets.select(`#${d.target}`).attr("x")) - 45)
        .attr("y2", (d, i) =>
            parseInt(_targets.select(`#${d.target}`).attr("y")) + (.5 * _targetSideSize) +
            (d.target != "onpremises" ? (i * 50) - 10 : 20))
        .attr("marker-end", (d, i) => `url(#arrow-${i})`);
}

let _addDefArrowhead = (i, color) => {
    _svg.append("svg:defs").append("svg:marker")
        .attr("id", `arrow-${i}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 5) //so that it comes towards the center.
        .attr("markerWidth", 2)
        .attr("markerHeight", 2)
        .attr("orient", "auto")
        .attr("style", `fill: ${color}`)
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");
}

let addProjectBar = (projectTypeGroup, x, y, height, width, color) =>
    projectTypeGroup.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("height", height)
        .attr("width", width)
        .attr("style", `fill: ${color};`);

let renderTargets = () => {
    let _leftMargin = 2300;
    let _topMargin = 460;
    let _targetClass = "target";
    let _targetSpacing = 200;
    let _targetColor = "#b33";
    let _targetTextColor = "#fff";
    let _targetTextMargin = 20;

    let _targetGroup = _svg.selectAll(`g.${_targetClass}`)
        .data(_data.targets)
        .enter()
        .append("g")
        .attr("class", _targetClass);

    let _targetBox = _targetGroup
        .append("rect")
        .attr("id", d => d.id)
        .attr("x", _leftMargin)
        .attr("y", (d, i) => _topMargin + (i * (_targetSideSize + _targetSpacing)))
        .attr("height", _targetSideSize)
        .attr("width", _targetSideSize)
        .attr("style", `fill: ${_targetColor};`);

    let _targetText = _targetGroup
        .append("text")
        .attr("id", d => `target-${d.id}`)
        .attr("x", _leftMargin + _targetTextMargin)
        .attr("y", (d, i) => _topMargin + (.5 * _targetSideSize) + (i * (_targetSideSize + _targetSpacing)))
        .attr("height", _targetSideSize)
        .attr("width", _targetSideSize)
        .attr("style", `fill: ${_targetTextColor}`)
        .text(d => d.name);

}

let renderPipelineTools = () => {
    let _toolClass = "tools";
    let _palletteIndex = 0;
    let _pipeline_tools = _data["pipeline_tools"];
    let _toolNameHeight = 50;
    let _toolNameWidth = 200;
    let _toolsListLeftMargin = 2300;
    let _toolsListTopMargin = 10;
    let _toolsListItemHeight = 30;
    let _toolsListItemWidth = 250;

    for (let _set of Object.keys(_pipeline_tools)) {
        let _tools = _pipeline_tools[_set];
        let _class = `${_toolClass}-${_set}`;
        let _colorScheme = colorbrewer[_toolPallettes[_palletteIndex++ % _toolPallettes.length]][9];

        let _toolsGroup = _svg.selectAll("g.tools")
            .data(_tools)
            .enter()
            .append("g")
            .attr("class", "tools");

        let _mouseEnter = (d) => d3.selectAll(`.${_class}-${d.id}`).nodes().forEach(n => n.classList.add("outline"));
        let _mouseLeave = (d) => d3.selectAll(`.${_class}-${d.id}`).nodes().forEach(n => n.classList.remove("outline"));

        let _toolBox = _toolsGroup
            .append("polygon")
            .attr("class", d => `${_class}-${d.id}`)
            .attr("points", d => d.region)
            .attr("style", d => `fill: ${_colorScheme[d.color - 1]};`)
            .attr("fill-opacity", 0.2)
            .on("mouseenter", _mouseEnter)
            .on("mouseleave", _mouseLeave);

        let _corner = (region, position) => parseInt(region.split(" ")[0].split(",")[position]);

        let _toolText = _toolsGroup
            .append("text")
            .attr("x", (d) => _corner(d.region, 0) + 10)
            .attr("y", (d) => _corner(d.region, 1) + 20)
            .attr("height", _toolNameHeight)
            .attr("width", _toolNameWidth)
            .text(d => d.name);

        console.log(_tools);

        let _toolsListData = Array.from(new Set(_tools.map(t => t.id)))
            .map(id => {
                let _firstTool = _tools.find(t => t.id == id);
                return {
                    id: id,
                    name: _firstTool.name,
                    color: _firstTool.color
                };
            })

        console.log(_toolsListData);

        let _toolsListGroup = _svg.selectAll("g.toolsList")
            .data(_toolsListData)
            .enter()
            .append("g")
            .attr("class", "tools");


        let _toolsList = _toolsListGroup
            .append("rect")
            .attr("class", d => `${_class}-${d.id}`)
            .attr("x", _toolsListLeftMargin)
            .attr("y", (d, i) => _toolsListTopMargin + (i * _toolsListItemHeight))
            .attr("height", _toolsListItemHeight)
            .attr("width", _toolsListItemWidth)
            .attr("style", d => `fill: ${_colorScheme[d.color - 1]};`)
            .attr("fill-opacity", .2)
            .on("mouseenter", _mouseEnter)
            .on("mouseleave", _mouseLeave);

        let _toolsListText = _toolsListGroup
            .append("text")
            .attr("x", (d) => _toolsListLeftMargin + 10)
            .attr("y", (d, i) => _toolsListTopMargin + (i * _toolsListItemHeight) + 20)
            .attr("height", _toolNameHeight)
            .attr("width", _toolNameWidth)
            .text(d => d.name);

    }
}
