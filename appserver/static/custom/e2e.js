
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
		className: 'e2e-viz',
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
            var html = '<center>';
            html += '<table style="color: #edcc3a; border-collapse:collapse; border-spacing: 0px; margin-left:auto; margin-right:auto; background-repeat: no-repeat; background-image: url(/static/app/oidemo/end2end.png);">';
            html += '<tr><td colspan="3"><img src="/static/app/oidemo/end2end.png"></td></tr>';
            html += '<tr style="height: 63px;"><td rowspan="2" style="font-size: 65px; color: silver; text-align: left;">[&middot;&middot;&middot;&middot;</td><td style="padding-top: 10px; font-size: 45px; color: #386786; letter-spacing: -5px; font-weight: bold; padding: 0; text-align: center;">';

            html += data[0]['bytes'];

            html += '</td><td rowspan="2" style="font-size: 65px; color: silver; text-align: right;">&middot;&middot;&middot;&middot;]</td></tr>';
            html += '<tr><td style="font-size: 15px; color: #487fa5; padding: 0px; position: relative; top: -11px; left: 5px; text-align: center;">milliseconds</td></tr>';
            html += '</table>';
            html += '</center>';

            $("#"+this.$el.attr("id")).html(html);

        },
        getResultsLinkOptions: function() {
        	return {};
        }
	});

});

