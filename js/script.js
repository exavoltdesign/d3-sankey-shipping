var units = "USD",
    continents = ["Europe", "North America", "Asia",
                    "Africa", "South America", "Other countries"];

var margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    },
    width = 900 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

var formatNumber = d3.format(",.3f"),
    format = function (d) {
        return formatNumber(d) + units;
    };

var svg = d3.select("#sankey").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
      .attr("class", "sankey")
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(14)
    .size([width, height]);

var path = sankey.link();

/*
var color = d3.scaleOrdinal()
    .domain(["Argentina", "Argentina ", "Containers", "Machinery", "Materials", "Oil", "Waste", "Wood", "Belgium", "Brazil", "ChinaImport", "Finland", "France", "Germany", "Ireland", "Latvia", "Lithuania", "Netherlands", "Norway", "Other", "Poland", "Portugal", "Russia", "Singapore", "Spain", "Sweden", "UK"])
    .range(["#8badbd", "#8badbd", "#0699ad", "#6fb999", "#1d3d67", "#cf6d71", "#e6793e", "#d9c16d", "#83403a", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"]);
*/

//d3.csv("data/dataCountryToCountry.csv", function (error, data) {
d3.csv("data/dataContinentToCountry.csv", function (error, data) {

    var currentData = data;

    function processData(data) {
        var graph = {
            "nodes": [],
            "links": []
        };

        data.forEach(function (d) {
            graph.nodes.push({
                "name": d.source,
                "shortname": d.shortname
            });
            graph.nodes.push({
                "name": d.target,
                "shortname": d.shortname
            });
            graph.links.push({
                "source": d.source,
                "target": d.target,
                "value": +d.value
            });
        });

        graph.nodesNew = d3.nest()
            .key(function (d) {
                return d.name;
            })
            .rollup(function (d) {
                return d[0].shortname;
            }) // returns the shortname of the first element of that key
            .map(graph.nodes);

        graph.nodes = d3.keys(d3.nest()
            .key(function (d) {
                return d.name;
            })
            .map(graph.nodes));

        graph.links.forEach(function (d, i) {
            graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
            graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
        });

        graph.nodes.forEach(function (d, i) {
            graph.nodes[i] = {
                "name": d,
                "shortname": d
            };
        });

        return graph;
    }

    renderSankey();

    function dragmove(d) {
        d3.select(this)
            .attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
        sankey.relayout();
        link.attr("d", path);
    }

    function hasLinks(node, links) {
        // checks if any links in links reference node
        l = false;
        links.forEach(function (d) {
            if (d.source == node || d.target == node) {
                l = true;
            }
        })
        return l;
    }

    d3.select('#spending-button').on('click', function () {
        d3.selectAll(".sankey-label").classed("clicked", false);
        d3.select(this).classed("clicked", true);
        currentData = data.filter(function (d) {
            return continents.indexOf(d.source) + 1;
        });
        renderSankey();
    });
    d3.select('#revenue-button').on('click', function () {
        d3.selectAll(".sankey-label").classed("clicked", false);
        d3.select(this).classed("clicked", true);
        currentData = data.filter(function (d) {
            return continents.indexOf(d.target) + 1;
        });
        renderSankey();
    });
    d3.select('#showall-button').on('click', function () {
        d3.selectAll(".sankey-label").classed("clicked", false);
        d3.select(this).classed("clicked", true);
        currentData = data;
        renderSankey();
    })

    function renderSankey() {
        d3.select("body").selectAll("g").remove();

        graph = processData(currentData);

        myLinks = graph.links;
        myNodes = graph.nodes;

        svg = d3.select(".sankey")
            .attr("width", width)
            .attr("height", height)
            .append("g");

        sankey
            .size([width, height])
            .nodes(myNodes)
            .links(myLinks)
            .layout(120);

        path = sankey.link();

        link = svg.append("g").selectAll(".link")
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

        node = svg.append("g").selectAll(".node")
            .data(myNodes)
            .enter().append("g")
            .attr("class", function (d) {
                return "node"
            })
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
        /*
            .call(d3.drag()
                .subject(function (d) {
                    return d;
                })
                .on("start", function () {
                    this.parentNode.appendChild(this);
                })
                .on("drag", dragmove)
            )*/
        ;

        node.append("rect")
            .attr("height", function (d) {
                return d.dy;
            })
            .attr("width", sankey.nodeWidth())
            .attr("class", function (d) {
                return "block" + d.name + " " + d.name;
            });

        if (true) {
            node.append("text")
                .attr("x", -6)
                .attr("y", function (d) {
                    return d.dy / 2;
                })
                .attr("dy", ".35em")
                .attr("text-anchor", "end")
                .attr("transform", null)
                .text(function (d) {
                    return d.name;
                })
                .filter(function (d) {
                    return d.x < width / 2;
                })
                .attr("x", 6 + sankey.nodeWidth())
                .attr("text-anchor", "start");
        } else {
            node.append("text")
                .attr("x", 6 + sankey.nodeWidth())
                .attr("y", function (d) {
                    return d.dy / 2;
                })
                .attr("dy", ".35em")
                .attr("text-anchor", "start")
                .attr("transform", null)
                .text(function (d) {
                    return d.name;
                })
                .filter(function (d) {
                    return d.x < width / 2;
                })
                .attr("x", -6)
                .attr("text-anchor", "end");
        }

    }

    d3.select(window).on("resize.sankey", renderSankey);

});
