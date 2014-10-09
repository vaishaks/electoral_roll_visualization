/*global $, jQuery, console, d3, queue, topojson*/
(function () {
    "use strict";
    
    var projection = d3.geo.mercator()
            .scale(1100)
            .center([91, 26]),
        
        path = d3.geo.path()
            .projection(projection),
        
        svg = d3.select("#map")
            .append("svg")
            .attr("height", "100%")
            .attr("width", "100%"),
        
        g = svg.append("g"),
        
        turnoutById = d3.map(),
        
        numbers = {
            "num1": 26.27,
            "num2": 89.26,
            "num3": 88.42,
            "num4": 48.21,
            "num5": 66.4
        },
        
        quantize = d3.scale.quantize()
            .domain([23, 90])
            .range(d3.range(9).map(function (i) { return "q" + i + "-9"; })),
        
        point,
        zoom = 0;
    
    function clicked(d) {
        var x, y;
        if (zoom === 0) {
            /*jshint validthis: true*/
            point = d3.mouse(this);
            x = point[0];
            y = point[1];
            g.transition()
                .duration(750)
                .attr("transform", "translate(-800, -1220)scale(4)translate(" + (280 - x) + "," + (380 - y) + ")");
            zoom = 1;
        } else {
            x = point[0];
            y = point[1];
            g.transition()
                .duration(750)
                .attr("transform", "scale(1)");
            zoom = 0;
        }
    }
    
    function ready(error, india, state) {
        if (error) {
            return console.log(error);
        }
        
        var india_geojson = topojson.feature(india, india.objects.india_pc_2014),
            state_geojson = topojson.feature(state, state.objects.india_state_2014);
        g.selectAll(".india")
            .data(india_geojson.features)
            .enter()
            .append("path")
            .attr("class", "india")
            .attr("class", function (d) { return quantize(turnoutById.get(d.properties.ST_CODE + d.properties.PC_CODE)); })
            .attr("d", path)
            .on("mouseover", function (d) {
                d3.select("#tooltip")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 70) + "px")
                    .select("#pc-label")
                    .html("<strong>" + d.properties.PC_NAME +
                          "</strong><br />Female Turnout: " +
                          turnoutById.get(d.properties.ST_CODE + d.properties.PC_CODE) + "%");
                d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function (d) {
                d3.select("#tooltip").classed("hidden", true);
            })
            .on("click", clicked);
        
        g.selectAll(".state")
            .data(state_geojson.features)
            .enter().append("path")
            .attr("class", "state")
            .attr("d", path);
        
        $(".animate").each(function () {
            $(this).animateNumber({
                number: numbers[$(this).attr("id")] * 100,
                numberStep: function (now, tween) {
                    var floored_number = Math.floor(now) / 100,
                        target = $(tween.elem);
                    floored_number = floored_number.toFixed(2);
                    target.text(floored_number + "%");
                }
            }, 4000);
        });
        
        $("#india-turnout-donut").circliful();
    }
    
    queue()
        .defer(d3.json, "india.topojson")
        .defer(d3.json, "india_state_2014_simplified.topojson")
        .defer(d3.csv, "female_turnout.csv", function (d) { turnoutById.set(d.ST_CODE + d.PC_CODE, d.Female_Turnout); })
        .await(ready);
}());