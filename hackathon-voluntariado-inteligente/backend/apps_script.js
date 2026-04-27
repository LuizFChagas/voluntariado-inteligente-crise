function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    if (action === "cadastrarVoluntario") {
      return cadastrarVoluntario(data);
    } else if (action === "salvarTreinamento") {
      return salvarTreinamento(data);
    } else if (action === "registrarCrise") {
      return registrarCrise(data);
    } else if (action === "salvarChecklist") {
      return salvarChecklist(data);
    } else if (action === "enviarEmail") {
      return enviarEmail(data);
    } else {
      return cadastrarVoluntario(data);
    }
  } catch(error) {
    return ContentService
      .createTextOutput(JSON.stringify({status: "error", message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function cadastrarVoluntario(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Voluntários") || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow([
    data.nome,
    data.email,
    data.habilidade,
    data.disponibilidade,
    data.cidade,
    new Date().toLocaleString('pt-BR')
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({status: "success", message: "Voluntário cadastrado com sucesso!"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function salvarTreinamento(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Treinamentos");
  var rows = sheet.getDataRange().getValues();
  var found = false;

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][1] === data.email) {
      sheet.getRange(i + 1, 1, 1, 8).setValues([[
        data.nome,
        data.email,
        data.area,
        data.nivel,
        data.trilha_concluida,
        data.pontuacao_quiz,
        data.certificado_emitido,
        new Date().toLocaleString('pt-BR')
      ]]);
      found = true;
      break;
    }
  }

  if (!found) {
    sheet.appendRow([
      data.nome,
      data.email,
      data.area,
      data.nivel,
      data.trilha_concluida,
      data.pontuacao_quiz,
      data.certificado_emitido,
      new Date().toLocaleString('pt-BR')
    ]);
  }

  return ContentService
    .createTextOutput(JSON.stringify({status: "success", message: "Treinamento salvo com sucesso!"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function registrarCrise(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Ocorrências");
  var id = "OC-" + new Date().getTime();

  sheet.appendRow([
    id,
    data.tipo_crise,
    data.regiao,
    data.nivel_urgencia,
    data.descricao,
    data.voluntarios_alertados,
    data.status || "Aberta",
    new Date().toLocaleString('pt-BR')
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      message: "Crise registrada com sucesso!",
      id: id
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function salvarChecklist(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Checklists");
  var rows = sheet.getDataRange().getValues();
  var found = false;

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.instituicao && rows[i][2] === data.tipo_crise) {
      sheet.getRange(i + 1, 1, 1, 7).setValues([[
        data.instituicao,
        data.cidade,
        data.tipo_crise,
        data.itens_concluidos,
        data.itens_pendentes,
        data.top3_acoes,
        new Date().toLocaleString('pt-BR')
      ]]);
      found = true;
      break;
    }
  }

  if (!found) {
    sheet.appendRow([
      data.instituicao,
      data.cidade,
      data.tipo_crise,
      data.itens_concluidos,
      data.itens_pendentes,
      data.top3_acoes,
      new Date().toLocaleString('pt-BR')
    ]);
  }

  return ContentService
    .createTextOutput(JSON.stringify({status: "success", message: "Checklist salvo com sucesso!"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function enviarEmail(data) {
  if (!data.to || !data.subject || !data.body) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "Campos obrigatórios ausentes: to, subject, body"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  MailApp.sendEmail({
    to: data.to,
    subject: data.subject,
    body: data.body
  });

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      message: "Email enviado com sucesso!",
      to: data.to
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    var action = e.parameter.action;

    if (action === "buscarVoluntariosPorRegiao") {
      return buscarVoluntariosPorRegiao(e);
    } else if (action === "buscarTreinamento") {
      return buscarTreinamento(e);
    } else if (action === "buscarChecklist") {
      return buscarChecklist(e);
    } else {
      return buscarVoluntariosPorRegiao(e);
    }
  } catch(error) {
    return ContentService
      .createTextOutput(JSON.stringify({status: "error", message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function buscarVoluntariosPorRegiao(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Voluntários") || SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var regiao = e.parameter.regiao ? e.parameter.regiao.toLowerCase() : null;

  var volunteers = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var cidade = row[4] ? row[4].toString().toLowerCase() : "";

    if (!regiao || cidade.includes(regiao)) {
      volunteers.push({
        nome: row[0],
        email: row[1],
        habilidade: row[2],
        disponibilidade: row[3],
        cidade: row[4],
        cadastro: row[5]
      });
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      volunteers: volunteers
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function buscarTreinamento(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Treinamentos");
  var data = sheet.getDataRange().getValues();
  var email = e.parameter.email ? e.parameter.email.toLowerCase() : null;

  for (var i = 1; i < data.length; i++) {
    var row = data[i];

    if (row[1] && row[1].toString().toLowerCase() === email) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: "success",
          found: true,
          treinamento: {
            nome: row[0],
            email: row[1],
            area: row[2],
            nivel: row[3],
            trilha_concluida: row[4],
            pontuacao_quiz: row[5],
            certificado_emitido: row[6],
            atualizado: row[7]
          }
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      found: false,
      message: "Treinamento não encontrado"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function buscarChecklist(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Checklists");
  var data = sheet.getDataRange().getValues();
  var instituicao = e.parameter.instituicao ? e.parameter.instituicao.toLowerCase() : null;

  var resultados = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];

    if (row[0] && row[0].toString().toLowerCase().includes(instituicao)) {
      resultados.push({
        instituicao: row[0],
        cidade: row[1],
        tipo_crise: row[2],
        itens_concluidos: row[3],
        itens_pendentes: row[4],
        top3_acoes: row[5],
        data: row[6]
      });
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      found: resultados.length > 0,
      checklists: resultados
    }))
    .setMimeType(ContentService.MimeType.JSON);
}