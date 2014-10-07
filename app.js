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
            .attr("d", path);
        
        var state_geojson = topojson.feature(state, state.objects.india_state_2014);
        svg.selectAll(".state")
          .data(state_geojson.features)
          .enter().append("path")
          .attr("class", "state")
          .attr("d", path);
    }
}());