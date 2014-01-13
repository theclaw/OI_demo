require.config({
    shim: {
        "splunkjs/mvc/d3chart/d3/d3.v2": {
            deps: [],
            exports: "d3"
        }
    }
});

define([
    'underscore',
    'jquery',
    'splunkjs/mvc/simplesplunkview',
    'splunkjs/mvc/drilldown',
    'splunkjs/mvc/d3chart/d3/d3.v2'
], function(_, $, SimpleSplunkView, Drilldown, d3) {

    return SimpleSplunkView.extend({
        className: 'bubblechart-viz',
        options: {
            labelField: 'label',
            magnitudeField: 'count',
            minFontSize: 6,
            maxFontSize: 25,
            data: 'preview',
            height: 450
        },
        output_mode: 'json',
        events: {
            'click a': function(e) {
                e.preventDefault();
                Drilldown.handleDrilldown({
                    name: this.settings.get('labelField'),
                    value: $.trim($(e.target).text())
                }, 'row', this.manager);
            }
        },
        createView: function() {
            $("#" + this.$el.attr("id") + ">.splunk-message-container").remove();
            return true;
        },
        updateView: function(viz, data) {

            var labelField = this.settings.get('labelField');
            var categoryField = this.settings.get('categoryField');
            var magnitudeField = this.settings.get('magnitudeField');

            var plotData;
            if(categoryField) {
                plotData = _(data).chain()
                        .groupBy(function(result){ return result[categoryField]; })
                        .map(function(children, name){
                            return { name: name, children: children }
                        })
                        .value()
            } else {
                plotData = [{ name: "DATA", children: data }];
            }

            _(plotData).each(function(series){
                series.children = _(series.children).map(function(rec){
                    return { name: rec[labelField], size: rec[magnitudeField] }
                });
            });

            var bubblechart = { 'name': 'Bubble', 'children': plotData };

            var format = d3.format(",d"), color = d3.scale.category20c();

            var width = this.$el.width(), height = this.settings.get('height');

            var bubble = d3.layout.pack()
                    .sort(null)
                    .size([width, height])
                    .padding(1.5);

            var SVG = "#" + this.$el.attr("id") + ">svg";

            d3.select(SVG).remove();
            var svg = d3.select("#" + this.$el.attr("id")).append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("class", "bubble");

            $(SVG).css("margin-left", "auto")
                    .css("margin-right", "auto")
                    .css("display", "block");

            var node = svg.selectAll(".node")
                    .data(bubble.nodes(classes(bubblechart))
                            .filter(function(d) { return !d.children; }))
                    .enter().append("g")
                    .attr("class", "node")
                    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

            node.append("title")
                    .text(function(d) { return d.className + ": " + format(d.value); });

            node.append("circle")
                    .attr("r", function(d) { return d.r; })
                    .style("fill", function(d) { return color(d.packageName); });

            node.append("text")
                    .attr("dy", ".3em")
                    .style("text-anchor", "middle")
                    .text(function(d) { return d.className.substring(0, d.r / 3); });

            // Returns a flattened hierarchy containing all leaf nodes under the root.
            function classes(root) {
                var classes = [];

                function recurse(name, node) {
                    if (node.children) {
                        node.children.forEach(function(child) { recurse(node.name, child); });
                    }
                    else {
                        classes.push({packageName: name, className: node.name, value: node.size});
                    }
                }

                recurse(null, root);
                return {children: classes};
            }

            d3.select(self.frameElement).style("height", height + "px");
        }
    });

});
