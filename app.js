(function () {
    var projection = d3.geo.mercator()
        .center([78, 27])
        .scale(1200);

    var path = d3.geo.path()
        .projection(projection);
    
    var svg = d3.select("body")
        .append("svg")
        .attr("height", "100%")
        .attr("width", "100%");
    
    var turnoutById = d3.map();
    
    var quantize = d3.scale.quantize()
        .domain([23, 90])
        .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));
    
    queue()
        .defer(d3.json, "india.topojson")
        .defer(d3.json, "india_state_2014_simplified.topojson")
        .defer(d3.csv, "female_turnout.csv", function(d) { turnoutById.set(d.ST_CODE+d.PC_CODE, d.Female_Turnout); })
        .await(ready);
    
    function ready(error, india, state) {
        if (error) {
            return console.log(error);
        }
        
        var india_geojson = topojson.feature(india, india.objects.india_pc_2014);
        svg.selectAll(".india")
            .data(india_geojson.features)
            .enter()
            .append("path")
            .attr("class", "india")
            .attr("class", function(d) { return quantize(turnoutById.get(d.properties.ST_CODE+d.properties.PC_CODE)); })
            .attr("d", path)
            .on("mouseover", function(d) {
                d3.select("#tooltip")
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 70) + "px")
                    .select("#pc-label")
                    .html("<strong>" + d.properties.PC_NAME + 
                          "</strong><br />Female Turnout: " + 
                          turnoutById.get(d.properties.ST_CODE+d.properties.PC_CODE) + "%")
                d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function(d) {
                d3.select("#tooltip").classed("hidden", true);
            });
        
        var state_geojson = topojson.feature(state, state.objects.india_state_2014);
        svg.selectAll(".state")
          .data(state_geojson.features)
          .enter().append("path")
          .attr("class", "state")
          .attr("d", path);
    }
    
    var numbers = {
        "num1": 26.26,
        "num2": 89.27,
        "num3": 88.42,
        "num4": 48.21,
        "num5": 66.4
    };
    
    $(".animate").each(function() {
        $(this).animateNumber({
            number: numbers[$(this).attr("id")] * 100,
            numberStep: function(now, tween) {
                    var floored_number = Math.floor(now)/100;
                    target = $(tween.elem);
                    floored_number = floored_number.toFixed(2);
                    target.text(floored_number+"%");
                }
            },
            4000
        );
    });
    
    $("#india-turnout-donut").circliful();
    $(window).focus(function() {
        window.location.reload();
    });
}());