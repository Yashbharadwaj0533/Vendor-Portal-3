const SB_URL = "https://dfphwmxczthwitzizczy.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmcGh3bXhjenRod2l0eml6Y3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMDY1NTUsImV4cCI6MjA5MDY4MjU1NX0.cvU0kh_Y83ANGuBUrvCXVzycF-8YrM52tcSSJwFBYlo"
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // 1. Create the Folder
    const parentFolder = DriveApp.getFolderById("1sCTiqNKBvwYZEMJYNvnrXRKtJKCgGdxE");
    const newFolder = parentFolder.createFolder(data.companyName);
    
    // ✅ FIX: Make the folder accessible to anyone with the link
    newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // 2. Save Files
    if (data.files && data.files.length > 0) {
      data.files.forEach(file => {
        // Remove Base64 header if present (e.g., "data:image/png;base64,")
        const base64Data = file.base64.includes(',') ? file.base64.split(',')[1] : file.base64;
        const decoded = Utilities.base64Decode(base64Data);
        const blob = Utilities.newBlob(decoded, file.type, file.name);
        newFolder.createFile(blob);
      });
    }

    const folderUrl = newFolder.getUrl();

    // 3. Prepare Supabase Payload
    const payload = {
      company_name: data.companyName,
      constitution_type: data.constitutionType,
      doi: data.doi,
      pan_number: data.pan,
      gstin: data.gstin,
      msme_number: data.msmeNumber,
      auth_person: data.authPerson,
      mobile: data.mobile,
      email: data.email,
      bank_name: data.bankName,
      account_number: data.accountNum,
      ifsc_code: data.ifsc,
      turnover_last: data.turnoverLast,
      turnover_prev: data.turnoverPrev,
      profit_last: data.profitLast,
      profit_prev: data.profitPrev,
      litigation: data.litigation,
      blacklisted: data.blacklisted,
      category: data.category,
      drive_link: folderUrl,
      status: "Pending" // Added default status
    };

    // 4. Send to Supabase
    const options = {
      method: "post",
      contentType: "application/json",
      headers: { 
        "apikey": SB_KEY, 
        "Authorization": "Bearer " + SB_KEY,
        "Prefer": "return=minimal" 
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true // Helps in debugging if Supabase rejects the request
    };
    
    const response = UrlFetchApp.fetch(SB_URL + "/rest/v1/vendors", options);
    
    if (response.getResponseCode() >= 400) {
       throw new Error("Supabase Error: " + response.getContentText());
    }

    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    console.error(err.toString());
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
