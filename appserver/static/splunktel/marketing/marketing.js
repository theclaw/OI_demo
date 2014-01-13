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
* TOP ARTIST SEARCHES
***************************************************/
var updateTopArtistSearches = function() {	

	// Get all saved searches for Operational Intelligence app
	var mySavedSearches = service.savedSearches( { app: SplunkDemo.appName } );
	
	mySavedSearches.fetch( function( err, mySavedSearches ) {

		// Retrieve the saved search by name
		var searchName = 'Telco - Top Searches Splunktel';
		mySavedSearch = mySavedSearches.item( searchName );
		console.log(mySavedSearch.name, mySavedSearch.properties().search);

		var handleJobTopArtistSearches = function( err, job ) {
    			if (err) console.log("Error in handleJobTopArtistSearches", err);

				// A small utility function to populate the chart with data
				var updateChart = function( results, isFinalUpdate ) {

					var selector = '#top-artist-searches';

					if ( results.columns && results.columns.length ) {

						splunkjs.UI.ready( chartToken, function() {

							// Once we have the charting token, create a chart and update it.
							var chart = new splunkjs.UI.Charting.Chart( 
								$( selector ).find( '.chart' ),
								splunkjs.UI.Charting.ChartType.BAR,
								false
							);

							chart.setData( results, {
								'chart.nullValueMode': 'gaps',
								'data.fieldHideList': 'percent',
								'axisTitleX.text': 'Search Terms',
								'axisTitleY.text': '# Of Searches',
								'legend.placement': 'none'
							} );

							chart.draw();
						} );

					} else if ( isFinalUpdate ) {
						$( selector ).find( '.chart' ).html( '<div class="no-results">0 results</div>' );
						job.cancel();
					}
				}

				// Poll the status of the search job
				job.track( 
					{ period: 1000 },
					{
						ready: function( job ) { },
						progress: function( job ) {
							//console.log( "-- fetching, " + ( job.properties().scanCount || 0 ) + " events scanned so far" );

							job.preview( 
								{ count: 0, output_mode: 'json_cols' },
								function( err, results, job ) {
									if ( err ) console.log( 'Error getting results for ' + searchName + ': ', err );
									if ( results ) updateChart( results );
								}
							);
						},
						done: function( job ) {
							//console.log( "-- complete, " + ( job.properties().eventCount || 0 ) + " matching events" );

							job.results( 
								{ count: 0, output_mode: 'json_cols' },
								function( err, results, job ) {
									if ( err ) console.log( 'Error getting final results for ' + searchName + ': ', err );
									if ( results ) updateChart( results, true );
								}
							);
						},
						failed: function( job ) { console.log( searchName + ' job failed' ); },
						error: function( err ) { console.log( 'Error with ' + searchName + ' job: ', err ); }
					}
				);

			}

        mySavedSearch.history(function(err, jobs) {
        	if (jobs.length > 0) {
        		handleJobTopArtistSearches(null, jobs[0]);
        	} else {
				mySavedSearch.dispatch( null, handleJobTopArtistSearches);
			}
		});



	} ); // end fetch
}


/***************************************************
* TOP ARTIST DOWNLOADS
***************************************************/
var updateTopArtistDownloads = function() {

	// Get all saved searches for Operational Intelligence app
	var mySavedSearches = service.savedSearches( { app: SplunkDemo.appName } );

	mySavedSearches.fetch( function( err, mySavedSearches ) {

		// Retrieve the saved search by name
		var mySavedSearch = mySavedSearches.item( 'Telco - Top Artist Downloads Splunktel' );

		console.log(mySavedSearch.name, mySavedSearch.properties().search);

		var handleJobTopArtistDownloads = function( err, job ) {
			    if (err) console.log("Error in handleJobTopArtistDownloads", err);

				// A small utility function to populate the chart with data
				var updateChart = function( results, isFinalUpdate ) {

					var selector = '#top-artist-downloads';
					
					if ( results.columns && results.columns.length ) {

						splunkjs.UI.ready( chartToken, function() {

							// Once we have the charting token, create a chart and update it.
							var chart = new splunkjs.UI.Charting.Chart( 
								$( selector ).find( '.chart' ),
								splunkjs.UI.Charting.ChartType.COLUMN,
								false
							);

							chart.setData( results, {
								'chart.stackMode': 'stacked100',
								'axisTitleX.text': 'Time',
								'axisTitleY.text': 'Downloads'
							} );

							chart.draw();
						} );

					} else if ( isFinalUpdate ) {
						$( selector ).find( '.chart' ).html( '<div class="no-results">0 results</div>' );
						job.cancel();
					}
				}

				// Poll the status of the search job
				job.track( 
					{ period: 1000 },
					{
						ready: function( job ) { },
						progress: function( job ) {
							//console.log( "-- fetching, " + ( job.properties().scanCount || 0 ) + " events scanned so far" );

							job.preview( 
								{ count: 0, output_mode: 'json_cols' },
								function( err, results, job ) {
									if ( err ) console.log( 'Error getting results for ' + searchName + ': ', err );
									if ( results ) updateChart( results );
								}
							);
						},
						done: function( job ) {
							//console.log( "-- complete, " + ( job.properties().eventCount || 0 ) + " matching events" );

							job.results( 
								{ count: 0, output_mode: 'json_cols' },
								function( err, results, job ) {
									if ( err ) console.log( 'Error getting final results for ' + searchName + ': ', err );
									if ( results ) updateChart( results, true );
								}
							);
						},
						failed: function( job ) { console.log( searchName + ' job failed' ); },
						error: function( err ) { console.log( 'Error with ' + searchName + ' job: ', err ); }
					}
				);
			}

			mySavedSearch.history(function(err, jobs) {
        	if (jobs.length > 0) {
        		handleJobTopArtistDownloads(null, jobs[0]);
        	} else {
				mySavedSearch.dispatch( null, handleJobTopArtistDownloads);
			}
		});
	});

};



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

		updateTopArtistSearches();	
		updateTopArtistDownloads();	
	} );
} );

