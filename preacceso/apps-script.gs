/**
 * Gimadd Mentor — Pre-acceso → Google Sheets + Klaviyo
 *
 * ============================================
 * SETUP (hazlo una vez)
 * ============================================
 * 1. En el Sheet: Extensiones → Apps Script
 * 2. Sustituye TODO el código por este archivo → Guardar
 * 3. Ejecuta setupSheet() una vez (si la hoja ya existe, puedes saltarlo)
 * 4. Crea una API key privada en Klaviyo (ver instrucciones abajo)
 * 5. Ejecuta setKlaviyoApiKey() e introduce la key cuando te lo pida
 *    (o: Configuración del proyecto → Propiedades del script →
 *     Añadir: KLAVIYO_PRIVATE_KEY = pk_xxxxx)
 * 6. Implementar → Nueva implementación → Aplicación web
 *    (IMPORTANTE: tras cambiar el código, crea una NUEVA implementación
 *     o "Administrar implementaciones" → Editar → Nueva versión)
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquiera
 * 7. Si la URL cambió, actualízala en preacceso/index.html → CONFIG.SHEETS_WEBAPP_URL
 *
 * Klaviyo API key:
 * - Klaviyo → Ajustes → Claves de API → Crear clave privada
 * - Nombre: Gimadd Preacceso Sheet
 * - Permisos: Profiles → Read/Write (o Full Access)
 * - Copia la key (solo se muestra una vez)
 *
 * Qué hace al recibir un formulario:
 * - Guarda la fila en el Sheet
 * - En Klaviyo pone preaccess_submitted = "si" (+ score y datos útiles)
 */

var SHEET_NAME = 'Respuestas';
var KLAVIYO_REVISION = '2024-10-15';

var HEADERS = [
  'timestamp',
  'score',
  'nombre',
  'email',
  'ciudad_pais',
  'alumnos_activos',
  'situacion',
  'whatsapp',
  'p1',
  'p2',
  'p3',
  'p4',
  'p4_other',
  'p5',
  'p6',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'user_agent',
  'klaviyo_ok'
];

function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  } else {
    // Asegura columna klaviyo_ok si la hoja ya existía
    var headers = sheet.getRange(1, 1, 1, Math.max(lastCol, HEADERS.length)).getValues()[0];
    if (headers.indexOf('klaviyo_ok') === -1) {
      sheet.getRange(1, headers.length + 1).setValue('klaviyo_ok');
    }
  }
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
}

/**
 * Ejecuta esta función UNA vez desde el editor de Apps Script
 * (selector de función → setKlaviyoApiKey → Ejecutar)
 * Te pedirá pegar la API key privada de Klaviyo.
 */
function setKlaviyoApiKey() {
  var ui = SpreadsheetApp.getUi();
  var result = ui.prompt(
    'API key de Klaviyo',
    'Pega tu clave privada (empieza por pk_):',
    ui.ButtonSet.OK_CANCEL
  );
  if (result.getSelectedButton() !== ui.Button.OK) return;
  var key = (result.getResponseText() || '').trim();
  if (!key || key.indexOf('pk_') !== 0) {
    ui.alert('La key no parece válida. Debe empezar por pk_');
    return;
  }
  PropertiesService.getScriptProperties().setProperty('KLAVIYO_PRIVATE_KEY', key);
  ui.alert('Guardada. Ya puedes probar el formulario.');
}

function getKlaviyoApiKey_() {
  return PropertiesService.getScriptProperties().getProperty('KLAVIYO_PRIVATE_KEY') || '';
}

function firstNameFromFull_(nombre) {
  if (!nombre) return '';
  var parts = String(nombre).trim().split(/\s+/);
  return parts[0] || '';
}

/**
 * Crea o actualiza el perfil en Klaviyo y marca preaccess_submitted = si
 */
function syncToKlaviyo_(data) {
  var apiKey = getKlaviyoApiKey_();
  if (!apiKey) {
    return { ok: false, error: 'Falta KLAVIYO_PRIVATE_KEY. Ejecuta setKlaviyoApiKey()' };
  }

  var email = (data.email || '').toString().trim().toLowerCase();
  if (!email || email.indexOf('@') === -1) {
    return { ok: false, error: 'Email inválido' };
  }

  var properties = {
    preaccess_submitted: 'si',
    preaccess_score: data.score || '',
    preaccess_p1: data.p1 || '',
    preaccess_p2: data.p2 || '',
    preaccess_p3: data.p3 || '',
    preaccess_p4: data.p4 || '',
    preaccess_p5: data.p5 || '',
    preaccess_situacion: data.situacion || '',
    preaccess_alumnos: data.alumnos_activos || '',
    preaccess_ciudad: data.ciudad_pais || '',
    preaccess_utm_source: data.utm_source || '',
    preaccess_utm_medium: data.utm_medium || '',
    preaccess_utm_campaign: data.utm_campaign || '',
    preaccess_submitted_at: data.timestamp || new Date().toISOString()
  };

  var attributes = {
    email: email,
    properties: properties
  };

  var first = firstNameFromFull_(data.nombre);
  if (first) attributes.first_name = first;
  if (data.nombre) {
    var parts = String(data.nombre).trim().split(/\s+/);
    if (parts.length > 1) {
      attributes.last_name = parts.slice(1).join(' ');
    }
  }

  // WhatsApp opcional (solo si parece teléfono internacional)
  var phone = (data.whatsapp || '').toString().replace(/\s+/g, '');
  if (phone && phone.charAt(0) === '+' && phone.length >= 10) {
    attributes.phone_number = phone;
  }

  var payload = {
    data: {
      type: 'profile',
      attributes: attributes
    }
  };

  var response = UrlFetchApp.fetch('https://a.klaviyo.com/api/profile-import/', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Klaviyo-API-Key ' + apiKey,
      Accept: 'application/json',
      revision: KLAVIYO_REVISION
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var code = response.getResponseCode();
  var body = response.getContentText();
  if (code >= 200 && code < 300) {
    return { ok: true, code: code };
  }
  return { ok: false, error: 'HTTP ' + code + ': ' + body };
}

/**
 * Prueba manual: Ejecutar testKlaviyoSync desde el editor
 * (cambia el email de prueba por el tuyo)
 */
function testKlaviyoSync() {
  var result = syncToKlaviyo_({
    email: 'miguelangelsamperp@gmail.com',
    nombre: 'Miguel Angel',
    score: 'warm',
    timestamp: new Date().toISOString(),
    p1: 'test',
    situacion: 'test'
  });
  Logger.log(JSON.stringify(result));
  SpreadsheetApp.getUi().alert(result.ok ? 'OK en Klaviyo' : ('Error: ' + result.error));
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var data = JSON.parse(raw);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    }

    var klaviyo = syncToKlaviyo_(data);
    data.klaviyo_ok = klaviyo.ok ? 'yes' : ('no: ' + (klaviyo.error || ''));

    // Mapear columnas según cabecera actual de la hoja
    var headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (headerRow.indexOf('klaviyo_ok') === -1) {
      sheet.getRange(1, headerRow.length + 1).setValue('klaviyo_ok');
      headerRow.push('klaviyo_ok');
    }

    var row = headerRow.map(function (key) {
      if (key === 'timestamp') {
        return data.timestamp || new Date().toISOString();
      }
      var val = data[key];
      return val === undefined || val === null ? '' : String(val);
    });

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, klaviyo: klaviyo }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  var hasKey = !!getKlaviyoApiKey_();
  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      service: 'Gimadd Mentor Pre-acceso',
      klaviyo_key_configured: hasKey,
      hint: 'Use POST with JSON body'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
