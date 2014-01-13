# Hacked together by Patrick Ogdin, based on Shelston's original.  pogdin@splunk.com
#
# ___ NOTES ___
# Use --debug switch to run in debug mode which will write to stdout and not to file
# Use an integer as a switch to have the script support multiple instances of itself. Make sure to have 
# the monitor:// stanza changed to the _n log name!
#

import time, datetime, os, sys, random

filename1 = "noise_radius.log"
filename2 = "noise_apache.log"
debug = False

# Check for arguments
for arg in sys.argv:
	if (arg == "--debug"):
		debug = True

	if (arg.isdigit()):
		filename1 = str.replace(filename1, ".log", "_" + str(arg) + ".log")
		filename2 = str.replace(filename2, ".log", "_" + str(arg) + ".log")

# Kill file if it exists.
if(debug == False):
	if os.environ["SPLUNK_HOME"].find('\\') == -1:
		the_rad_File = open(os.environ["SPLUNK_HOME"] +  os.path.abspath('/etc/apps/oidemo/bin/output/' + filename1), 'w')
		the_web_File = open(os.environ["SPLUNK_HOME"] +  os.path.abspath('/etc/apps/oidemo/bin/output/' + filename2), 'w')
	else:
		the_rad_File = open(os.environ["SPLUNK_HOME"] +  ('\\etc\\apps\\oidemo\\bin\\output\\' + filename1), 'w')
		the_web_File = open(os.environ["SPLUNK_HOME"] +  ('\\etc\\apps\\oidemo\\bin\\output\\' + filename2), 'w')

# Define lib path
libPath = os.path.join(os.environ["SPLUNK_HOME"], 'etc','apps','oidemo', 'bin', 'data')

# List of IP addresses
internalclientipAddresses = open(os.path.join(libPath, 'internal_ips.txt')).readlines()
externalclientipAddresses = open(os.path.join(libPath, 'external_ips.txt')).readlines()

# List of MDNs
mdns = open(os.path.join(libPath, 'mdn.txt')).readlines()

# List of mobile user agents
useragents = open(os.path.join(libPath, 'user_agents.txt')).readlines()


# Neverending Loop
loop = 1

