// Asynchronously load charting/timeline scripts
var chartToken = splunkjs.UI.loadCharting( 
	"../js/vendor/splunk-v1.1/splunk.ui.charting.js",
	function() { /*console.log( 'charting loaded' );*/ }
);

var timelineToken = splunkjs.UI.loadTimeline(
	"../js/vendor/splunk-v1.1/splunk.ui.timeline.js",
	function() { /*console.log( 'timeline loaded' );*/ }
);



/***************************************************
* TOP 5 PHONES
***************************************************/
var updateTop5Phones = function() {

	var searchName = 'rt_Top 5 Phones';

	var query = 'search index="' + SplunkDemo.appName + '" sourcetype="business_event" (orderType=NewActivation OR orderType=AddLOS) | ' +
				'fillnull value="NULL" marketCity networkProviderName orderType phoneName planDescription planPrice planType | ' +
				'search networkProviderName="*" planType="*" | ' +
				'eval last2Hours=if(_time>relative_time(now(), "-2h"), 1, 0) | ' +
				'stats count by _time, last2Hours, marketCity, orderType, networkProviderName, phoneName, planDescription, planPrice, planType | ' +
				'stats sum(count) as Sales by phoneName | ' +
				'sort limit=5 Sales desc';
	console.log("rt_Top 5 names", query);
	var chart = null;

	var selector = '#top-5-phones';

	// Helper function to push results to chart
	var updateChart = function( data, isFinalUpdate ) {

		var setData = function() {
			if ( data.columns && data.columns.length ) {

				chart.setData( data, {
					'legend.placement': 'none',
					'primaryAxisTitle.text': 'Plan',
					'secondaryAxisTitle.text': 'Sales',
					'chart.barSpacing': 3,
					'seriesColors': '["0xff9385"]'
				} );

				chart.draw();
			}
		}

		if ( chart === null ) {
			splunkjs.UI.ready( chartToken, function() {

				// create chart for the first time
				chart = new splunkjs.UI.Charting.Chart( 
					$( selector ).find( '.chart' ),
					splunkjs.UI.Charting.ChartType.BAR,
					false
				);

				setData();
			} );
		}
		else {
			setData();
		}
	};


	// Run a normal search
	service.search( 
	query,
	{
		id: searchName,
		earliest_time: 'rt-60m',
		latest_time: 'rt'
	},
	{ app: SplunkDemo.appName },
	function( err, job ) {

		// Display the job's search ID
		//console.log( "Job SID: ", job.sid );

		// Poll the status of the search job
		job.track( 
			{ period: 3000 },
			{
				ready: function( job ) { },
				progress: function( job ) {
					//console.log( "-- progress, " + ( job.properties().eventCount || 0 ) + " events so far" );

					job.preview( 
						{ count: 0, output_mode: 'json_cols' },
						function( err, results, job ) {
							if ( err ) console.log( 'Error getting results for ' + searchName + ': ', err );
							if ( results ) updateChart( results );
						}
					);
				},
				failed: function( job ) {
					console.log( searchName + ' job failed' );
				},
				error: function( err ) {
					console.log( 'Error with ' + searchName + ' job: ', err );
				}
			}
		); // end job.track

	}); // end service.search()
};



/***************************************************
* RATE PLAN SALES
***************************************************/
var updateRatePlanSales = function() {

	var searchName = 'rt_Rate Plan Sales';

	var query = 'search index="' + SplunkDemo.appName + '" sourcetype="business_event" (orderType=NewActivation OR orderType=AddLOS) | ' +
				'fillnull value="NULL" marketCity networkProviderName orderType phoneName planDescription planPrice planType | ' +
				'search networkProviderName="*" planType="*" | ' +
				'eval last2Hours=if(_time>relative_time(now(), "-2h"), 1, 0) | ' +
				'stats count by _time, last2Hours, marketCity, orderType, networkProviderName, phoneName, planDescription, planPrice, planType | ' +
				'stats sum(count) as Sales by planDescription | ' +
				'sort Sales desc';

	var $table = null;

	// A small utility function to populate the table with data
	var updateTable = function( data ) {

		var selector = '#rate-plan-sales';

		if ( data.rows && data.rows.length ) {

			// Create dataTable container
			if ( $table === null ) {
				$table = $( '<table cellpadding="0" cellspacing="0" border="0" class="display"></table>' );
				$( selector ).find( '.chart' ).html( $table );
			}

			// Map column names to required table format
			data.columns = [];
			for ( var i = 0; i < data.fields.length; i++ ) {
				data.columns.push( { sTitle: data.fields[i] } );
			}

			var dt;

			// Check to see if we've already set up the dataTable
			if ( !$.fn.DataTable.fnIsDataTable( $table.get( 0 ) ) ) {

				// Init dataTable() 
				$table.dataTable( {
					aaData: data.rows,
					aoColumns: data.columns,
					aaSorting: [[1, "desc"]],
					sDom: 'prti'
				} );

			} else {

				// Table has already been instantiated, update data
				dt = $table.dataTable();
				dt.fnClearTable();
				dt.fnAddData( data.rows );
			}

		}
	};

	// Run a normal search
	service.search( 
		query,
		{
			id: searchName,
			earliest_time: 'rt-60m',
			latest_time: 'rt'
		},
		{ app: SplunkDemo.appName },
		function( err, job ) {

			// Display the job's search ID
			//console.log( "Job SID: ", job.sid );

			// Poll the status of the search job
			job.track( 
				{ period: 3000 },
				{
					ready: function( job ) { },
					progress: function( job ) {
						//console.log( "-- progress, " + ( job.properties().eventCount || 0 ) + " events so far" );

						job.preview( 
							{ count: 0, output_mode: 'json_rows' },
							function( err, results, job ) {
								if ( err ) console.log( 'Error getting results for ' + searchName + ': ', err );
								if ( results ) updateTable( results );
							}
						);
					},
					failed: function( job ) {
						console.log( searchName + ' job failed' );
					},
					error: function( err ) {
						console.log( 'Error with ' + searchName + ' job: ', err );
					}
				}
			);
		}
	); // end service.search()
}




