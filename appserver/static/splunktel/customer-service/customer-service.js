// Asynchronously load charting/timeline scripts
var chartToken = splunkjs.UI.loadCharting( 
	"/static/app/oidemo/splunktel/js/vendor/splunk-v1.1/splunk.ui.charting.js",
	function() { /*console.log( 'charting loaded' );*/ }
);

var timelineToken = splunkjs.UI.loadTimeline(
	"/static/app/oidemo/splunktel/js/vendor/splunk-v1.1/splunk.ui.timeline.js",
	function() { /*console.log( 'timeline loaded' );*/ }
);



function updateCustomerInfoCharts( phoneNumber, earliest, latest ) {

	service.login( function( err, success ) {

		// We check for both errors in the connection as well
		// as if the login itself failed.
		// if ( err || !success ) {
		// 	console.log( "Error in logging in" );
		// 	done( err || "Login failed" );
		// 	return;
		// }

		/***************************************************
		* CUSTOMER AUTHENTICATIONS OVER TIME
		***************************************************/
		var updateCustomerAuthChart = function() {

			// Define search query
			var query = 'search index=' + SplunkDemo.appName + ' sourcetype=radius start mdn="$sourcetypeToken$" | ' +
						'timechart count';
			query = query.replace( '$sourcetypeToken$', phoneNumber );
			console.log('updateCustomerAuthChart: ', query)
			var selector = '#customer-auth-over-time';
			var chart = null;

			// Helper function to push results to chart
			var updateChart = function( results, isFinalUpdate ) {

				if ( results.columns && results.columns.length ) {

					var setData = function() {

						chart.setData( results, {
							'primaryAxisTitle.text': 'Time',
							'secondaryAxisTitle.text': 'Authentications',
							'legend.placement': 'none'
						} );

						chart.draw();

						// Update "refreshed at" timestamp
						var $refreshed = $( selector ).find( '.refreshed-at' ).data( 'refreshed-at', Date.now() );
						updateRefreshText( $refreshed );
					}

					if ( chart === null ) {
						splunkjs.UI.ready( chartToken, function() {

							// create chart for the first time
							chart = new splunkjs.UI.Charting.Chart( 
								$( selector ).find( '.chart' ),
								splunkjs.UI.Charting.ChartType.COLUMN,
								false
							);

							setData();
						} );

					} else {
						setData();
					}

				} else if ( isFinalUpdate && chart == null ) {

					$( selector ).find( '.chart' ).html( '<div class="no-results">0 results</div>' );
				}
			};


			// Run a normal search
			service.search( 
				query,
				{
					latest_time: latest,
					earliest_time: earliest,
					exec_mode: 'normal'
				},
				{ app: SplunkDemo.appName },
				function( err, job ) {

					// Display the job's search ID
					//console.log( "Job SID: ", job.sid );

					job.enablePreview( function() {

						// Poll the status of the search job
						job.track( 
							{ period: 1000 },
							{
								ready: function( job ) { },
								progress: function( job ) {
									//console.log( "-- fetching, " + ( job.properties().scanCount || 0 ) + " events scanned so far" );

									job.preview( 
										{ output_mode: 'json_cols', count: 0 },
										function( err, results, job ) {
											if ( err ) console.log( 'Error getting results for Customer Auth Over Time: ', err );
											updateChart( results );
										}
									);
								},
								done: function( job ) {
									//console.log( "-- complete, " + ( job.properties().eventCount || 0 ) + " matching events" );
									//PrintJobProperties( job );

									job.results( 
										{ output_mode: 'json_cols', count: 0 },
										function( err, results, job ) {
											if ( err ) console.log( 'Error getting final results for Customer Auth Over Time: ', err );
											if ( results ) updateChart( results, true );
											job.cancel();
										}
									);
								},
								failed: function( job ) { console.log( 'Customer Auth Over Time job failed' ); },
								error: function( err ) { console.log( 'Error with Customer Auth Over Time job: ', err ); }
							}
						);
					} );  // end enablePreview

				}
			); // end service.search()
		};





		/***************************************************
		* CUSTOMER DOWNLOAD HISTORY
		***************************************************/

		var updateCustDownloadChart = function() {

			var query = 'search index=' + SplunkDemo.appName + ' (sourcetype=radius OR sourcetype=access_custom) | ' +
						'transaction maxspan=1m clientip mdn | ' +
						'search mdn="$sourcetypeToken$" bc_uri="/sync/addtolibrary/*" | ' +
						'top track_name';

			query = query.replace( '$sourcetypeToken$', phoneNumber );
			console.log('updateCustDownloadChart', query)

			var selector = '#customer-download-history';

			var chart = null;

			// A small utility function to queue up operations on the chart until it is ready.
			var updateChart = function( data, isFinalUpdate ) {

				if ( data.columns && data.columns.length ) {

					var setData = function() {

						chart.setData( data, {
							'legend.placement': 'none'
						} );

						chart.draw();

						// Update "refreshed at" timestamp
						var $refreshed = $( selector ).find( '.refreshed-at' ).data( 'refreshed-at', Date.now() );
						updateRefreshText( $refreshed );
					}

					if ( chart === null ) {
						splunkjs.UI.ready( chartToken, function() {

							// create chart for the first time
							chart = new splunkjs.UI.Charting.Chart( 
								$( selector ).find( '.chart' ),
								splunkjs.UI.Charting.ChartType.PIE,
								false
							);

							setData();
						} );
					}
					else {
						setData();
					}

				} else if ( isFinalUpdate && chart == null ) {

					$( selector ).find( '.chart' ).html( '<div class="no-results">0 results</div>' );
				}
			};

			service.search( 
				query,
				{
					earliest_time: earliest,
					latest_time: latest,
					exec_mode: 'normal'
				},
				{ app: SplunkDemo.appName },
				function( err, job ) {

					// Display the job's search ID
					//console.log( "Job SID: ", job.sid );

					job.enablePreview( function() {

						// Poll the status of the search job
						job.track( 
							{ period: 1000 },
							{
								ready: function( job ) { },
								progress: function( job ) {
									//console.log( "-- fetching, " + ( job.properties().scanCount || 0 ) + " events scanned so far" );

									job.preview( 
										{ output_mode: 'json_cols', count: 0 },
										function( err, results, job ) {
											if ( err ) console.log( 'Error getting results for Customer Downloads: ', err );
											updateChart( results );
										}
									);
								},
								done: function( job ) {
									//console.log( "-- complete, " + ( job.properties().eventCount || 0 ) + " matching events" );
									//PrintJobProperties( job );

									job.results( 
										{ output_mode: 'json_cols', count: 0 },
										function( err, results, job ) {
											if ( err ) console.log( 'Error getting final results for Customer Downloads: ', err );
											if ( results ) updateChart( results, true );
											job.cancel();
										}
									);
								},
								failed: function( job ) { console.log( 'Customer Downloads job failed' ); },
								error: function( err ) { console.log( 'Error with Customer Downloads job: ', err ); }
							}
						);
					} );  // end enablePreview
				}
			); // end service.search
		};



		/***************************************************
		* ERROR HISTORY
		***************************************************/
		var updateErrorHistoryChart = function() {

			var query = 'search index=' + SplunkDemo.appName + ' (sourcetype=radius OR sourcetype=access_custom) | ' +
						'transaction maxspan=1m clientip mdn | ' +
						'search mdn="$sourcetypeToken$" bc_uri="/sync/addtolibrary/*" status=503 | ' +
						'convert timeformat="%m/%d/%y %I:%M:%S.%3N %p" ctime(_time) as time | ' +
						'table time, mdn, status, artist_name, track_name, device_ip, useragent, bc_uri, track_id';

			query = query.replace( '$sourcetypeToken$', phoneNumber );
			console.log('updateErrorHistoryChart', query)

			var $table = null;


			// A small utility function to populate the table with data
			var updateTable = function( results, isFinalUpdate ) {

				var selector = '#error-history';

				if ( results && results.rows && results.rows.length ) {

					// Create dataTable container
					if ( $table === null ) {
						$table = $( '<table cellpadding="0" cellspacing="0" border="0" class="display"></table>' );
						$( selector ).find( '.chart' ).html( $table );
					}

					// Map column names to required table format
					results.columns = [];
					for ( var i = 0; i < results.fields.length; i++ ) {
						results.columns.push( { sTitle: results.fields[i] } );
					}

					var dt;
					
					
					// Check to see if we've already set up the dataTable
					if ( !$.fn.DataTable.fnIsDataTable( $table.get( 0 ) ) ) {
						// Init dataTable() 
						$table.dataTable( {
							iDisplayLength: 15,
							bLengthChange: false,
							sDom: '<"clearfix"f>r<"dataTables_scrollwrapper"t><"dataTables_controls clearfix"ipl>',
							aaData: results.rows,
							aoColumns: results.columns,
							oLanguage: {
							    sSearch: "Filter Results:"
							}
						} );

					} else {

						// Table has already been instantiated, update data
						dt = $table.dataTable();
						dt.fnAddData( results.rows );
					}

					// Update "refreshed at" timestamp
					var $refreshed = $( selector ).find( '.refreshed-at' ).data( 'refreshed-at', Date.now() );
					updateRefreshText( $refreshed );

				} else if ( isFinalUpdate === true && $table == null ) {

					$( selector ).find( '.chart' ).html( '<div class="no-results">0 results</div>' );
				}
			};


			service.search( 
				query,
				{
					latest_time: latest,
					earliest_time: earliest,
					exec_mode: 'normal'
				},
				{ app: SplunkDemo.appName },
				function( err, job ) {

					// Display the job's search ID
					//console.log( "Job SID: ", job.sid );

					job.enablePreview( function() {

						var offsetIdx = 0;

						// Poll the status of the search job
						job.track( 
							{ period: 1000 },
							{
								ready: function( job ) { },
								progress: function( job ) {
									//console.log( "-- fetching, " + ( job.properties().scanCount || 0 ) + " events scanned so far" );

									job.preview( 
										{ output_mode: 'json_rows', count: 0, offset: offsetIdx },
										function( err, results, job ) {
											if ( err ) console.log( 'Error getting results for Error History: ', err );
											updateTable( results );
											if ( results ) offsetIdx += results.rows.length;
										}
									);
								},
								done: function( job ) {
									//console.log( "-- complete, " + ( job.properties().eventCount || 0 ) + " matching events" );

									//PrintJobProperties( job );

									job.results( 
										{ output_mode: 'json_rows', count: 0, offset: offsetIdx },
										function( err, results, job ) {
											if ( err ) console.log( 'Error getting final results for Error History: ', err );
											if ( results ) updateTable( results, true );
											job.cancel();
										}
									);
								},
								failed: function( job ) { console.log( 'Error History job failed' ); },
								error: function( err ) { console.log( 'Error with Error History job: ', err ); }
							}
						);
					} );  // end enablePreview
				}
			); // end search
		}

		updateCustomerAuthChart();
		updateCustDownloadChart();
		updateErrorHistoryChart();

	} );            // end service.login()
}


