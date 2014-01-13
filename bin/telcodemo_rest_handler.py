import splunk.admin as admin
import splunk.entity as en
import os, logging, tarfile

## Setup the logger
def setup_logger():
    """
    Setup a logger for the REST handler.
    """

    logger = logging.getLogger('telcodemo_rest_handler')
    logger.propagate = False # Prevent the log messages from being duplicated in the python.log file
    logger.setLevel(logging.DEBUG)

    file_handler = logging.handlers.RotatingFileHandler(os.environ['SPLUNK_HOME'] + '/var/log/splunk/eventgen_rest_handler.log', maxBytes=25000000, backupCount=5)
    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    file_handler.setFormatter(formatter)

    logger.addHandler(file_handler)

    return logger
    
logger = setup_logger()

## Replaces $SPLUNK_HOME w/ correct pathing
def pathParser(path):
    grandparent = os.path.dirname(os.path.dirname(os.path.dirname(__file__))) 
    greatgreatgrandparent = os.path.dirname(os.path.dirname(grandparent)) 
    sharedStorage = ['$SPLUNK_HOME/etc/apps', '$SPLUNK_HOME/etc/users/', '$SPLUNK_HOME/var/run/splunk']

    ## Replace windows os.sep w/ nix os.sep
    path = path.replace('\\', '/')
    ## Normalize path to os.sep
    path = os.path.normpath(path)                                
    
    ## Iterate special paths
    for x in range(0, len(sharedStorage)):
        sharedPath = os.path.normpath(sharedStorage[x])
        
        if path.startswith(sharedPath):
            path.replace('$SPLUNK_HOME', greatgreatgrandparent)
            break
     
    ## Split path
    path = path.split(os.sep)
    
    ## Iterate path segments
    for x in range(0, len(path)):
        segment = path[x].lstrip('$')
        ## If segement is an environment variable then replace
        if os.environ.has_key(segment):
            path[x] = os.environ[segment]

    ## Join path     
    path = os.sep.join(path)
    
    return path

class TelcoDemoConfigApp(admin.MConfigHandler):
    '''
    Set up supported arguments
    '''
    def setup(self):
         if self.requestedAction == admin.ACTION_EDIT:
             for arg in ['installeventgen']:
                 self.supportedArgs.addOptArg(arg)
                
    '''
    Read the initial values of the parameters from the custom file
            myappsetup.conf, and write them to the setup screen. 

    If the app has never been set up,
            uses .../<appname>/default/myappsetup.conf. 

    If app has been set up, looks at 
            .../local/myappsetup.conf first, then looks at 
    .../default/myappsetup.conf only if there is no value for a field in
            .../local/myappsetup.conf

    For boolean fields, may need to switch the true/false setting.

    For text fields, if the conf file says None, set to the empty string.
    '''

    # def handleList(self, confInfo):
    #     confDict = self.readConf("myappsetup")
    #     if None != confDict:
    #         for stanza, settings in confDict.items():
    #             for key, val in settings.items():
    #                 if key in ['field_2_boolean']:
    #                     if int(val) == 1:
    #                         val = '0'
    #                     else:
    #                         val = '1'
    #                 if key in ['field_1'] and val in [None, '']:
    #                     val = ''
    #                 confInfo[stanza].append(key, val)
    
    def handleList(self, confInfo):
        confDict = self.readConf("telcodemo")
        if None != confDict:
            for stanza, settings in confDict.items():
                for key, val in settings.items():
                    if key in ['installeventgen']:
                        if int(val) == 1:
                            val = '1'
                        else:
                            val = '0'
                    confInfo[stanza].append(key, val)
        logger.debug('Handling config list.  Returning %s' % confInfo)
                    
    '''
    After user clicks Save on setup screen, take updated parameters,
    normalize them, and save them somewhere
    '''
    def handleEdit(self, confInfo):
        name = self.callerArgs.id
        args = self.callerArgs
        
        logger.debug('Handling config edit.')
        if int(self.callerArgs.data['installeventgen'][0]) == 1:
            logger.debug('Installing SA-Eventgen')
            filename = pathParser('$SPLUNK_HOME/etc/apps/telcodemo/SA-Eventgen.spl')
    
            tfile = tarfile.open(filename)
            if tarfile.is_tarfile(filename):
                tfile = tarfile.open(filename)
                tfile.extractall(pathParser('$SPLUNK_HOME/etc/apps'))
        
            logger.debug('SA-Eventgen extracted')
            
# initialize the handler
admin.init(TelcoDemoConfigApp, admin.CONTEXT_NONE)