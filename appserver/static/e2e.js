require([
    'jquery',
    '/static/app/oidemo/custom/e2e.js',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/utils',
    'splunkjs/mvc/simplexml/ready!'
],function($, e2e, SearchManager, utils){

    var UrlTokenModel = require("splunkjs/mvc/simplexml/urltokenmodel");

    new SearchManager({
        "id": 'customsearch1',
        "search": 'index=oidemo sourcetype="access_combined" | eval web_capacity = 20 | eval app_capacity = bytes / 50 | eval db_capacity = bytes / 30 | stats avg(web_capacity) as web_capacity avg(app_capacity) as app_capacity avg(db_capacity) as db_capacity | eval bytes = round(web_capacity + app_capacity + db_capacity) | fields + bytes',
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "status_buckets": 0,
        "preview": true,
        "timeFormat": "%s.%Q",
        "wait": 0,
        "earliest_time": "rt-5m",
        "latest_time": "rt"
    }, {tokens: true, tokenNamespace: "submitted"});

    new e2e({
        id: 'custom1',
        managerid: 'customsearch1',
        labelField: 'MarketState',
        el: $('#e2e')
    }).render();

});
