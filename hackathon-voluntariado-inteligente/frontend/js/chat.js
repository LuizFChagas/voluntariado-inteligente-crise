// ══════════════════════════════════════════════════════════════
//  IBM watsonx Orchestrate — Chat Integration
// ══════════════════════════════════════════════════════════════

class OrchestrateChat {
  constructor() {
    this.sessionId = null;
    this.iamToken = null;
    this.isConnected = false;
    this.messageHistory = [];
  }

  // ── Obter token IAM do IBM Cloud ──────────────────────────
  async getIAMToken() {
    const resp = await fetch('https://iam.cloud.ibm.com/identity/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${ORCHESTRATE_CONFIG.apiKey}`
    });
    if (!resp.ok) throw new Error('Falha ao autenticar com IBM Cloud');
    const data = await resp.json();
    this.iamToken = data.access_token;
    return this.iamToken;
  }

  // ── Criar sessão com o Manager Agent ─────────────────────
  async createSession() {
    if (!this.iamToken) await this.getIAMToken();
    const url = `${ORCHESTRATE_CONFIG.baseUrl}/v2/assistants/${ORCHESTRATE_CONFIG.assistantId}/sessions?version=${ORCHESTRATE_CONFIG.apiVersion}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.iamToken}`
      }
    });
    if (!resp.ok) throw new Error('Falha ao criar sessão');
    const data = await resp.json();
    this.sessionId = data.session_id;
    this.isConnected = true;
    return this.sessionId;
  }

  // ── Enviar mensagem ao agente ─────────────────────────────
  async sendMessage(text) {
    if (!this.sessionId) await this.createSession();

    const url = `${ORCHESTRATE_CONFIG.baseUrl}/v2/assistants/${ORCHESTRATE_CONFIG.assistantId}/sessions/${this.sessionId}/message?version=${ORCHESTRATE_CONFIG.apiVersion}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.iamToken}`
      },
      body: JSON.stringify({
        input: { message_type: 'text', text }
      })
    });
    if (!resp.ok) throw new Error('Falha ao enviar mensagem');
    const data = await resp.json();

    // Extrair texto das respostas
    const responses = data.output?.generic || [];
    return responses
      .filter(r => r.response_type === 'text')
      .map(r => r.text)
      .join('\n\n');
  }

  // ── Modo Demo: respostas simuladas ────────────────────────
  async sendDemoMessage(text) {
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const lower = text.toLowerCase();

    if (lower.includes('voluntár') || lower.includes('cadastr') || lower.includes('ajud')) {
      return `Que ótimo ter você aqui! 🌟 Para completar seu cadastro, me informe tudo em uma mensagem só:\n\n**1. Seu nome completo**\n**2. Sua cidade e estado**\n**3. Seu email**\n**4. Sua área de atuação** — escolha um número:\n\n| # | Área |\n|---|------|\n| 1 | 🚑 Primeiros Socorros |\n| 2 | 🏗️ Engenharia |\n| 3 | 🧠 Psicologia |\n| 4 | 🚛 Logística |\n| 5 | 📢 Comunicação |\n\n**5. Sua disponibilidade**\n\nResponda tudo de uma vez!`;
    }
    if (lower.includes('crise') || lower.includes('emergência') || lower.includes('desastre') || lower.includes('enchente') || lower.includes('incêndio')) {
      return `🚨 **ALERTA DE CRISE DETECTADO**\n\nClassificando urgência... **🔴 CRÍTICO**\n\n**Ações imediatas:**\n• Ligue imediatamente para **Bombeiros: 193**\n• SAMU: **192** para vítimas\n• Defesa Civil: **199** para coordenação\n\n**Não se aproxime do local sem orientação.** Estou acionando voluntários da sua região agora.\n\nQual é a sua localização exata?`;
    }
    if (lower.includes('treinament') || lower.includes('capacit') || lower.includes('aprend')) {
      return `🎓 Vamos montar sua trilha de capacitação!\n\nMe informe em uma mensagem:\n\n1. Seu nome e email\n2. Área de atuação (número de 1 a 5)\n3. Nível: Iniciante, Intermediário ou Avançado\n4. Sua região\n\nCom essas informações eu monto sua trilha personalizada! 💪`;
    }
    if (lower.includes('checklist') || lower.includes('preparaç') || lower.includes('instituiç')) {
      return `📋 **Checklist de Preparação Institucional**\n\nVou guiar sua instituição através de um checklist completo.\n\nPrimeiro, me diga:\n1. Nome da instituição\n2. Cidade e estado\n3. Email do coordenador\n4. Tipo de risco: enchente, deslizamento, incêndio ou emergência geral\n\nVamos garantir que sua instituição esteja preparada! 🏫`;
    }
    if (lower.includes('olá') || lower.includes('oi') || lower.includes('hello') || lower.includes('bom dia') || lower.includes('boa')) {
      return `Olá! 👋 Bem-vindo(a) ao **Voluntariado Inteligente UNASP**!\n\nSou o assistente coordenador desta plataforma. Posso te ajudar com:\n\n🙋 **Cadastro de voluntários** — registre-se na rede\n🚨 **Reportar crise** — acionar ajuda imediata\n🎓 **Capacitação** — trilhas de treinamento personalizadas\n📋 **Checklist institucional** — preparação para emergências\n\nComo posso te ajudar hoje?`;
    }
    return `Entendi sua mensagem! 🤖\n\nEstou conectando você ao agente mais adequado para sua necessidade.\n\n*Nota: Este é o modo de demonstração. Para conectar ao IBM watsonx Orchestrate real, configure suas credenciais em* \`js/config.js\`.`;
  }

  // ── Método principal: enviar (auto-detecta modo) ──────────
  async send(text) {
    this.messageHistory.push({ role: 'user', content: text });

    if (ORCHESTRATE_CONFIG.demoMode) {
      const response = await this.sendDemoMessage(text);
      this.messageHistory.push({ role: 'bot', content: response });
      return response;
    }

    try {
      const response = await this.sendMessage(text);
      this.messageHistory.push({ role: 'bot', content: response });
      return response;
    } catch (err) {
      console.error('Erro IBM Orchestrate:', err);
      return `⚠️ Não foi possível conectar ao IBM watsonx Orchestrate.\n\nErro: ${err.message}\n\nVerifique as credenciais em \`js/config.js\`.`;
    }
  }

  // ── Inicializar conexão ───────────────────────────────────
  async connect() {
    if (ORCHESTRATE_CONFIG.demoMode) {
      this.isConnected = true;
      return true;
    }
    try {
      await this.createSession();
      return true;
    } catch (err) {
      console.error('Conexão falhou:', err);
      this.isConnected = false;
      return false;
    }
  }
}

// ── Funções de renderização de markdown simples ──────────────
function renderMarkdown(text) {
  return text
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Tables (basic)
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      const isHeader = cells.some(c => c.trim() === '---' || c.trim() === ':---:');
      if (isHeader) return '';
      const tag = 'td';
      return '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
    })
    // Wrap table rows in table
    .replace(/(<tr>.*<\/tr>\n?)+/gs, (match) => `<table>${match}</table>`)
    // Bullet points
    .replace(/^• (.+)$/gm, '<li>$1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/gs, (match) => `<ul>${match}</ul>`)
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

// Exportar instância global
const chat = new OrchestrateChat();
