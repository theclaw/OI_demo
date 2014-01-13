#!/usr/bin/env sh
# This should be run from the $SPLUNK_HOME/etc/apps/oidemo directory.

# Save for later
CURRENT_PWD=`pwd`

# Cleanup
rm $CURRENT_PWD/oidemo.spl

# Create a build directory that we can use
BUILD_DIR=.build/oidemo
BUILD_DIR_PARENT=.build
mkdir -p $BUILD_DIR

# Copy all of the eventgen into the Build directory first.  This makes sure oidemo will overwrite any duplicates from eventgen
mkdir -p $BUILD_DIR/bin/
cp ../eventgen/bin/eventgen.py $BUILD_DIR/bin/
mkdir -p $BUILD_DIR/lib/
cp -R ../eventgen/lib/* $BUILD_DIR/lib/
cp -R * $BUILD_DIR
cat $BUILD_DIR/default/embed_eventgen.conf >> $BUILD_DIR/default/inputs.conf
rm $BUILD_DIR/default/embed_eventgen.conf
cat $BUILD_DIR/local/eventgen.conf >> $BUILD_DIR/default/eventgen.conf
rm $BUILD_DIR/local/eventgen.conf
cd $BUILD_DIR_PARENT
tar cfz $CURRENT_PWD/oidemo.spl oidemo --exclude "oidemo/oidemo.spl" --exclude "oidemo/bin/output/*" --exclude "oidemo/.*" --exclude "oidemo/lookups/customer_master*"
cd $CURRENT_PWD
rm -rf $BUILD_DIR

echo "Build Complete"
