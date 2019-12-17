drawPoints();

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
// 如果current状态为false,opacity变为1,则开始出现的动画
// 如果current状态为true,opacity变为0,则开始消失的动画
var current_zero = false;
var observer_zero = new MutationObserver(function (mutations, observer) {
    mutations.map(function(mutation) {
        if(current_zero == false && mutation.target.style.cssText == "opacity: 1;") {
            showPoints();
            current_zero = true;
        }
        else if(current_zero == true && mutation.target.style.cssText == "opacity: 0;") {
            clearPoints();
            current_zero = false;
        }
    });
});
// observer根据元素和options开始监听
observer_zero.observe(document.querySelector("#continue"), options);
// end of observer_zero

// listen id=continue_one
var current_one = false;
var observer_one = new MutationObserver(function (mutations, observer) {
    mutations.map(function(mutation) {
        if(current_one == false && mutation.target.style.cssText == "opacity: 1;") {
            colorPoints();
            setTimeout(gatherCategory, 1000);
            current_one = true;
        }
        else if(current_one == true && mutation.target.style.cssText == "opacity: 0;") {
            decolorPoints();
            setTimeout(degatherCategory, 500);
            current_one = false;
        }
    });
});
observer_one.observe(document.querySelector("#continue_one"), options);
// end of observer_one

// listen id=continue_two
var current_two = false;
var observer_two = new MutationObserver(function (mutations, observer) {
    mutations.map(function(mutation) {
        if(current_two == false && mutation.target.style.cssText == "opacity: 1;") {
            colorOneCategory("斜拉桥");
            current_two = true;
        }
        else if(current_two == true && mutation.target.style.cssText == "opacity: 0;") {
            decolorOneCategory();
            colorPoints();
            current_two = false;
        }
    });
});
observer_two.observe(document.querySelector("#continue_two"), options);
// end of observer_two

// listen id=continue_three
var current_three = false;
var observer_three = new MutationObserver(function (mutations, observer) {
    mutations.map(function(mutation) {
        if(current_three == false && mutation.target.style.cssText == "opacity: 1;") {
            lengthPoints()
            current_three = true;
        }
        else if(current_three == true && mutation.target.style.cssText == "opacity: 0;") {
            delengthPoints();
            current_three = false;
        }
    });
});
observer_three.observe(document.querySelector("#continue_three"), options);
// end of observer_three


function clearPoints() {
    d3.select("#points")
    .selectAll("circle")
    .transition()
    .duration(1000)
    .attr("r", 0)
}

function showPoints() {
    d3.select("#points")
    .selectAll("circle")
    .data(data)
    .transition()
    // .delay(function(d) {
    //     return (d["year"] - 1950) * 100;
    // })
    .duration(1000)
    .attr("r", 20);
}

function drawPoints() {
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
        .attr("r", 0);
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

function decolorPoints() {
    d3.select("#points")
    .selectAll("circle")
    .data(data)
    .transition()
    .duration(500)
    .style("fill", "black");
}

function colorOneCategory(type) {
    d3.select("#points")
    .selectAll("circle")
    .data(data)
    .transition()
    .duration(1000)
    .style("fill",function(d){
        if(d["category"] == type) {
            return color(d["category"].trim());
        }
        else {
            return "gray";
        }
    });
}

function decolorOneCategory() {
    d3.select("#points")
    .selectAll("circle")
    .data(data)
    .transition()
    .duration(500)
    .style("fill", "gray");
}

function gatherCategory() {
    console.log("gathering...");

    var index_x = {}
    var index_y = {}
    var start_position = {}
    category.forEach(function(type, i) {
        index_x[type] = 0;
        index_y[type] = 0;
        start_position[type] = 100 + 280 * i;
    });

    d3.select("#points")
    .selectAll("circle")
    .data(data)
    .transition()
    .duration(500)
    .attr("cx", function(d) {
        result = (90 + (index_x[d["category"]] % 20) * 50);
        index_x[d["category"]] = index_x[d["category"]] + 1;
        return result;
    })
    .attr("cy", function(d) {
        result = (start_position[d["category"]] + parseInt(index_y[d["category"]]/20) * 50);
        index_y[d["category"]] = index_y[d["category"]] + 1;
        return result;
    });

    d3.select("#points")
    .selectAll("text")
    .data(category)
    .enter()
    .append("text")
    .transition()
    .duration(1000)
    .text(function(d) {
        return d;
    })
    .attr("font-size", 30)
    .attr("x",70)
    .attr("y", function(d, i) {
        return 60 + 280 * i;
    });
}

function degatherCategory() {
    console.log("degathering...");

    d3.select("#points")
    .selectAll("text")
    .remove();

    d3.select("#points")
    .selectAll("circle")
    .data(data)
    .transition()
    .duration(500)
    .attr("cx", function(d) {
        return 1080  + 77.50559635997251 * parseFloat(d["latitude"]) - 2867.123671576876 - 64.6;
    })
    .attr("cy", function(d) {
        result = 59.30918915865678 * parseFloat(d["longitude"]) - 5342.349618255932;
        return result;
    })
}

function lengthPoints() {
    var lengthScale = d3.scaleLinear()
        .domain(d3.extent(data, function(d) {
            return parseFloat(d["length"]);
        }))
        .range([10,100]);

    d3.select("#points")
    .selectAll("circle")
    .data(data)
    .transition()
    .duration(1000)
    .attr("r", function(d) {
        return lengthScale(parseFloat(d["length"]));
    });
}

function delengthPoints() {
    d3.select("#points")
    .selectAll("circle")
    .data(data)
    .transition()
    .duration(500)
    .attr("r", 20);
}