// Retrieve any active jobs and cancel them
function cancelRunningJobs() {

	service.login( function( err, success ) {

		// We check for both errors in the connection as well
		// as if the login itself failed.
		if ( err || !success ) {
			console.log( "Error in logging in" );
			done( err || "Login failed" );
			return;
		}

		// Retrieve the collection of jobs
		service.jobs().fetch( function( err, jobs ) {

			// Determine how many jobs are in the collection
			var jobsList = jobs.list() || [];
			console.log( "There are " + jobsList.length + " jobs available to the current user" );

			// Loop through the collection, display each job's SID, and cancel it
			for ( var i = 0; i < jobsList.length; i++ ) {
				console.log( ( i + 1 ) + ": " + jobsList[i].sid );
				jobsList[i].cancel();
			};
		} );

	} ); // end service.login()
}


// Helper function for outputting job info to console
function PrintJobProperties( job ) {

	// Print out the statics
	console.log( "Job statistics:" );
	console.log( "  Job SID: " + job.sid );
	console.log( "  Saved Search Name: " + job.properties().label );
	console.log( "  Event count:  " + job.properties().eventCount );
	console.log( "  Result count: " + job.properties().resultCount );
	console.log( "  Disk usage:   " + job.properties().diskUsage + " bytes" );
	console.log( "  Priority:     " + job.properties().priority );
}