while loop :
	
	# Append to file
	if os.environ["SPLUNK_HOME"].find('\\') == -1:
		the_rad_File = open(os.environ["SPLUNK_HOME"] +  os.path.abspath('/etc/apps/oidemo/bin/output/' + filename1), 'a')
		the_web_File = open(os.environ["SPLUNK_HOME"] +  os.path.abspath('/etc/apps/oidemo/bin/output/' + filename2), 'a')
	else:
		the_rad_File = open(os.environ["SPLUNK_HOME"] +  ('\\etc\\apps\\oidemo\\bin\\output\\' + filename1), 'a')
		the_web_File = open(os.environ["SPLUNK_HOME"] +  ('\\etc\\apps\\oidemo\\bin\\output\\' + filename2), 'a')
	
	# Define Data
	#############
	
	# Client IP Addresses
	internalclientipAddress = internalclientipAddresses[random.randint(0,len(internalclientipAddresses)-1)].replace("\n","")
	externalclientipAddress = externalclientipAddresses[random.randint(0,len(externalclientipAddresses)-1)].replace("\n","")
	
	# User Agent
	useragent = useragents[random.randint(0,len(useragents)-1)].replace("\n","")
	
	# Radius Hosts
	radHosts = ["aaa1","aaa2","aaa3"]
	radHost = radHosts[random.randint(0, len(radHosts) - 1)]
	
	# Web Hosts
	webHosts = ["10.2.1.33","10.2.1.34","10.2.1.35"]
	webHost = webHosts[random.randint(0, len(webHosts) - 1)]
	
	# Radius PID
	radPIDs = ["2363","12676","12548"]
	radPID = radPIDs[random.randint(0, len(radPIDs) - 1)] 
	
	# MDN
	mdn = mdns[random.randint(0,len(mdns)-1)].replace("\n","")

	# Artist ID
	artIds = ["0019","0018","0014","006","0026","0017","0016","0015","0027","007","0021","0011","0012","0013","0020","005","0044","001","0032","008","0022"]
	artId = artIds[random.randint(0, len(artIds) - 1)]

	# Track ID
	trackIds = ["01011207201000005652000000000021","01011207201000005652000000000047","01011207201000005652000000000068","01011207201000005652000000000018","01011207201000005652000000000031","01011207201000005652000000000007","01011207201000005652000000000013","01011207201000005652000000000041","01011207201000005652000000000053","01011207201000005652000000000023","01011207201000005652000000000029","01011207201000005652000000000037","01011207201000005652000000000011","01011207201000005652000000000003","01011207201000005652000000000083","01011207201000005652000000000017","01011207201000005652000000000071","01011207201000005652000000000026","01011207201000005652000000000055","01011207201000005652000000000084","01011207201000005652000000000014","01011207201000005652000000000025","01011207201000005652000000000049"]
	trackId = trackIds[random.randint(0, len(trackIds) - 1)]
	
	# Search Artists
	sartIds = [
	"Rihanna",
	"Bruno+Mars",
	"LMFAO",
	"Flo+Rida",
	"Katy+Perry",
	"Kanye+West",
	"Adele",
	"David+Guetta",
	"Maroon+5",
	"T-Pain",
	"Gym+Class+Heroes",
	"Big+Sean",
	"J.Cole",
	"Drake",
	"Toby+Keith",
	"Snoop+Dogg",
	"Foster+The+People",
	"Cobra+Starship",
	"Kelly+Clarkson",
	"Gavin+DeGraw",
	"Luke+Bryan"
	]
	sartId = sartIds[random.randint(0, len(sartIds) - 1)]
	
	# Bytes Transferred
	bytesXferred = str(random.randint(200,4000))
	
	# Time Taken
	timeTaken =  str(random.randint(100,1000))
	
	uris = [
	"GET /browse/search/" + sartId,
	"GET /browse/tracks/" + trackId,
	"POST /browse/artist/" + artId,
	"GET /browse/home",
	"POST /sync/createplaylist",
	"GET /sync/addtolibrary/" + trackId,
	"POST /playhistory/uploadhistory",
	"GET /auth/" + mdn,
	"GET /ads/showbanner"
	]
	uri = uris[random.randint(0, len(uris) - 1)]
		
	# Random milliseconds
	randMs1 = random.randint(1, 50) + 100
	randMs2 = random.randint(51, 100) + 100
	
	radstartline = datetime.datetime.utcnow().strftime('%b %d %H:%M:%S') + ":000" + " " + radHost + " " + "radiusd[" + radPID + "]:" + "[ID 959576 local1.info] INFO RADOP(13) acct start for " + mdn + "@splunktel.com " + internalclientipAddress + " from " + externalclientipAddress + " recorded OK." + "\n"
	webline = datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S') + ":" + str(randMs1) + " " + webHost + " " + uri + " - 80 - " + internalclientipAddress + " \"" + useragent + "\" " + "200 0 0 " + timeTaken + " " + bytesXferred + "\n"
	radstopline = datetime.datetime.utcnow().strftime('%b %d %H:%M:%S') + ":" + str(randMs2) + " " + radHost + " " + "radiusd[" + radPID + "]:" + "[ID 959576 local1.info] INFO RADOP(13) acct stop for " + mdn + "@splunktel.com " + internalclientipAddress + " from " + externalclientipAddress + " recorded OK." + "\n"

	if(debug):
		print(radstartline)
		print(radstopline)
		print(webline)
	else:
		the_rad_File.write(radstartline)
		the_rad_File.write(radstopline)
		the_web_File.write(webline)
	
	time.sleep(random.randint(0, 2))
	
	# This ensures proper line breaking for solid tailing 
	the_rad_File.close()
	the_web_File.close()
