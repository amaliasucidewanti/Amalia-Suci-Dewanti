
/**
 * SI-KERTAS (Sistem Kerja Tuntas) - Backend Logic
 * Platform: Google Apps Script
 * Author: Systems Analyst & Gov Dev
 */

const SPREADSHEET_ID = '1iB7Tdda08wD1u5IwiKUEjkfI2JFzw4wjTI_bGRhivVc';

function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Si-Kertas - BPMP Maluku Utara')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Mendapatkan data dari seluruh tab Spreadsheet
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
    Logger.log("Error getSpreadsheetData: " + e.toString());
    throw new Error("Sistem gagal menghubungi basis data: " + e.message);
  }
}

/**
 * Menyimpan data Surat Tugas Baru
 */
function saveAssignmentRecord(assignment) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('SURAT_TUGAS');
    const lock = LockService.getScriptLock();
    
    // Tunggu akses sheet selama 30 detik jika sedang sibuk
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
        new Date() // Timestamp Server
      ]);
    });
    
    lock.releaseLock();
    return { success: true };
  } catch (e) {
    throw new Error("Gagal menyimpan Surat Tugas: " + e.message);
  }
}

/**
 * Menyimpan Laporan Tugas & Menyesuaikan Skor Disiplin
 */
function saveReportRecord(reportData) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetLaporan = ss.getSheetByName('LAPORAN_TUGAS');
    const sheetDisiplin = ss.getSheetByName('DISIPLIN_PEGAWAI');
    const lock = LockService.getScriptLock();
    
    lock.waitLock(30000);

    // 1. Bersihkan laporan lama jika ada
    const dataLaporan = sheetLaporan.getDataRange().getValues();
    for (let i = dataLaporan.length - 1; i >= 1; i--) {
      if (dataLaporan[i][0] == reportData.letterNumber && dataLaporan[i][3] == reportData.nip) {
        sheetLaporan.deleteRow(i + 1);
      }
    }

    // 2. Simpan Laporan Baru
    const photoCount = reportData.documentationPhotos ? reportData.documentationPhotos.length : 0;
    sheetLaporan.appendRow([
      reportData.letterNumber,
      reportData.summary, 
      reportData.reportDate,
      reportData.nip,
      `Lampiran: ${photoCount} Foto`
    ]);
    
    // 3. Update Poin Disiplin Pelaporan (+20 poin per laporan terbit)
    const dataDisiplin = sheetDisiplin.getDataRange().getValues();
    let found = false;
    for (let i = 1; i < dataDisiplin.length; i++) {
      if (dataDisiplin[i][0] == reportData.nip) {
        const scorePelaporan = parseFloat(dataDisiplin[i][4]) || 0;
        sheetDisiplin.getRange(i + 1, 5).setValue(Math.min(100, scorePelaporan + 20));
        found = true;
        break;
      }
    }
    
    // Jika data disiplin belum ada, buat baru
    if (!found) {
      sheetDisiplin.appendRow([reportData.nip, 100, 100, 100, 20]);
    }

    lock.releaseLock();
    return { success: true };
  } catch (e) {
    throw new Error("Gagal menyimpan laporan: " + e.message);
  }
}

/**
 * Menghapus Laporan Tugas
 */
function deleteReportRecord(letterNumber, nip) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('LAPORAN_TUGAS');
    const sheetDisiplin = ss.getSheetByName('DISIPLIN_PEGAWAI');
    const data = sheet.getDataRange().getValues();
    
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);

    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][0] == letterNumber && data[i][3] == nip) {
        sheet.deleteRow(i + 1);
      }
    }

    // Kurangi skor jika laporan dihapus
    const dataDisiplin = sheetDisiplin.getDataRange().getValues();
    for (let i = 1; i < dataDisiplin.length; i++) {
      if (dataDisiplin[i][0] == nip) {
        const current = parseFloat(dataDisiplin[i][4]) || 0;
        sheetDisiplin.getRange(i + 1, 5).setValue(Math.max(0, current - 20));
        break;
      }
    }

    lock.releaseLock();
    return { success: true };
  } catch (e) {
    throw new Error("Gagal menghapus laporan: " + e.message);
  }
}