function toggleCustomerInfo() {
	var $customers = $( '#customer-info .customer' );
	var $currentCustomer = $customers.filter( '.current' );

	var nextCustomerIdx = $currentCustomer.index() >= $customers.length - 1 ? 0 : $currentCustomer.index() + 1;

	var $nextCustomer = $customers.eq( nextCustomerIdx );

	$currentCustomer.removeClass( 'current' );
	$nextCustomer.addClass( 'current' );
}


// Let user know the last time we updated chart with data.
// Optionally pass target element/collection or default to all elements with matching class
function updateRefreshText($target) {

	if ( !$target ) $target = $( '.refreshed-at' );

	$target.each( function( i, el ) {
		var $el = $( el );

		if ( $el.data( 'refreshed-at' ) ) {
			// Get # of seconds since last DOM/data update
			var diffInSeconds = Math.floor( ( Date.now() - $el.data( 'refreshed-at' ) ) / 1000 );

			// Set text based on unit of time
			var text = '';

			if ( diffInSeconds < 60 ) {
				text = '<1m ago';
			} else {
				var diffInMinutes = Math.floor( diffInSeconds / 60 );

				if ( diffInMinutes < 60 ) {
					text = diffInMinutes.toString() + 'm ago';
				} else {
					var diffInHours = Math.floor( diffInMinutes / 60 );
					text = '>' + diffInHours.toString() + 'h ago';
				}
			}

			if ( text == '' ) {
				console.log( 'ERROR (updateRefreshText): text empty! ', $el.data( 'refreshed-at' ), ' / (', typeof $el.data( 'refreshed-at' ), ')' );
			}

			$el.text( text );
		}
	} );
}



