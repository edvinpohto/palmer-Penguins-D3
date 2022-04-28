export function showHist(data, htmlTarget, attribute) {
    // with help from here: https://d3-graph-gallery.com/graph/histogram_basic.html and https://d3-graph-gallery.com/graph/line_filter.html 

    const allData = data;

    const allGroup = new Set();
    allGroup.add("All penguins");
    allGroup.add("Adelie Penguin ");
    allGroup.add("Chinstrap penguin ");
    allGroup.add("Gentoo penguin ");

    d3.select("#selectSpecies" + htmlTarget)
        .selectAll('myOptions')
        .data(allGroup)
        .enter()
        .append('option')
        .text(function (d) { return d; })
        .attr("value", function (d) { return d; })
        .property("selected", function (d) { return d === "All penguins"; })

    var margin = { top: 10, right: 30, bottom: 30, left: 40 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#histogram" + htmlTarget)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 30)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleLinear().domain([d3.min(data, (d) => d[attribute]), d3.max(data, function (d) { return + d[attribute] })]).range([0, width]);
    const xAxis = d3.axisBottom().scale(x);
    svg.append("g")
        .attr("transform", `translate(0, ${height+1})`)
        .attr("class", "myXaxis")
        .call(d3.axisBottom(x));

    var y = d3.scaleLinear()
        .range([height, 0]);
    var yAxis = svg.append("g")

    const readable = {
        "bodyMass": "Body Mass in grams",
        "flipperLength": "Flipper Length in millimeters",
        "culmenLength": "Beak Length in millimeters",
        "culmenDepth": "Beak Depth in millimeters",
    }

    const xText = svg
        .append("text")
        .text(readable[attribute])
        .style('fill', 'white')
        .attr("transform", `translate(${width / 2}, ${height + 35})`)
        .style("text-anchor", "middle")

    const yText = svg
        .append('text')
        .text("Frequency")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left - 5)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("fill", "white");

    const Tooltip = d3.select("#histogram" + htmlTarget)
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    const mouseover = function (d) {
        Tooltip
            .style("opacity", 0.8)
        d3.select(this)
            .style("stroke", "white")
    }

    const mousemove = function (event, d) {
        Tooltip
            .html(`There are ${event.target.outerHTML.match(/(?<=val=")[0-9]+/g)[0]} penguins with this ${readable[attribute].split(' ').slice(0, 2).join(' ').toLowerCase()}.`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY) + "px")
    }
    const mouseleave = function (d) {
        Tooltip
            .style("opacity", 0)
        d3.select(this)
            .style("fill", getColor(document.getElementById("selectSpecies" + htmlTarget).value))
            .style("stroke", "black")
    }

    function update(selectedGroup) {

        let dataFilter = allData.filter(function (d) {
            if (selectedGroup == "All penguins") {
                return allData;
            }
            return d.species.substring(0, d.species.indexOf('(')) == selectedGroup
        })

        x.domain([d3.min(dataFilter, (d) => d[attribute]), d3.max(dataFilter, function (d) { return + d[attribute] })])
        svg.selectAll(".myXaxis")
            .transition()
            .duration(3000)
            .call(xAxis);

        var histogram = d3.histogram()
            .value(function (d) { return d[attribute] })
            .domain(x.domain()) 
            .thresholds(x.ticks(30));

        var bins = histogram(dataFilter);

        y.domain([0, d3.max(bins, function (d) { return d.length; })]);
        yAxis
            .transition()
            .duration(1000)
            .call(d3.axisLeft(y));

        var u = svg.selectAll("rect")
            .data(bins)

        u
            .enter()
            .append("rect")
            .merge(u)
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .transition()
            .duration(1000)
            .attr("x", 1)
            .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
            .attr("width", function (d) { return x(d.x1) - x(d.x0) - 1; })
            .attr("height", function (d) { return height - y(d.length); })
            .attr("val", function (d) { return d.length})
            .style("stroke", "#000")
            .style("fill", getColor(selectedGroup))

        u
            .exit()
            .remove()

    }

    function getColor(selectedGroup) {
        switch (selectedGroup) {
            case "Adelie Penguin ":
                return "#ff6c02";
            case "Chinstrap penguin ":
                return "#c65bca";
            case "Gentoo penguin ":
                return "#0f7275 ";
            case "All penguins":
                return "#edb100"
            default:
                break;
        }
    }

    update(document.getElementById("selectSpecies" + htmlTarget).value);

    d3.select("#selectSpecies" + htmlTarget).on("change", function (event, d) {
        const selectedOption = d3.select(this).property("value")
        update(selectedOption)
    })

}