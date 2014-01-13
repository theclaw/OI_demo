require([
    'jquery',
    '/static/app/oidemo/custom/bubblechart.js',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/utils',
    'splunkjs/mvc/simplexml/ready!'
],function($, BubbleChart, SearchManager, utils){

    var UrlTokenModel = require("splunkjs/mvc/simplexml/urltokenmodel");

    new SearchManager({
        "id": 'customsearch1',
        "search": 'index="oidemo" sourcetype="business_event" (orderType=NewActivation OR orderType=AddLOS) | stats count by marketCity, marketState',
        "app": utils.getCurrentApp(),
        "auto_cancel": 90,
        "status_buckets": 0,
        "preview": true,
        "timeFormat": "%s.%Q",
        "wait": 0,
        "earliest_time": "$earliest$",
        "latest_time": "$latest$"
    }, {tokens: true, tokenNamespace: "submitted"});

    new BubbleChart({
        id: 'custom1',
        managerid: 'customsearch1',
        labelField: 'MarketState',
        el: $('#custom')
    }).render();

});