// doc ready
$( function() {

	var refreshInt;

	// "SEARCH" button click handler
	$( '#customer-care-search-btn' ).click( function(e) {

		// Display loading animations
		$( '.splunk-module .chart' ).html( '<span class="loading" />' );

		// Pull search form values and update charts
		var phone = $( '#search-phone-number' ).val();
		var et = $( '#time-period-dropdown .dropdown-toggle' ).data( 'earliest-time' );
		var lt = $( '#time-period-dropdown .dropdown-toggle' ).data( 'latest-time' );
		updateCustomerInfoCharts( phone, et, lt );

		toggleCustomerInfo();

		// Kill any prior refresh loops/values
		if ( refreshInt ) clearInterval( refreshInt );
		$( '.refreshed-at' ).text( '' ).data( 'refreshed-at', '' );

		// Kick off new loop for "XX ago" text
		refreshInt = setInterval( function() { updateRefreshText(); }, 2000 );

	} );


	// Handle search form time range dropdown
	$( '#time-period-dropdown ul a' ).click( function( e ) {
		e.preventDefault();

		var $this = $( this );
		var text = $this.text();
		var $target = $this.closest( '.dropdown' ).children( 'a.dropdown-toggle' );
		var $caret = $target.children();

		$target.text( text + " " )
			.append( $caret )
			.data( {
				'earliest-time': $this.data( 'earliest-time' ),
				'latest-time': $this.data( 'latest-time' )
			} );
	} );

	// Disable all dummy links
	$( 'a[href=#]' ).click( function( e ) { e.preventDefault(); } );
} );

