


function listAccounts() {
  try {
    const accounts = Analytics.Management.Accounts.list();
    if (!accounts.items || !accounts.items.length) {
      Logger.log('No accounts found.');
      return;
    }

    for (let i = 0; i < accounts.items.length; i++) {
      const account = accounts.items[i];
      Logger.log('Account: name "%s", id "%s".', account.name, account.id);


      // List web properties in the account.
      listWebProperties(account.id);
    }
  } catch (e) {
    // TODO (Developer) - Handle exception
    Logger.log('Failed with error: %s', e.error);
  }
}

/**
 * Lists web properites for an Analytics account.
 * @param  {string} accountId The account ID.
 */
function listWebProperties(accountId) {
  try {
    const webProperties = Analytics.Management.Webproperties.list(accountId);
    if (!webProperties.items || !webProperties.items.length) {
      Logger.log('\tNo web properties found.');
      return;
    }
    for (let i = 0; i < webProperties.items.length; i++) {
      const webProperty = webProperties.items[i];
      Logger.log('\tWeb Property: name "%s", id "%s".',
          webProperty.name, webProperty.id);

      // List profiles in the web property.
      // listProfiles(accountId, webProperty.id);
      checkingData(webProperty.name, accountId, webProperty.id)
    }
  } catch (e) {
    // TODO (Developer) - Handle exception
    Logger.log('Failed with error: %s', e.error);
  }
}

function checkingData(siteName,accountId, webPropertyId){
    var getSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getSpreadsheet.getActiveSheet();
    var dataRange = sheet.getDataRange();
    var getValues = dataRange.getValues();
     var websiteName = []
    for (i=0; i<getValues.length; i++){
      websiteName.push(getValues[i][0])
    }
    for(l=0; l<websiteName.length;l++){
      if(websiteName[l] === siteName) {
        var websiteLocation = l+1;
        Logger.log(websiteLocation);
        listProfiles(accountId, webPropertyId, websiteLocation)
      }
    }
  }

function listProfiles(accountId, webPropertyId, websiteLocation ) {
  // Note: If you experience "Quota Error: User Rate Limit Exceeded" errors
  // due to the number of accounts or profiles you have, you may be able to
  // avoid it by adding a Utilities.sleep(1000) statement here.
  try {
    const profiles = Analytics.Management.Profiles.list(accountId,
        webPropertyId);

    if (!profiles.items || !profiles.items.length) {
      Logger.log('\t\tNo web properties found.');
      return;
    }
    for (let i = 0; i < profiles.items.length; i++) {
      const profile = profiles.items[i];
      Logger.log('\t\tProfile: name "%s", id "%s".', profile.name,
          profile.id);
      
        var results = Analytics.Data.Realtime.get(
          'ga:' + profile.id,
          'rt:activeUsers'
        );
        var headers = [];
        var j=0;
        for (j = 0; j < results.columnHeaders.length; j++) {
          headers.push(results.columnHeaders[j].name);
        }
        Logger.log(headers.join(','));

        var k = 0;
        for (k = 0; k < 1; k++) {
          var rowData = [];
          var row = results.rows[k];
          rowData.push(row.join(','));
          Logger.log(rowData)
          var today = new Date();
          var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
          var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
          var dateTime = date+' '+time;
          var getSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
          var sheet = getSpreadsheet.getActiveSheet();
         sheet.getRange(websiteLocation,2).setValue([rowData.join(',')]);
         sheet.getRange(websiteLocation , 3).setValue([dateTime]);
        }
    }
  } catch (e) {
    // TODO (Developer) - Handle exception
    Logger.log('Failed with error: %s', e.error);
  }
}


