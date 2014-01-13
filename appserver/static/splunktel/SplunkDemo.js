// Declare some global options
var SplunkDemo = {
	serviceOptions: {
		version: "6.0",
		port: "12001",
		scheme: "http",
		host: "localhost",
		autologin: false
	},
	appName: 'oidemo'
};

// Init service
var http = new splunkjs.ProxyHttp( "/en-US/splunkd/__raw" );
var service = new splunkjs.Service( http, SplunkDemo.serviceOptions );
