export { scatterplot };

// https://d3-graph-gallery.com/graph/line_select.html
// https://d3-graph-gallery.com/graph/line_change_data.html 
// https://coolors.co/e55934-f7f0f5-ffd447-4aad52-5bc0eb 
// https://d3-graph-gallery.com/graph/scatter_basic.html 
// https://d3-graph-gallery.com/graph/scatter_grouped.html
// https://d3-graph-gallery.com/graph/custom_color.html 
// https://d3-graph-gallery.com/graph/scatter_grouped_highlight.html
// https://jsfiddle.net/Lntzh7aj/
// https://d3-graph-gallery.com/graph/interactivity_tooltip.html#customContent
// lecture slides

function scatterplot() {
    // setting the dimensions and margins
    const margin = {top: 10, right: 30, bottom: 60, left: 60},
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#scatterplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right + 165)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    //Read the data
    d3.csv("./data/penguins_lter.csv").then( function(data) {

        // find min/max values
        let extent_bodyMass = d3.extent(data, (d) => parseFloat(d.bodyMass));
        let extent_flipperLength = d3.extent(data, (d) => parseFloat(d.flipperLength));

        let max_bodyMass = [0, d3.max(data, function(d) { return d.bodyMass})]
        let max_flipperLength = [0, d3.max(data, function(d) { return d.flipperLength})]

        // List of groups
        const allGroup = ["bodyMass", "flipperLength", "culmenLength", "culmenDepth"]

        const readable = {
            "bodyMass": "Body Mass",
            "flipperLength": "Flipper Length",
            "culmenLength": "Beak Length",
            "culmenDepth": "Beak Depth",
        }
        
        // add the options to the X button
        d3.select("#selectButtonX")
        .selectAll('myOptions')
            .data(allGroup)
        .enter()
            .append('option')
        .text(function (d) { return readable[d]; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button
        .property("selected", function(d){ return d === allGroup[1]; }) // https://stackoverflow.com/questions/26898814/setting-default-selection-of-a-dropdown-menu-with-d3 

        // add the options to the Y button
        d3.select("#selectButtonY")
        .selectAll('myOptions')
            .data(allGroup)
        .enter()
            .append('option')
        .text(function (d) { return readable[d]; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button
        .property("selected", function(d){ return d === allGroup[0]; })

        const keys = ["Adelie penguin", "Chinstrap penguin", "Gentoo penguin"]

        // A color scale: one color for each group
        const myColor = d3.scaleOrdinal()
        .domain(keys)
        .range([ "#ff6c02", "#c65bca", "#0f7275"])

        // Initialise X axis
        const x = d3.scaleLinear().domain(extent_flipperLength).range([ 0, width ]);
        const xAxis = d3.axisBottom().scale(x);
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .attr("class","myXaxis")
            .call(d3.axisBottom(x));

        // Initialise Y axis
        const y = d3.scaleLinear().domain(extent_bodyMass).range([ height, 0 ]);
        const yAxis = d3.axisLeft().scale(y);
        svg.append("g")
            .attr("class","myYaxis")
            .call(d3.axisLeft(y));

        // https://d3-graph-gallery.com/graph/interactivity_tooltip.html#mostbasic 
        const currentXSelectionValue = d3.select("#selectButtonX").property("value");
        const currentYSelectionValue = d3.select("#selectButtonY").property("value");

        if (currentXSelectionValue === "bodyMass") {
            var x_displayName = "body mass"
            var x_unit = "grams"
        } else if (currentXSelectionValue === "flipperLength") {
            var x_displayName = "flipper length"
            var x_unit = "millimetres"
        } else if (currentXSelectionValue === "culmenLength") {
            var x_displayName = "beak length"
            var x_unit = "millimetres"
        } else if (currentXSelectionValue === "culmenDepth") {
            var x_displayName = "beak depth"
            var x_unit = "millimetres"
        }

        if (currentYSelectionValue === "bodyMass") {
            var y_displayName = "body mass"
            var y_unit = "grams"
        } else if (currentYSelectionValue === "flipperLength") {
            var y_displayName = "flipper length"
            var y_unit = "millimetres"
        } else if (currentYSelectionValue === "culmenLength") {
            var y_displayName = "beak length"
            var y_unit = "millimetres"
        } else if (currentYSelectionValue === "culmenDepth") {
            var y_displayName = "beak depth"
            var y_unit = "millimetres"
        }

        const tooltip = d3.select("#scatterplot").append("div")
            .attr("class", "tooltip")
                .style("position", "absolute")
                .style("opacity", 0)
                .style("background-color", "white")
                .style("color", "black")
                .style("border", "solid")
                .style("border-width", "1px")
                .style("border-radius", "5px")
                .style("padding", "10px")
                
        // A function that change this tooltip when the user hover a point.
        // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
        const mouseover = function(event, d) {
            tooltip
            .style("opacity", 0.8)
            .html(`This individual's ${x_displayName} is ${d[currentXSelectionValue]} ${x_unit} <br> and ${y_displayName} is ${d[currentYSelectionValue]} ${y_unit}.`)
            .style("top", (event.pageY)+"px")
            .style("left",(event.pageX)+"px")
            d3.select(this)
            .style("stroke", "white")
        }

        // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
        const mouseleave = function(event,d) {
            tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
            d3.select(this)
            .style("stroke", "none")
        }

        // Initialize graph with base groups
        const plot = svg
        .append('g')
        .selectAll('circle')
        .data(data)
        .enter()
        .append("circle")
            .attr("cx", function (d) { return x(+d.flipperLength); } )
            .attr("cy", function (d) { return y(+d.bodyMass); } )
            .attr("r", 5)
            .attr("class", function (d) { 
                if(d.species == "Adelie Penguin (Pygoscelis adeliae)"){
                    return "a"
                } else if (d.species == "Chinstrap penguin (Pygoscelis antarctica)") {
                    return "c"
                } else if (d.species == "Gentoo penguin (Pygoscelis papua)") {
                    return "g"
                }
            })
            .style("fill", function (d) { return myColor(d.species) })
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)

        // X axis text
        const xText = svg
            .append("text")
            .text('Flipper length in millimetres')
            .style('fill', 'white')
            .attr("transform", `translate(${width / 2}, ${height + 35})`)
            .style("text-anchor", "middle")

        // Y axis text
        // http://www.d3noob.org/2012/12/adding-axis-labels-to-d3js-graph.html 
        const yText = svg
            .append('text')
            .text("Body mass in grams")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left - 5)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", "white");  

        const highlight = (event, d) => {
            d3.selectAll("circle").style("opacity", .2)

            // expect the one that is hovered
            d3.selectAll("."+d.substring(0,1).toLowerCase()).style("opacity", 1)
        }

        const unhighlight = (d) => {
            d3.selectAll("circle").style("opacity", 1)
        }
        
        // Legend 
        // https://d3-graph-gallery.com/graph/custom_legend.html 
        svg.selectAll("mydots")
            .data(keys)
            .enter()
            .append("circle")
                .attr("cx", 450)
                .attr("cy", function(d,i){ return 5 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
                .attr("r", 7)
                .attr("class", function (d) {return d.substring(0,1).toLowerCase()})
                .style("fill", function(d){ return myColor(d)})
                .on("mouseover", highlight)
                .on("mouseleave", unhighlight)

        svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
            .attr("x", 470)
            .attr("y", function(d,i){ return 10 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d){ return myColor(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", highlight)
            .on("mouseleave", unhighlight)

        // Update X axis function
        function updateX(selectedGroupX, selectedGroupY) {

            // Create new data with the selection?
            const dataFilter = data.map(function(d){return {...d, x: d[selectedGroupX], y: d[selectedGroupY]} })
            
            // create options for axis domain: new extent and new max
            let newXExtent = d3.extent(data, (d) => parseFloat(d[selectedGroupX]))
            let newYExtent = d3.extent(data, (d) => parseFloat(d[selectedGroupY]))
            // let newMaxX = [0, d3.max(data, function(d) { return d[selectedGroupX]})]
            // let newMaxY = [0, d3.max(data, function(d) { return d[selectedGroupY]})]

            if (selectedGroupX === "bodyMass") {
                var newXAxis = "Body mass in grams"
                var x_displayNameNew = "body mass"
                var x_unitNew = "grams"
            } else if (selectedGroupX === "flipperLength") {
                var newXAxis = "Flipper length in millimetres"
                var x_displayNameNew = "flipper length"
                var x_unitNew = "millimetres"
            } else if (selectedGroupX === "culmenLength") {
                var newXAxis = "Beak length in millimetres"
                var x_displayNameNew = "beak length"
                var x_unitNew = "millimetres"
            } else if (selectedGroupX === "culmenDepth") {
                var newXAxis = "Beak depth in millimetres"
                var x_displayNameNew = "beak depth"
                var x_unitNew = "millimetres"
            }

            if (selectedGroupY === "bodyMass") {
                var y_displayNameNew = "body mass"
                var y_unitNew = "grams"
            } else if (selectedGroupY === "flipperLength") {
                var y_displayNameNew = "flipper length"
                var y_unitNew = "millimetres"
            } else if (selectedGroupY === "culmenLength") {
                var y_displayNameNew = "beak length"
                var y_unitNew = "millimetres"
            } else if (selectedGroupY === "culmenDepth") {
                var y_displayNameNew = "beak depth"
                var y_unitNew = "millimetres"
            }

            // x.domain(newMaxX);
            x.domain(newXExtent);
            svg.selectAll(".myXaxis")
                .transition()
                .duration(3000)                     
                .call(xAxis);

            // create new Y axis
            // y.domain(newMaxY);
            y.domain(newYExtent);
            svg.selectAll(".myYaxis")
                .transition()
                .duration(3000)
                .call(yAxis);
                    
            // A function that change this tooltip when the user hover a point.
            // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
            const mouseoverNew = function(event, d) {
                tooltip
                .style("opacity", 0.8)
                .html(`This individual's ${x_displayNameNew} is ${d[selectedGroupX]} ${x_unitNew} <br> and ${y_displayNameNew} is ${d[selectedGroupY]} ${y_unitNew}.`)
                .style("top", (event.pageY)+"px")
                .style("left",(event.pageX)+"px")
                d3.select(this)
                .style("stroke", "white")
            }

            // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
            const mouseleaveNew = function(event,d) {
                tooltip
                .transition()
                .duration(200)
                .style("opacity", 0)
                d3.select(this)
                .style("stroke", "none")
            }

            plot.data(dataFilter)
                .transition().duration(1000)
                    .attr("cx", function (d) { return x(+d.x); } )
                    .attr("cy", function (d) { return y(+d.y); } )

            plot.on('mouseover', mouseoverNew)
                .on('mouseleave', mouseleaveNew)
            
            xText
                .transition()
                .duration(1000)
                .text(`${newXAxis}`)
            
        }
        // Update Y axis function
        function updateY(selectedGroupY, selectedGroupX) {

            // Create new data with the selection?
            const dataFilter = data.map(function(d){return {...d, x: d[selectedGroupX], y: d[selectedGroupY]} })

            // create options for axis domain: new extent and new max
            let newXExtent = d3.extent(data, (d) => parseFloat(d[selectedGroupX]))
            let newYExtent = d3.extent(data, (d) => parseFloat(d[selectedGroupY]))
            // let newMaxX = [0, d3.max(data, function(d) { return d[selectedGroupX]})]
            // let newMaxY = [0, d3.max(data, function(d) { return d[selectedGroupY]})]

            if (selectedGroupY === "bodyMass") {
                var newYAxis = "Body mass in grams"
                var y_displayNameNew = "body mass"
                var y_unitNew = "grams"
            } else if (selectedGroupY === "flipperLength") {
                var newYAxis = "Flipper length in millimetres"
                var y_displayNameNew = "flipper length"
                var y_unitNew = "millimetres"
            } else if (selectedGroupY === "culmenLength") {
                var newYAxis = "Beak length in millimetres"
                var y_displayNameNew = "beak length"
                var y_unitNew = "millimetres"
            } else if (selectedGroupY === "culmenDepth") {
                var newYAxis = "Beak depth in millimetres"
                var y_displayNameNew = "beak depth"
                var y_unitNew = "millimetres"
            }

            if (selectedGroupX === "bodyMass") {
                var x_displayNameNew = "body mass"
                var x_unitNew = "grams"
            } else if (selectedGroupX === "flipperLength") {
                var x_displayNameNew = "flipper length"
                var x_unitNew = "millimetres"
            } else if (selectedGroupX === "culmenLength") {
                var x_displayNameNew = "beak length"
                var x_unitNew = "millimetres"
            } else if (selectedGroupX === "culmenDepth") {
                var x_displayNameNew = "beak depth"
                var x_unitNew = "millimetres"
            }

            x.domain(newXExtent);
            // x.domain(newMaxX);
            svg.selectAll(".myXaxis")
                .transition()
                .duration(3000)
                .call(xAxis);

            // create new Y axis
            y.domain(newYExtent);
            // y.domain(newMaxY);
            svg.selectAll(".myYaxis")
                .transition()
                .duration(3000)
                .call(yAxis);
                    
            // A function that change this tooltip when the user hover a point.
            // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
            const mouseoverNew = function(event, d) {
                tooltip
                .style("opacity", 0.8)
                .html(`This individual's ${x_displayNameNew} is ${d[selectedGroupX]} ${x_unitNew} <br> and ${y_displayNameNew} is ${d[selectedGroupY]} ${y_unitNew}.`)
                .style("top", (event.pageY)+"px")
                .style("left",(event.pageX)+"px")
                d3.select(this)
                .style("stroke", "white")
            }

            // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
            const mouseleaveNew = function(event,d) {
                tooltip
                .transition()
                .duration(200)
                .style("opacity", 0)
                d3.select(this)
                .style("stroke", "none")  
            }

            plot.data(dataFilter)
                .transition().duration(1000)
                    .attr("cx", function (d) { return x(+d.x); } )
                    .attr("cy", function (d) { return y(+d.y); } )

            plot.on('mouseover', mouseoverNew)
                .on('mouseleave', mouseleaveNew)

            yText
                .transition()
                .duration(1000)
                .text(`${newYAxis}`)
        }

        // When the button is changed, run the updateChart function
        d3.select("#selectButtonX").on("change", function(event,d) {
            // recover the option that has been chosen
            const selectedOptionX = d3.select(this).property("value")
            const selectedOptionY = d3.select("#selectButtonY").property("value")
            // run the updateChart function with this selected option
            updateX(selectedOptionX, selectedOptionY)
        })
        d3.select("#selectButtonY").on("change", function(event,d) {
            const selectedOptionY = d3.select(this).property("value")
            const selectedOptionX = d3.select("#selectButtonX").property("value")
            updateY(selectedOptionY, selectedOptionX)
        })
    })
}