/***************************************************
* PHONE SALES
***************************************************/
var updatePhoneSales = function() {

	var searchName = 'rt_Phone Sales';

	var query = 'search index="' + SplunkDemo.appName + '" sourcetype="business_event" (orderType=NewActivation OR orderType=AddLOS) | ' +
				'fillnull value="NULL" marketCity networkProviderName orderType phoneName planDescription planPrice planType | ' +
				'search networkProviderName="*" planType="*" | ' +
				'eval last2Hours=if(_time>relative_time(now(), "-2h"), 1, 0) | ' +
				'stats count by _time, last2Hours, marketCity, orderType, networkProviderName, phoneName, planDescription, planPrice, planType | ' +
				'stats sum(count) as Sales by phoneName | ' +
				'sort Sales desc';

	var $table = null;

	// A small utility function to populate the table with data
	var updateTable = function( data ) {

		var selector = '#phone-sales';

		if ( data.rows && data.rows.length ) {

			// Create dataTable container
			if ( $table === null ) {
				$table = $( '<table cellpadding="0" cellspacing="0" border="0" class="display"></table>' );
				$( selector ).find( '.chart' ).html( $table );
			}

			// Map column names to required table format
			data.columns = [];
			for ( var i = 0; i < data.fields.length; i++ ) {
				data.columns.push( { sTitle: data.fields[i] } );
			}

			var dt;

			// Check to see if we've already set up the dataTable
			if ( !$.fn.DataTable.fnIsDataTable( $table.get( 0 ) ) ) {

				// Init dataTable() 
				$table.dataTable( {
					aaData: data.rows,
					aoColumns: data.columns,
					aaSorting: [[ 1, "desc" ]],
					sDom: 'prti'
				} );

			} else {

				// Table has already been instantiated, update data
				dt = $table.dataTable();
				dt.fnClearTable();
				dt.fnAddData( data.rows );
			}
		}
	};


	// Run a normal search
	service.search( 
		query,
		{
			id: searchName,
			earliest_time: 'rt-60m',
			latest_time: 'rt'
		},
		{ app: SplunkDemo.appName },
		function( err, job ) {

			// Display the job's search ID
			//console.log( "Job SID: ", job.sid );

			// Poll the status of the search job
			job.track( 
				{ period: 3000 },
				{
					ready: function( job ) { },
					progress: function( job ) {
						//console.log( "-- progress, " + ( job.properties().eventCount || 0 ) + " events so far" );

						job.preview( 
							{ count: 0, output_mode: 'json_rows' },
							function( err, results, job ) {
								if ( err ) console.log( 'Error getting results for ' + searchName + ': ', err );
								if ( results ) updateTable( results );
							}
						);
					},
					failed: function( job ) {
						console.log( searchName + ' job failed' );
					},
					error: function( err ) {
						console.log( 'Error with ' + searchName + ' job: ', err );
					}
				}
			);
		}
	); // end service.search()
}



// doc ready
$( function() {

	// Disable all dummy links
	$( 'a[href=#]' ).click( function( e ) { e.preventDefault(); } );

	service.login( function( err, success ) {

		// We check for both errors in the connection as well
		// as if the login itself failed.
		if ( err || !success ) {
			console.log( "Error in logging in" );
			done( err || "Login failed" );
			return;
		}

		updateTop5Phones();
		updateRatePlanSales();
		updatePhoneSales();
	} );

} );