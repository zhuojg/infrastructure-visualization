// 使用MutationObserver监听css变化以实现skrollr与d3的结合
var options = {
    'childList': true,
    'attributes': true,
    'attributeOldValue': true
}

var data;
var category = [];
var color;

// listen id=continue
// 用回调函数初始化observer
var observer_zero = new MutationObserver(function (mutations, observer) {
    mutations.map(function(mutation) {
        if(mutation.oldValue != "" && mutation.oldValue != "skrollable" && mutation.oldValue != null) {
            console.log(mutation.oldValue);
            points();
            observer.disconnect();
        }
    });
});
// observer根据元素和options开始监听
observer_zero.observe(document.querySelector("#continue"), options);
// end of observer_zero

// listen id=continue_one
var observer_one = new MutationObserver(function (mutations, observer) {
    mutations.map(function(mutation) {
        if(mutation.oldValue != "" && mutation.oldValue != "skrollable" && mutation.oldValue != null) {
            console.log(mutation.oldValue);
            colorPoints();
            observer.disconnect();
        }
    });
});
observer_one.observe(document.querySelector("#continue_one"), options);
// end of observer_one


// function clearPoints() {
//     d3.selectAll("circle").remove();
// }

function points() {
    var svg = d3.select("#main_svg");
    d3.csv("bridge_info.csv", function(d) {
        if(category.indexOf(d["category"].trim()) == -1)
            category.push(d["category"].trim());

        return d;
    }).then(function(d) {
        data = d;
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
        .transition()
        .duration(1000)
        .attr("r", 20);
    }).catch(function(error) {
        console.log(error);
    });
}

function colorPoints() {
    color = d3.scaleOrdinal()
    .domain(category)
    .range(d3.schemeTableau10);

    d3.select("#points")
    .selectAll("circle")
    .data(data)
    .transition()
    .duration(1000)
    .style("fill",function(d){
        return color(d["category"].trim());
    });
}

function lengthPoints() {

}