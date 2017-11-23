var units = ".000 ton aan vracht";

var margin = {
        top: 10,
        right: 175,
        bottom: 10,
        left: 175
    },
    width = 1500 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

var formatNumber = d3.format(",.3f"),
    format = function (d) {
        return formatNumber(d) + units;
    };

var svg = d3.select("#sankeyDiagram").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

var sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(5)
    .size([width, height]);

var path = sankey.link();

var color = d3.scaleOrdinal()
    .domain(["Argentina", "Argentina ", "Containers", "Machinery", "Materials", "Oil", "Waste", "Wood", "Belgium", "Brazil", "ChinaImport", "Finland", "France", "Germany", "Ireland", "Latvia", "Lithuania", "Netherlands", "Norway", "Other", "Poland", "Portugal", "Russia", "Singapore", "Spain", "Sweden", "UK"])
    .range(["#8badbd", "#8badbd", "#0699ad", "#6fb999", "#1d3d67", "#cf6d71", "#e6793e", "#d9c16d", "#83403a", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"]);

const defs = svg.append("defs");


d3.csv("data/dataCountryToCountry.csv", function (error, data) {

    graph = {
        "nodes": [],
        "links": []
    };

    data.forEach(function (d) {
        graph.nodes.push({
            "name": d.source,
            "color": d.color
        });
        graph.nodes.push({
            "name": d.target,
            "color": d.color
        });
        graph.links.push({
            "source": d.source,
            "target": d.target,
            "value": +d.value,
            "color": d.color
        });
    });

    graph.nodes = d3.keys(d3.nest()
        .key(function (d) {
            return d.name;
        })
        .object(graph.nodes));

    graph.links.forEach(function (d, i) {
        graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
        graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
    });

    graph.nodes.forEach(function (d, i) {
        graph.nodes[i] = {
            "name": d
        };
    });

    sankey
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(0);
    /*
    var tooltipLink = d3.select("body")
    	.append("div")
    	.style("position", "absolute")
    	.style("z-index", "10")
    	.style("visibility", "hidden")
    	.text(function(d){ return d.source}); */

    var xScale = d3.scaleBand()
        .domain(d3.range(0, data.length))
        .range([0, width], 0.05);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data)])
        .range([0, height]);

    var link = svg.append("g").selectAll(".link")
        .data(graph.links)
        .enter().append("path")
        .attr("class", function (d) {
            return "link " + "link" + d.source.name + " " + d.source.name;
        })
        .attr("d", path)
        .attr("id", function (d, i) {
            d.id = i;
            return "link-" + i;
        })
        .style("stroke", "black")
        .style("stroke-width", function (d) {
            return Math.max(1, d.dy);
        })
        .sort(function (a, b) {
            return b.dy - a.dy;
        })
    /*
    	.on("mouseover", function(){return tooltip.style("visibility", "visible");})
    .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
    .on("mouseout", function(){return tooltip.style("visibility", "hidden");});; */

    link.append("title")
        .text(function (d) {
            return "Hoeveelheid " + d.source.name + " vanuit Rotterdam getransporteerd naar " + d.target.name + "\n" + d.value + ".000 ton vracht";
        });

    var node = svg.append("g").selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", function (d) {
            return "node"
        })
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .on("click", highlight_node_links)
        .call(d3.drag()
            .subject(function (d) {
                return d;
            })
            .on("start", function () {
                this.parentNode.appendChild(this);
            })
            .on("drag", dragmove)
        );



    node.append("rect")
        .data(graph.nodes)
        .attr("class", function (d) {
            return "block" + d.name + " " + d.name;
        })
        .attr("height", function (d) {
            return d.dy;
        })
        .attr("width", sankey.nodeWidth())
        .style("fill", function (d) {
            return d.color = color(d.name.replace(/ .*/, ""));
        })
        .append("title")
        .text(function (d) {
            return d.name + "\n" + format(d.value);
        });

    node.append("text")
        .attr("x", 25)
        .attr("y", function (d) {
            return d.dy / 2;
        })
        .attr("dy", ".35em")
        .attr("class", function (d) {
            return "text" + d.name + " " + d.name;
        })
        .attr("text-anchor", "start")
        .attr("transform", null)
        .text(function (d) {
            return d.name;
        })
        .filter(function (d) {
            return d.x < width / 2;
        })
        .attr("x", -25 + sankey.nodeWidth())
        .attr("text-anchor", "end");

/*
    link.style("stroke", (d, i) => {
        //console.log("d from gradient stroke func", d);

        const gradientID = `gradient${i}`;

        const startColor = d.source.color;
        const stopColor = d.target.color;

        //console.log("startColor", startColor);
        //console.log("stopColor", stopColor);

        if (d.y1 - d.y0 === 0) {
            linearGradient.attr('gradientUnits', "userSpaceOnUse")
        }

        const linearGradient = defs.append("linearGradient")
            .attr("id", gradientID);

        linearGradient.selectAll("stop")
            .data([
                {
                    offset: "40%",
                    color: startColor
                },
                {
                    offset: "60%",
                    color: stopColor
                }
			])
            .enter().append("stop")
            .attr("offset", d => {
                //console.log("d.offset", d.offset);
                return d.offset;
            })
            .attr("stop-color", d => {
                //console.log("d.color", d.color);
                return d.color;
            });

        return `url(#${gradientID})`;
    })
    */

    function dragmove(d) {
        d3.select(this)
            .attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
        sankey.relayout();
        link.attr("d", path);
    }

    function highlight_node_links(node, i) {
        var remainingNodes = [],
            nextNodes = [];

        var stroke_opacity = 0;
        if (d3.select(this).attr("data-clicked") == "1") {
            d3.select(this).attr("data-clicked", "0");
            stroke_opacity = 0.1;
        } else {
            d3.select(this).attr("data-clicked", "1");
            stroke_opacity = 1;
        }

        var traverse = [{
            linkType: "sourceLinks",
            nodeType: "target"
		}, {
            linkType: "targetLinks",
            nodeType: "source"
		}];

        traverse.forEach(function (step) {
            node[step.linkType].forEach(function (link) {
                remainingNodes.push(link[step.nodeType]);
                highlight_link(link.id, stroke_opacity);
            });

            /*while (remainingNodes.length) {
                nextNodes = [];
                remainingNodes.forEach(function (node) {
                    node[step.linkType].forEach(function (link) {
                        nextNodes.push(link[step.nodeType]);
                        highlight_link(link.id, stroke_opacity);
                    });
                });
                remainingNodes = nextNodes;
            }*/
        });
    }

    function highlight_link(id, opacity) {
        d3.select("#link-" + id)
            .style("stroke-opacity", opacity);
    }

    $(".link")
        .on("mouseover", function () {
            d3.select(this)
                .style("stroke-opacity", 1)
        })
        .on("mouseout", function () {
            d3.select(this)
                .style("stroke-opacity", 0.1)
        });


})
