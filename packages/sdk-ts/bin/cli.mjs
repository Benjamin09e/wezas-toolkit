#!/usr/bin/env node

/**
 * Serveur MCP Stdio pour Wezas Africa Toolkit.
 * Permet l'exécution directe via `npx -y wezas-africa-toolkit` ou `npx -y wezas-africa`.
 */

import readline from "readline";

const VERSION = "0.1.1";
const REMOTE_BACKEND = process.env.WEZAS_BACKEND_URL || "https://wezas-backend.onrender.com";

const TOOLS = [
  {
    name: "ping",
    description: "Vérifie que le serveur MCP Wezas Africa répond et retourne sa version.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "valider_telephone",
    description: "Valide un numéro africain, normalise en E.164, détecte l'opérateur et les portefeuilles Mobile Money.",
    inputSchema: {
      type: "object",
      properties: {
        pays: { type: "string", description: "Nom, code ISO2 (SN, CI, GA...) ou indicatif (+221, +225...)" },
        numero: { type: "string", description: "Numéro de téléphone brut national ou international" },
      },
      required: ["pays", "numero"],
    },
  },
  {
    name: "convertir_devise",
    description: "Convertit un montant entre devises de la zone franc (XAF, XOF, EUR parité fixe) et USD (taux indicatif).",
    inputSchema: {
      type: "object",
      properties: {
        montant: { type: "number", description: "Montant à convertir" },
        de: { type: "string", description: "Devise source (XAF, XOF, EUR, USD)" },
        vers: { type: "string", description: "Devise cible (XAF, XOF, EUR, USD)" },
        taux: { type: "number", description: "Taux de change personnalisé optionnel" },
      },
      required: ["montant", "de", "vers"],
    },
  },
  {
    name: "info_pays",
    description: "Récupère les informations officielles d'un pays africain : indicatif, devise, langues et jours fériés légaux.",
    inputSchema: {
      type: "object",
      properties: {
        pays: { type: "string", description: "Nom, code ISO2 ou indicatif du pays" },
        annee: { type: "integer", description: "Année civile pour le calcul des jours fériés légaux (ex: 2026)" },
        champs: { type: "array", items: { type: "string" }, description: "Liste facultative de champs à filtrer" },
      },
      required: ["pays"],
    },
  },
  {
    name: "formater_montant",
    description: "Formate un montant financier selon les conventions typographiques et monétaires du pays ou de la devise.",
    inputSchema: {
      type: "object",
      properties: {
        montant: { type: "number", description: "Montant à formater" },
        devise: { type: "string", description: "Code ISO devise (ex: XAF, XOF, EUR, USD)" },
        pays: { type: "string", description: "Code ou nom du pays" },
        inclure_symbole: { type: "boolean", description: "Inclure le symbole monétaire (FCFA, €, $)" },
      },
      required: ["montant"],
    },
  },
  {
    name: "calculer_tva",
    description: "Calcule la TVA (HT vers TTC ou extraction TTC vers HT) d'après les barèmes fiscaux officiels des pays africains.",
    inputSchema: {
      type: "object",
      properties: {
        montant: { type: "number", description: "Montant de base à taxer" },
        pays: { type: "string", description: "Code ISO2 ou nom du pays (GA, CM, SN, CI, NG, KE...)" },
        type_taux: { type: "string", enum: ["standard", "reduit", "super_reduit"], description: "Type de taux TVA légal" },
        mode: { type: "string", enum: ["ht", "ttc"], description: "Mode de calcul : ht (ajouter TVA) ou ttc (extraire TVA)" },
        taux_personnalise: { type: "number", description: "Taux personnalisé optionnel (ex: 0.18)" },
      },
      required: ["montant", "pays"],
    },
  },
  {
    name: "lister_operateurs",
    description: "Consulte le catalogue officiel des opérateurs télécoms et des services Mobile Money disponibles.",
    inputSchema: {
      type: "object",
      properties: {
        pays: { type: "string", description: "Code ISO2 ou nom du pays (optionnel, pour filtrer)" },
        avec_mobile_money_seulement: { type: "boolean", description: "Ne conserver que les opérateurs avec Mobile Money" },
      },
    },
  },
];

async function executeTool(name, args) {
  if (name === "ping") {
    return { status: "ok", version: VERSION };
  }

  const res = await fetch(`${REMOTE_BACKEND}/api/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool: name, arguments: args || {} }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error ${res.status}: ${errText}`);
  }

  return await res.json();
}

function sendResponse(id, result, error) {
  const msg = { jsonrpc: "2.0", id };
  if (error) {
    msg.error = error;
  } else {
    msg.result = result;
  }
  process.stdout.write(JSON.stringify(msg) + "\n");
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on("line", async (line) => {
  if (!line.trim()) return;

  let request;
  try {
    request = JSON.parse(line);
  } catch (err) {
    console.error("Invalid JSON:", line);
    return;
  }

  const { id, method, params } = request;

  try {
    switch (method) {
      case "initialize":
        sendResponse(id, {
          protocolVersion: "2024-11-05",
          serverInfo: {
            name: "wezas-africa-toolkit",
            version: VERSION,
          },
          capabilities: {
            tools: {},
          },
        });
        break;

      case "notifications/initialized":
        // Notification, aucune réponse attendue
        break;

      case "tools/list":
        sendResponse(id, { tools: TOOLS });
        break;

      case "tools/call": {
        const toolName = params?.name;
        const toolArgs = params?.arguments || {};
        try {
          const result = await executeTool(toolName, toolArgs);
          sendResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
            isError: result?.ok === false,
          });
        } catch (err) {
          sendResponse(id, {
            content: [
              {
                type: "text",
                text: JSON.stringify({ ok: false, error: err.message }),
              },
            ],
            isError: true,
          });
        }
        break;
      }

      default:
        if (id !== undefined) {
          sendResponse(id, null, {
            code: -32601,
            message: `Method not found: ${method}`,
          });
        }
        break;
    }
  } catch (error) {
    if (id !== undefined) {
      sendResponse(id, null, {
        code: -32603,
        message: error.message || "Internal error",
      });
    }
  }
});
