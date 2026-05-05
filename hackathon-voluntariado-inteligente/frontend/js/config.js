// ══════════════════════════════════════════════════════════════
//  IBM watsonx Orchestrate — Configuração de Integração
//  Preencha com os dados do seu ambiente IBM Cloud
// ══════════════════════════════════════════════════════════════

const ORCHESTRATE_CONFIG = {
  // ── Credenciais IBM Cloud ─────────────────────────────────
  // Obtenha em: IBM Cloud > Manage > Access (IAM) > API keys
  apiKey: 'YOUR_IBM_CLOUD_API_KEY',

  // ── Instância do Watson Assistant / Orchestrate ───────────
  // Obtenha em: IBM Cloud > Resource list > sua instância
  serviceInstanceId: 'YOUR_SERVICE_INSTANCE_ID',

  // ── ID do Manager Agent ───────────────────────────────────
  // Obtenha em: watsonx Orchestrate > Manager_agent > Settings
  assistantId: 'YOUR_MANAGER_AGENT_ID',

  // ── Região do seu serviço ─────────────────────────────────
  // Exemplos: 'us-south', 'eu-de', 'au-syd', 'jp-tok'
  region: 'us-south',

  // ── Opção: IBM Web Chat Widget (mais simples para demo) ───
  // Obtenha em: Orchestrate > Deploy > Web Chat > Embed
  webChatIntegrationId: '',
  webChatRegion: 'us-south',

  // ── Modo Demo ─────────────────────────────────────────────
  // true = respostas simuladas (sem precisar de credenciais)
  // false = usa a API real do IBM Orchestrate
  demoMode: true,
};

// URL base da API (gerada automaticamente)
ORCHESTRATE_CONFIG.baseUrl =
  `https://api.${ORCHESTRATE_CONFIG.region}.assistant.watson.cloud.ibm.com/instances/${ORCHESTRATE_CONFIG.serviceInstanceId}`;

// Versão da API Watson Assistant
ORCHESTRATE_CONFIG.apiVersion = '2023-06-15';
