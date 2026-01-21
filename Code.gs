
/**
 * SI-KERTAS (Sistem Kerja Tuntas) - Backend Logic
 * Platform: Google Apps Script
 */

const SPREADSHEET_ID = '1iB7Tdda08wD1u5IwiKUEjkfI2JFzw4wjTI_bGRhivVc';
const FOLDER_NAME = 'SI-KERTAS_DOKUMENTASI';

function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Si-Kertas - BPMP Maluku Utara')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Mengambil atau membuat folder untuk penyimpanan foto
 */
function getOrCreateFolder() {
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(FOLDER_NAME);
}

/**
 * Mengambil data mentah dari seluruh sheet
 */
function getSpreadsheetData() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = ['DATA_PEGAWAI', 'SURAT_TUGAS', 'DISIPLIN_PEGAWAI', 'LAPORAN_TUGAS'];
    const result = {};
    
    sheets.forEach(name => {
      const sheet = ss.getSheetByName(name);
      if (sheet) {
        result[name] = sheet.getDataRange().getValues();
      } else {
        result[name] = [];
      }
    });
    
    return result;
  } catch (e) {
    throw new Error("Gagal mengambil data: " + e.message);
  }
}

/**
 * Menyimpan Surat Tugas Baru
 */
function saveAssignmentRecord(assignment) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('SURAT_TUGAS');
  const lock = LockService.getScriptLock();
  
  lock.waitLock(30000);
  assignment.employees.forEach(emp => {
    sheet.appendRow([
      emp.nip,
      assignment.letterNumber,
      assignment.basis,
      assignment.description,
      assignment.location,
      assignment.startDate,
      assignment.endDate,
      assignment.signee,
      new Date()
    ]);
  });
  lock.releaseLock();
  return { success: true };
}

/**
 * Menyimpan Laporan Tugas dan Foto ke Drive
 */
function saveReportRecord(reportData) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetLaporan = ss.getSheetByName('LAPORAN_TUGAS');
    const sheetDisiplin = ss.getSheetByName('DISIPLIN_PEGAWAI');
    const lock = LockService.getScriptLock();
    
    lock.waitLock(30000);

    // 1. Simpan Foto ke Drive (jika ada)
    let photoUrls = [];
    if (reportData.documentationPhotos && reportData.documentationPhotos.length > 0) {
      const folder = getOrCreateFolder();
      reportData.documentationPhotos.forEach((base64, index) => {
        const contentType = base64.split(';')[0].split(':')[1];
        const bytes = Utilities.base64Decode(base64.split(',')[1]);
        const blob = Utilities.newBlob(bytes, contentType, `ST_${reportData.letterNumber.replace(/\//g, '-')}_${reportData.nip}_${index + 1}`);
        const file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        photoUrls.push(file.getUrl());
      });
    }

    // 2. Hapus laporan lama jika ada
    const dataLaporan = sheetLaporan.getDataRange().getValues();
    for (let i = dataLaporan.length - 1; i >= 1; i--) {
      if (dataLaporan[i][0] == reportData.letterNumber && dataLaporan[i][3] == reportData.nip) {
        sheetLaporan.deleteRow(i + 1);
      }
    }

    // 3. Simpan baris laporan baru (Kolom 5 sekarang menyimpan URL foto sebagai JSON string)
    sheetLaporan.appendRow([
      reportData.letterNumber,
      reportData.summary,
      reportData.reportDate,
      reportData.nip,
      JSON.stringify(photoUrls)
    ]);
    
    // 4. Update Skor Disiplin Pelaporan
    const dataDisiplin = sheetDisiplin.getDataRange().getValues();
    for (let i = 1; i < dataDisiplin.length; i++) {
      if (dataDisiplin[i][0] == reportData.nip) {
        const currentScore = parseFloat(dataDisiplin[i][4]) || 0;
        sheetDisiplin.getRange(i + 1, 5).setValue(Math.min(100, currentScore + 20));
        break;
      }
    }

    lock.releaseLock();
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Menghapus Laporan
 */
function deleteReportRecord(letterNumber, nip) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName('LAPORAN_TUGAS');
  const data = sheet.getDataRange().getValues();
  
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] == letterNumber && data[i][3] == nip) {
      sheet.deleteRow(i + 1);
    }
  }
  return { success: true };
}
