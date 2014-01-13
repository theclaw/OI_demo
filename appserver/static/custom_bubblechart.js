// Translations for en_US
i18n_register({"plural": function(n) { return n == 1 ? 0 : 1; }, "catalog": {}});


require([
    'jquery',
    '/static/app/oidemo/custom/bubblechart.js',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/utils',
    'splunkjs/mvc/simplexml/ready!'
],function($, BubbleChart, SearchManager, utils){

    var UrlTokenModel = require("splunkjs/mvc/simplexml/urltokenmodel");

    new SearchManager({
        "id": 'customsearch11',
        "search": 'index="oidemo" sourcetype="business_event" (orderType=NewActivation OR orderType=AddLOS) $network_provider$ $plan_type$ | stats count by marketState marketCity | sort -count limit=100',
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
        id: 'custom11',
        managerid: 'customsearch11',
        labelField: 'marketState',
        el: $('#custom_bubblechart')
    }).render();

});
