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
var current = {}
var observer = {}
var forward_func = {
    'bridge_building': bridgeBuilding,
    'bridge_category': bridgeCategory,
    'bridge_category_xiela': bridgeCategoryXiela,
    'bridge_category_gong': bridgeCategoryGong,
    'bridge_length': bridgeLength,
}
var backward_func = {
    'bridge_building': deBridgeBuilding,
    'bridge_category': deBridgeCategory,
    'bridge_category_xiela': deBridgeCategoryXiela,
    'bridge_category_gong': deBrdigeCategoryGong,
    'bridge_length': deBridgeLength,
}
var part = ['bridge_building', 'bridge_category', 'bridge_category_xiela', 'bridge_category_gong', 'bridge_length']

part.forEach(function(item) {
    // 用回调函数初始化observer
    // 如果current状态为false,opacity变为1,则开始出现的动画
    // 如果current状态为true,opacity变为0,则开始消失的动画
    current[item] = false;
    observer[item] = new MutationObserver(function(mutations, observer) {
        mutations.map(function(mutation) {
            if (current[item] == false && mutation.target.style.cssText == "opacity: 1;") {
                console.log(forward_func[item]);
                forward_func[item]();
                current[item] = true;
            }
            else if (current[item] == true && mutation.target.style.cssText == "opacity: 0;") {
                console.log(item);
                backward_func[item]();
                current[item] = false;
            }
        })
    });
    observer[item].observe(document.querySelector("#" + item), options);
});

function bridgeBuilding() {
    showPoints();
}

function deBridgeBuilding() {
    clearPoints();
}

function bridgeCategory() {
    colorPoints();
    setTimeout(gatherCategory, 1000);
}

function deBridgeCategory() {
    decolorPoints();
    setTimeout(colorOneCategory("斜拉桥"), 500);
    setTimeout(degatherCategory, 1000);
}

function bridgeCategoryXiela() {
    colorOneCategory("斜拉桥");
}

function deBridgeCategoryXiela() {
    decolorOneCategory();
}

function bridgeCategoryGong() {
    colorOneCategory("拱桥");
}

function deBrdigeCategoryGong() {
    decolorOneCategory()
}

function bridgeLength() {
    lengthPoints();
}

function deBridgeLength() {
    delengthPoints();
}

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
    d3.csv("bridge_info.csv", function (d) {
        if (category.indexOf(d["category"].trim()) == -1)
            category.push(d["category"].trim());

        color = d3.scaleOrdinal()
        .domain(category)
        // .range(d3.schemeTableau10);
        .range(['#1f77b4', '#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf']);

        return d;
    }).then(function (d) {
        data = d;
        svg.append("g")
            .attr("id", "points")
            .selectAll("circle")
            .data(d)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return 1080 + 77.50559635997251 * parseFloat(d["latitude"]) - 2867.123671576876 - 64.6;
            })
            .attr("cy", function (d) {
                return 59.30918915865678 * parseFloat(d["longitude"]) - 5342.349618255932;
            })
            .attr("r", 0)
            .style("fill", 'gray');
    }).catch(function (error) {
        console.log(error);
    });
}

function colorPoints() {
    d3.select("#points")
        .selectAll("circle")
        .data(data)
        .transition()
        .duration(1000)
        .style("fill", function (d) {
            return color(d["category"].trim());
        });
    
    arcs = d3.select("#main_svg")
    .append("g")
    .attr("id", "arcs")

    // draw arcs
    data.forEach(function(item) {
        if(item["category"].indexOf("+") != -1) {
            categories = item["category"].split("+")
            arcGenerator = d3.arc();

            arc_first = arcGenerator({
                innerRadius: 0,
                outerRadius: 20,
                startAngle: 0,
                endAngle: Math.PI,
            })

            arc_second = arcGenerator({
                innerRadius: 0,
                outerRadius: 20,
                startAngle: Math.PI,
                endAngle: Math.PI * 2,
            })

            arcs.append("path")
            .attr("d", arc_first)
            .attr("transform", function() {
                return "translate(" 
                + String(1080 + 77.50559635997251 * parseFloat(item["latitude"]) - 2867.123671576876 - 64.6)
                + "," + String(59.30918915865678 * parseFloat(item["longitude"]) - 5342.349618255932) + ")"
            })
            .attr("fill", color(categories[0]));

            arcs.append("path")
            .attr("d", arc_second)
            .attr("transform", function() {
                return "translate(" 
                + String(1080 + 77.50559635997251 * parseFloat(item["latitude"]) - 2867.123671576876 - 64.6)
                + "," + String(59.30918915865678 * parseFloat(item["longitude"]) - 5342.349618255932) + ")"
            })
            .attr("fill", color(categories[1]));
        }
    })
}

function decolorPoints() {
    d3.select("#points")
        .selectAll("circle")
        .data(data)
        .transition()
        .duration(500)
        .style("fill", "gray");
}

function colorOneCategory(type) {
    d3.select("#points")
        .selectAll("circle")
        .data(data)
        .transition()
        .duration(1000)
        .style("fill", function (d) {
            if (d["category"] == type) {
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
    category.forEach(function (type, i) {
        index_x[type] = 0;
        index_y[type] = 0;
        start_position[type] = 100 + 280 * i;
    });

    d3.select("#points")
        .selectAll("circle")
        .data(data)
        .transition()
        .duration(500)
        .attr("cx", function (d) {
            result = (90 + (index_x[d["category"]] % 20) * 50);
            index_x[d["category"]] = index_x[d["category"]] + 1;
            return result;
        })
        .attr("cy", function (d) {
            result = (start_position[d["category"]] + parseInt(index_y[d["category"]] / 20) * 50);
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
        .text(function (d) {
            return d;
        })
        .attr("font-size", 30)
        .attr("x", 70)
        .attr("y", function (d, i) {
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
        .attr("cx", function (d) {
            return 1080 + 77.50559635997251 * parseFloat(d["latitude"]) - 2867.123671576876 - 64.6;
        })
        .attr("cy", function (d) {
            result = 59.30918915865678 * parseFloat(d["longitude"]) - 5342.349618255932;
            return result;
        })
}

function lengthPoints() {
    var lengthScale = d3.scaleLinear()
        .domain(d3.extent(data, function (d) {
            return parseFloat(d["length"]);
        }))
        .range([10, 100]);

    d3.select("#points")
        .selectAll("circle")
        .data(data)
        .transition()
        .duration(1000)
        .attr("r", function (d) {
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