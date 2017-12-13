var units = ".000 ton aan vracht";

var margin = {
        top: 10,
        right: 175,
        bottom: 10,
        left: 175
    },
    width = 1500 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

/* Initialize tooltip */
var tipLinks = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0]);

var tipNodes = d3.tip()
    .attr('class', 'd3-tip d3-tip-nodes')
    .offset([-10, 0]);

var linkTooltipOffset = 62,
    nodeTooltipOffset = 130;

var formatNumber = d3.format(",.3f"),
    format = function (d) {
        return formatNumber(d) + units;
    };


var sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(15)
    .size([width, height]);

var path = sankey.link();

var color = d3.scaleOrdinal()
    .domain(["Argentina", "Argentina ", "Containers", "Machinery", "Materials", "Oil", "Waste", "Wood", "Belgium", "Brazil", "ChinaImport", "Finland", "France", "Germany", "Ireland", "Latvia", "Lithuania", "Netherlands", "Norway", "Other", "Poland", "Portugal", "Russia", "Singapore", "Spain", "Sweden", "UK"])
    .range(["#8badbd", "#8badbd", "#0699ad", "#6fb999", "#1d3d67", "#cf6d71", "#e6793e", "#d9c16d", "#83403a", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"]);



d3.csv("data/dataContinentToCountry.csv", function (error, dataCtoC) {
    d3.csv("data/dataAfrica.csv", function (error, dataAfrica) {
        d3.csv("data/dataAsia.csv", function (error, dataAsia) {
            d3.csv("data/dataEurope.csv", function (error, dataEurope) {
                d3.csv("data/dataNorthAmerica.csv", function (error, dataNA) {
                    d3.csv("data/dataOtherCountries.csv", function (error, dataOther) {
                        d3.csv("data/dataSouthAmerica.csv", function (error, dataSA) {

                            var currentData = dataCtoC;

                            function processData(dataCtoC) {

                                var graph = {
                                    "nodes": [],
                                    "links": []
                                };

                                dataCtoC.forEach(function (d) {
                                    graph.nodes.push({
                                        "name": d.source
                                    });
                                    graph.nodes.push({
                                        "name": d.target
                                    });
                                    graph.links.push({
                                        "source": d.source,
                                        "target": d.target,
                                        "value": +d.value
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

                                return graph;
                            }

                            // "➡" 
                            tipLinks.html(function (d) {
                                var title, candidate;
                                if (candidates.indexOf(d.source.name) > -1) {
                                    candidate = d.source.name;
                                    title = d.target.name;
                                    var html = '<div class="table-wrapper">' +
                                        '<h1>' + title + '</h1>' +
                                        '<table>' +
                                        '<tr>' +
                                        '<td class="col-left">' + candidate + '</td>' +
                                        '<td align="right">' + formatAmount(d.value) + '</td>' +
                                        '</tr>' +
                                        '</table>' +
                                        '</div>';
                                } else {
                                    candidate = d.target.name;
                                    title = d.source.name;
                                    var html = '<div class="table-wrapper">' +
                                        '<h1>' + title + '</h1>' +
                                        '<table>' +
                                        '<tr>' +
                                        '<td class="col-left">' + candidate + '</td>' +
                                        '<td align="right">' + formatAmount(d.value) + '</td>' +
                                        '</tr>' +
                                        '</table>' +
                                        '</div>';
                                }

                                return html;
                            });

                            tipNodes.html(function (d) {
                                var object = d3.entries(d),
                                    nodeName = object[0].value,
                                    linksTo = object[2].value,
                                    linksFrom = object[3].value,
                                    html;

                                html = '<div class="table-wrapper">' +
                                    '<h1>' + nodeName + '</h1>' +
                                    '<table>';
                                if (linksFrom.length > 0 & linksTo.length > 0) {
                                    html += '<tr><td><h2>Revenues:</h2></td><td></td></tr>'
                                }
                                for (i in linksFrom) {
                                    html += '<tr>' +
                                        '<td class="col-left">' + linksFrom[i].source.name + '</td>' +
                                        '<td align="right">' + formatAmount(linksFrom[i].value) + '</td>' +
                                        '</tr>';
                                }
                                if (linksFrom.length > 0 & linksTo.length > 0) {
                                    html += '<tr><td><h2>Spending:</h2></td><td></td></tr>'
                                }
                                for (i in linksTo) {
                                    html += '<tr>' +
                                        '<td class="col-left">' + linksTo[i].target.name + '</td>' +
                                        '<td align="right">' + formatAmount(linksTo[i].value) + '</td>' +
                                        '</tr>';
                                }
                                html += '</table></div>';
                                return html;
                            });

                            renderSankey();




                            function renderSankey() {


                                var svg = d3.select("#sankeyDiagram").append("svg")
                                    .attr("width", width + margin.left + margin.right)
                                    .attr("height", height + margin.top + margin.bottom)
                                    .call(tipLinks)
                                    .call(tipNodes)
                                    .append("g")
                                    .attr("transform",
                                        "translate(" + margin.left + "," + margin.top + ")");

                                const defs = svg.append("defs");

                                graph = processData(currentData);

                                myLinks = graph.links;
                                myNodes = graph.nodes;

                                sankey
                                    .nodes(myNodes)
                                    .links(graph.links)
                                    .layout(0)
                                    .transition;

                                var link = svg.append("g").selectAll(".link")
                                    .data(myLinks)
                                    .enter().append("path")
                                    .attr("class", function (d) {
                                        return "link " + "link" + d.source.name + " " + d.source.name;
                                    })
                                    .attr("d", path)
                                    .attr("id", function (d, i) {
                                        d.id = i;
                                        return "link-" + i;
                                    })
                                    .style("stroke-width", function (d) {
                                        return Math.max(1, d.dy);
                                    })
                                    .sort(function (a, b) {
                                        return b.dy - a.dy;
                                    })
                                    .on('mousemove', function (event) {
                                        tipLinks
                                            .style("top", (d3.event.pageY - linkTooltipOffset) + "px")
                                            .style("left", function () {
                                                var left = (Math.max(d3.event.pageX - linkTooltipOffset, 10));
                                                left = Math.min(left, window.innerWidth - $('.d3-tip').width() - 20)
                                                return left + "px";
                                            })
                                    })
                                    .on('mouseover', tipLinks.show)
                                    .on('mouseout', tipLinks.hide);

                                link.append("title")
                                    .text(function (d) {
                                        return "Hoeveelheid " + d.source.name + " vanuit Rotterdam getransporteerd naar " + d.target.name + "\n" + d.value + ".000 ton vracht";
                                    });

                                var node = svg.append("g").selectAll(".node")
                                    .data(myNodes)
                                    .enter().append("g")
                                    .attr("class", function (d) {
                                        return "node"
                                    })
                                    .attr("transform", function (d) {
                                        return "translate(" + d.x + "," + d.y + ")";
                                    })
                                    .on('mousemove', function (event) {
                                        tipNodes
                                            .style("top", (d3.event.pageY - $('.d3-tip-nodes').height() - 20) + "px")
                                            .style("left", function () {
                                                var left = (Math.max(d3.event.pageX - nodeTooltipOffset, 10));
                                                left = Math.min(left, window.innerWidth - $('.d3-tip').width() - 20)
                                                return left + "px";
                                            })
                                    })
                                    .on('mouseover', tipNodes.show)
                                    .on('mouseout', tipNodes.hide)
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
                                    .data(myNodes)
                                    .attr("class", function (d) {
                                        return "block" + d.name.replace(/\s/g, '') + " " + d.name;
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


                                link.style("stroke", (d, i) => {

                                    const gradientID = `gradient${i}`;

                                    const startColor = d.source.color;
                                    const stopColor = d.target.color;


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
                                            return d.offset;
                                        })
                                        .attr("stop-color", d => {
                                            return d.color;
                                        });

                                    return `url(#${gradientID})`;
                                })


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


                            }


                            d3.select('#continents-button').on('click', function () {
                                d3.selectAll(".sankey-label").classed("clicked", false);
                                d3.select(this).classed("clicked", true);
                                d3.select("svg").remove();
                                currentData = dataCtoC;
                                renderSankey();
                            });
                            d3.select('.blockAfrica').on('click', function () {
                                d3.selectAll(".sankey-label").classed("clicked", false);
                                d3.select(this).classed("clicked", true);
                                d3.select("svg").remove();
                                d3.select("svg").remove();
                                currentData = dataAfrica;
                                renderSankey();
                            });
                            d3.select('.blockAsia').on('click', function () {
                                d3.selectAll(".sankey-label").classed("clicked", false);
                                d3.select(this).classed("clicked", true);
                                d3.select("svg").remove();
                                currentData = dataAsia;
                                renderSankey();
                                console.log("Asia clicked");
                            });
                            d3.select('.blockEurope').on('click', function () {
                                d3.selectAll(".sankey-label").classed("clicked", false);
                                d3.select(this).classed("clicked", true);
                                d3.select("svg").remove();
                                currentData = dataEurope;
                                renderSankey();
                            });
                            d3.select('.blockNorthAmerica').on('click', function () {
                                d3.selectAll(".sankey-label").classed("clicked", false);
                                d3.select(this).classed("clicked", true);
                                d3.select("svg").remove();
                                currentData = dataNA;
                                renderSankey();
                            });
                            d3.select('.blockOthercountries').on('click', function () {
                                d3.selectAll(".sankey-label").classed("clicked", false);
                                d3.select(this).classed("clicked", true);
                                d3.select("svg").remove();
                                currentData = dataOther;
                                renderSankey();
                            });
                            d3.select('.blockSouthAmerica').on('click', function () {
                                d3.selectAll(".sankey-label").classed("clicked", false);
                                d3.select(this).classed("clicked", true);
                                d3.select("svg").remove();
                                currentData = dataSA;
                                renderSankey();
                            });
                        });

                    });
                });
            });
        });
    });
});
