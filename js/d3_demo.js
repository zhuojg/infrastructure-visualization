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
var arc_position = []

var forward_func = {
    'bridge_building': bridgeBuilding,
    'bridge_category': bridgeCategory,
    'bridge_category_xiela': bridgeCategoryXiela,
    'bridge_category_gong': bridgeCategoryGong,
    'bridge_length': bridgeLength,
} // 向下滑动时的回调函数
var backward_func = {
    'bridge_building': deBridgeBuilding,
    'bridge_category': deBridgeCategory,
    'bridge_category_xiela': deBridgeCategoryXiela,
    'bridge_category_gong': deBrdigeCategoryGong,
    'bridge_length': deBridgeLength,
} // 向上滑动时的回调函数

var part = ['bridge_building', 'bridge_category', 'bridge_category_xiela', 'bridge_category_gong', 'bridge_length']

part.forEach(function (item) {
    // 如果current状态为false,opacity变为1,则开始出现的动画
    // 如果current状态为true,opacity变为0,则开始消失的动画
    current[item] = false;
    // 用回调函数初始化observer
    observer[item] = new MutationObserver(function (mutations, observer) {
        mutations.map(function (mutation) {
            if (current[item] == false && mutation.target.style.cssText == "opacity: 1;") {
                console.log(forward_func[item]);
                forward_func[item]();
                current[item] = true;
            } else if (current[item] == true && mutation.target.style.cssText == "opacity: 0;") {
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
    // gatherCategory();
}

function deBridgeCategory() {
    decolorPoints();
    // setTimeout(colorOneCategory("斜拉桥"), 500);
    setTimeout(degatherCategory, 500);
}

function bridgeCategoryXiela() {
    // colorOneCategory("斜拉桥");
}

function deBridgeCategoryXiela() {
    // decolorOneCategory();
}

function bridgeCategoryGong() {
    // colorOneCategory("拱桥");
}

function deBrdigeCategoryGong() {
    // decolorOneCategory()
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
        if (category.indexOf(d["category"].trim()) == -1 && d["category"].indexOf("+") == -1)
            category.push(d["category"].trim());

        color = d3.scaleOrdinal()
            .domain(category)
            // .range(d3.schemeTableau10);
            .range(['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']);

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
        .attr("r", function(d) {
            if(d["category"].indexOf("+") != -1) 
                return 0;
            else
                return 20;
        })
        .transition()
        .duration(1000)
        .style("fill", function (d) {
            if(d["category"].indexOf("+") == -1)
                return color(d["category"]);
            else
                return "gray";
        });

    arcs = d3.select("#main_svg")
        .append("g")
        .attr("id", "arcs")

    // draw arcs
    data.forEach(function (item) {
        if (item["category"].indexOf("+") != -1) {
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
                .attr("transform", function () {
                    result = "translate(" +
                    String(1080 + 77.50559635997251 * parseFloat(item["latitude"]) - 2867.123671576876 - 64.6) +
                    "," + String(59.30918915865678 * parseFloat(item["longitude"]) - 5342.349618255932) + ")";

                    arc_position.push(result);
                    arc_position.push(result);
                    return result;
                })
                .attr("fill", color(categories[0]));

            arcs.append("path")
                .attr("d", arc_second)
                .attr("transform", function () {
                    return "translate(" +
                        String(1080 + 77.50559635997251 * parseFloat(item["latitude"]) - 2867.123671576876 - 64.6) +
                        "," + String(59.30918915865678 * parseFloat(item["longitude"]) - 5342.349618255932) + ")"
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
            } else {
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
    var index_x = {}
    var index_y = {}
    var start_position = {}
    category.forEach(function (type, i) {
        index_x[type] = 0;
        index_y[type] = 0;
        start_position[type] = 100 + 280 * i;
    });

    var current_index = 0;
    var position_x = []
    var position_y = []
    var true_index = []
    var arc_true_index = []

    data.forEach(function() {
        position_x.push(90 + (current_index % 20) * 50);
        position_y.push(100 + parseInt(current_index / 20) * 50);
        true_index.push(0);
        current_index = current_index + 1;
    })

    current_index = 0;

    category.forEach(function(item) {
        data.forEach(function(d, i) {
            if(d["category"] == item) {
                true_index[i] = current_index;
                current_index = current_index + 1;
            }
        })
    });

    data.forEach(function(d, i) {
        if(d["category"].indexOf("+") != -1) {
            true_index[i] = current_index;
            arc_true_index.push(current_index);
            arc_true_index.push(current_index);
            current_index = current_index + 1;
        }
    })

    d3.select("#points")
        .selectAll("circle")
        .data(data)
        .transition()
        .duration(1000)
        .attr("cx", function (d, i) {
            return position_x[true_index[i]];
        })
        .attr("cy", function (d, i) {
            return position_y[true_index[i]];
        });

    // move arc
    d3.select("#arcs").selectAll("path")
    .data(arc_true_index)
    .transition()
    .duration(1000)
    .attr("transform", function(d) {
        return "translate(" + String(position_x[d]) + "," + String(position_y[d]) + ")";
    });
}

function degatherCategory() {
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
        });
    
    d3.select("#arcs").selectAll("path")
        .data(arc_position)
        .transition()
        .duration(500)
        .attr("transform", function(d) {
            return d;
        });
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