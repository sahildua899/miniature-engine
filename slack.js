function getData (){
    try{
      const googleSheetId = "14taj4CSq7QC4ev79aqxesqz8xyTLRIs01l1R8BCkrqk";
  
      const accounts = Analytics.Management.Accounts.list();
      if(!accounts.items || !accounts.items.length){
        Logger.log('No Accounts Found');
        return;
      }
  
      for(let i=0; i<accounts.items.length; i++) {
        const account = accounts.items[i];
        Logger.log('Account: name "%s", id "%s".', account.name,account.id)
  
        // Transferring Data to find web properties
        listWebProperties(account.id, googleSheetId);
      }
  
    }catch(e){
      Logger.log(e)
    }
  }
  
  function listWebProperties(accountId, googleSheetId) {
    try{
      const webProperties = Analytics.Management.Webproperties.list(accountId);
      if(!webProperties.items || !webProperties.items.length){
        Logger.log('No Web Properties Found');
        return;
      }
      for(let i=0; i<webProperties.items.length; i++) {
        const webProperty = webProperties.items[i];
        Logger.log('\tWeb Property: name "%s", id "%s".',
            webProperty.name, webProperty.id);
          
        var domainName = webProperty.name;
        domainName= domainName.replace("https://","");
        domainName = domainName.replace("https://www.", "");
        domainName = domainName.replace("http://", "");
        domainName = domainName.replace("http://www.", "");
        domainName = domainName.replace(".com", "");
        domainName = domainName.replace("/", "");
  
        var getSpreadsheet = SpreadsheetApp.openById(googleSheetId);
        var sheet = getSpreadsheet.getActiveSheet();
        var dataRange = sheet.getDataRange();
        var getValues = dataRange.getValues();
        var websiteNames = [];
        for(let j=0; j<getValues.length; j++) {
          websiteNames.push(getValues[j].join(","))
        }
        for(let k=0; k<websiteNames.length; k++){
          if(domainName !== websiteNames[k]){
            sheet.getRange(2,1).setValue(domainName)
          }
        }
        checkingData(domainName,accountId, webProperty.id, googleSheetId)
      }
  
    }catch(e) {
      Logger.log(e)
    }
  }
  
  function checkingData(domainName, accountId, webPropertyId, googleSheetId){
    var getSpreadsheet = SpreadsheetApp.openById(googleSheetId);
    var sheet = getSpreadsheet.getActiveSheet();
    var dataRange = sheet.getDataRange();
    var getValues = dataRange.getValues();
    var websiteName = []
      for (i=0; i<getValues.length; i++){
        websiteName.push(getValues[i][0])
      }
      for(let l=0; l<websiteName.length; l++){
        if(websiteName[l] === domainName){
          var websiteLocation = l+1;
          listProfiles(accountId, webPropertyId, websiteLocation, domainName, googleSheetId)
        }
      }
  }
  
  function listProfiles(accountId, webPropertyId, websiteLocation, domainName, googleSheetId) {
    try{
      const profiles = Analytics.Management.Profiles.list(accountId, webPropertyId);
      if(!profiles.items || !profiles.items.length) {
        Logger.log('\t\tNo web properties found.');
        return;
      }
      for(let i=0; i<profiles.items.length; i++){
        const profile = profiles.items[i]
        Logger.log('\t\tProfile: name "%s", id "%s".', profile.name,
            profile.id);
  
        var results = Analytics.Data.Realtime.get(
          'ga:' + profile.id,
          'rt:activeUsers'
        );
        var headers = [];
        var j=0;
        for(let j=0; j<results.columnHeaders.length; j++){
          headers.push(results.columnHeaders[j].name);
        }
        Logger.log(headers.join(','));
        var k =0;
        for(k=0; k<1; k++){
          var rowData = [];
          var row = results.rows[k];
          rowData.push(row.join(','));
          var today = new Date();
          var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
          var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
          var dateTime = date+' '+time;
          var getSpreadsheet = SpreadsheetApp.openById(googleSheetId);
          var sheet = getSpreadsheet.getActiveSheet();
          sheet.getRange(websiteLocation, 2).setValue([rowData.join(',')]);
          sheet.getRange(websiteLocation, 3).setValue([dateTime]);
          Logger.log(rowData)
        }
      }
    }catch(e) {
      Logger.log(e)
    }
  }