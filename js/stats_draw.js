var data = [];
var plot_data = [];

$(document).ready(function () {
    d3.csv("data/cp3.csv", function(d){
        data = d;
        key = "PTS";
        load_plot_data(key);
        draw(key);

        add_table();

        $("#draw").change(function(){
            key = $("#draw").val();
            load_plot_data(key);
            // now that we have plot data, so we can draw
            $("#v4").empty();
            draw(key); 
        })
    });
});

var name_list = ["Season", "Age", "Tm", "Lg", "Pos", "G", "GS", "MP", "FG", "FGA", "FG%", "3P", "3PA", "3P%", "2P", "2PA", "2P%", "eFG%", "FT", "FTA", "FT%", "ORB", "DRB", "TRB", "AST", "STL", "BLK", "TOV", "PF", "PTS"]
var key_list = ["Season", "PTS", "3P", "3PA", "MP", "TRB", "AST", "STL", "BLK", "TOV", "PF", "FG", "FGA"]

function add_table(){
    var markup = "";
    for (var i in data){
        if (i != "columns"){
            markup += "<tr>"
                for (var j in key_list){
                    markup += "<td>" + data[i][key_list[j]] + "</td>"
                }
            markup += "</tr>"
        }
    }
    $("#add_table").append(markup);
}

function load_plot_data(key){
    plot_data = []
    //key value pair
    for (var i in data){
        if (i != "columns"){
            plot_data.push([data[i]["Season"].substring(0,4), data[i][key]])
        }
    }
}


function draw(key){
    // data is plot_data
        // data = plot_data;
        o_width = parseInt($("#v4").attr("width"));
        o_height = parseInt($("#v4").attr("height"));
    
        var svg = d3.select("#v4")
        .attr("width", o_width)
        .attr("height", o_height),
        margin = {top: 50, right: 20, bottom: 110, left: 40},
        margin2 = {top: 530, right: 20, bottom: 30, left: 40},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        height2 = +svg.attr("height") - margin2.top - margin2.bottom;
    
        var parseDate = d3.timeParse("%Y");
    
        var x = d3.scaleTime().range([0, width]),
            x2 = d3.scaleTime().range([0, width]),
            y = d3.scaleLinear().range([height, 0]),
            y2 = d3.scaleLinear().range([height2, 0]);
    
        var xAxis = d3.axisBottom(x),
            xAxis2 = d3.axisBottom(x2),
            yAxis = d3.axisLeft(y);
    
        var brush = d3.brushX()
            .extent([[0, 0], [width, height2]])
            .on("brush end", brushed);
    
        var zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", zoomed);
    
            var line = d3.line()
                .x(function (d) { return x(parseDate(d[0])); })
                .y(function (d) { return y(d[1]); });
    
            var line2 = d3.line()
                .x(function (d) { return x2(parseDate(d[0])); })
                .y(function (d) { return y2(d[1]); });
    
            var area = d3.area()
                .x(function(d) { return x(parseDate(d[0])); })
                .y0(height)
                .y1(function(d) { return y(d[1]); });
    
    
            var Line_chart = svg.append("g")
                .attr("class", "focus")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("clip-path", "url(#clip)");
    
            var focus = svg.append("g")
                .attr("class", "focus")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        var context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");
    
    
        x.domain([d3.min(plot_data, function(d) {return parseDate(d[0]); }), d3.max(plot_data, function(d) {return parseDate(d[0]); })]);
        y.domain([0, d3.max(plot_data, function (d) { return d[1]; })]);
        x2.domain(x.domain());
        y2.domain(y.domain());
    
            focus.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);
    
            focus.append("g")
                .attr("class", "axis axis--y")
                .call(yAxis);
    
            Line_chart.append("path")
                .datum(plot_data)
                .attr("class", "line")
                .attr("d", line);
    
            Line_chart.append("path")
                .datum(plot_data)
                .attr("class", "area")
                .attr("d", area);
    
            context.append("path")
                .datum(plot_data)
                .attr("class", "line")
                .attr("d", line2);
    
    
        context.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);
    
        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, x.range());
    
        svg.append("rect")
            .attr("class", "zoom")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(zoom);
    
        // svg.append("text").attr("x",width/2.5).attr("y", 30).attr("class","title").attr("style", "font-size : 20").text("State: " + state_code + ", Name: " + name);
    
        function brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        var s = d3.event.selection || x2.range();
        x.domain(s.map(x2.invert, x2));
        Line_chart.select(".line").attr("d", line);
        Line_chart.select(".area").attr("d", area);
        Line_chart.select(".text")
        .attr("x", function(d) { return x(parseDate(d[0])) - 4; })
        .attr("y", function(d) { if(y(d[1]) - 20 < y(70)){
            return y(d[1]) + 20} else { return y(d[1]) - 15; }})	
        .text(function(d) { return d[1]; });
    
        focus.select(".axis--x").call(xAxis);
        svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
            .scale(width / (s[1] - s[0]))
            .translate(-s[0], 0));
        }
    
        function zoomed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        var t = d3.event.transform;
        x.domain(t.rescaleX(x2).domain());
        Line_chart.select(".line").attr("d", line);
        Line_chart.select(".area").attr("d", area);	
    
        focus.select(".axis--x").call(xAxis);
        context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
        }
        
}