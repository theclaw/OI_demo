
// Translations for en_US
i18n_register({"plural": function(n) { return n == 1 ? 0 : 1; }, "catalog": {}});


define(function(require, module){
//    require('css!./tagcloud.css');
	var _ = require('underscore'), $ = require('jquery');
	var SimpleSplunkView = require('splunkjs/mvc/simplesplunkview');
	var Drilldown = require('splunkjs/mvc/drilldown');
    var d3mod = require('/static/app/oidemo/custom/d3.v3.min.js');

//	require('css!./tagcloud.css');

	return SimpleSplunkView.extend({
        moduleId: module.id,
		className: 'bubblechart-viz',
		options: {
			labelField: 'label',
			magnitudeField: 'count',
			minFontSize: 8,
			maxFontSize: 36,
			data: 'preview'
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
            $("#"+this.$el.attr("id")+">.splunk-message-container").remove();
        	return true;
        },
        updateView: function(viz, data) {
            var bubblechart = { 'name': 'Markets', 'children': [ ] };
            for (var i=0; i < data.length; i++) {
                // Search for phoneType in existing children
                var destStateIdx = -1;
                $.each(bubblechart.children, function(idx, el) {
                    if (el.name == data[i]['marketState']) {
                        destStateIdx = idx;
                    }
                });
                if (destStateIdx == -1) {
                    bubblechart.children.push({ 'name': data[i]['marketState'], children: [ ] });
                    destStateIdx = bubblechart.children.length - 1;
                }

                bubblechart.children[destStateIdx].children.push({ 'name': data[i]['marketCity'], 'size': data[i]['count'] }); 
            }
            var diameter = 450,
            //var height = 400;
            //var width = 600;
            
            format = d3.format(",d"),
            color = d3.scale.category20c();

            var bubble = d3.layout.pack()
                .sort(null)
                .size([diameter, diameter])
                .padding(1.5);

            d3.select("#"+this.$el.attr("id")+">svg").remove();
            var svg = d3.select("#"+this.$el.attr("id")).append("svg")
                .attr("width", diameter)
                .attr("height", diameter)
                .attr("class", "bubble");

            $("#"+this.$el.attr("id")+">svg").css("margin-left", "auto");
            $("#"+this.$el.attr("id")+">svg").css("margin-right", "auto");
            $("#"+this.$el.attr("id")+">svg").css("display", "block");

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
                if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
                else classes.push({packageName: name, className: node.name, value: node.size});
              }

              recurse(null, root);
              return {children: classes};
            }

            d3.select(self.frameElement).style("height", diameter+ "px");
        },
        getResultsLinkOptions: function() {
        	return {};
        }
	});

});

