points();

function points() {
    var svg = d3.select("#main_svg");
    d3.csv("test_position.csv", function(d) {
        return d;
    }).then(function(d) {
        svg.append("g")
        .attr("id", "points")
        .selectAll("circle")
        .data(d)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return 1080  + 77.50559635997251 * parseFloat(d["latitude"]) - 2867.123671576876 - 64.6;
        })
        .attr("cy", function(d) {
            result = 59.30918915865678 * parseFloat(d["longitude"]) - 5342.349618255932;
            return result;
        })
        .attr("r", 5);
    }).catch(function(error) {
        console.log(error);
    });
}
