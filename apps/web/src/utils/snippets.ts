export type CodeLanguage = "python" | "typescript" | "curl" | "php";

export function generateSnippet(
  toolId: string,
  args: Record<string, any>,
  lang: CodeLanguage,
  baseUrl: string = "https://wezas-backend.onrender.com"
): string {
  switch (lang) {
    case "python":
      return generatePythonSnippet(toolId, args);
    case "typescript":
      return generateTypeScriptSnippet(toolId, args, baseUrl);
    case "curl":
      return generateCurlSnippet(toolId, args, baseUrl);
    case "php":
      return generatePhpSnippet(toolId, args, baseUrl);
    default:
      return "";
  }
}

function generatePythonSnippet(toolId: string, args: Record<string, any>): string {
  switch (toolId) {
    case "valider_telephone":
      return `from wezas_core.phone import validate_phone

# Validation de numéro de téléphone africain
res = validate_phone(
    pays="${args.pays || "GA"}",
    numero="${args.numero || "077123456"}"
)

if res.ok:
    print("Numéro E.164 :", res.data["e164"])
    print("Opérateur :", res.data["operateur_probable"])
    print("Mobile Money :", res.data["mobile_money"])
else:
    print("Erreur :", res.error.message.fr)`;

    case "convertir_devise":
      return `from wezas_core.currency import convert

# Conversion de devises hors ligne (parité fixe XAF/XOF/EUR)
res = convert(
    amount=${args.montant ?? 50000},
    de="${args.de || "EUR"}",
    vers="${args.vers || "XAF"}"
)

if res.ok:
    print(f"{res.data['montant']} {res.data['de']} = {res.data['resultat']} {res.data['vers']}")`;

    case "info_pays":
      return `from wezas_core.country import get_country_info

# Données pays & calendrier des jours fériés légaux
res = get_country_info(
    pays="${args.pays || "SN"}",
    annee=${args.annee || 2026}
)

if res.ok:
    print("Capitale :", res.data["pays"]["capitale"])
    print("Devise :", res.data["devise"]["nom"])
    print("Jours fériés :", len(res.data["jours_feries"]))`;

    case "formater_montant":
      return `from wezas_core.format_amount import format_amount

# Formatage monétaire selon les règles locales africaines
res = format_amount(
    amount=${args.montant ?? 1500000},
    devise="${args.devise || "XOF"}",
    pays="${args.pays || "CI"}",
    inclure_symbole=${args.inclure_symbole ? "True" : "False"}
)

if res.ok:
    print("Montant formaté :", res.data["montant_formate"])`;

    case "calculer_tva":
      return `from wezas_core.vat import calculate_vat

# Calcul fiscal de TVA par pays africain
res = calculate_vat(
    montant=${args.montant ?? 100000},
    pays="${args.pays || "CM"}",
    mode="${args.mode || "ht"}"
)

if res.ok:
    print("Montant HT :", res.data["montant_ht"])
    print(f"Taxe ({res.data['nom_taxe']} {res.data['taux_pourcentage']}) :", res.data["montant_taxe"])
    print("Montant TTC :", res.data["montant_ttc"])`;

    case "lister_operateurs":
      return `from wezas_core.operators import list_operators

# Catalogue des réseaux télécoms & services Mobile Money
res = list_operators(
    pays="${args.pays || "SN"}",
    avec_mobile_money_seulement=${args.avec_mobile_money_seulement ? "True" : "False"}
)

if res.ok:
    for op in res.data["operateurs"]:
        print(f"- {op['nom']} : {', '.join(op['mobile_money'])}")`;

    default:
      return `# Outil : ${toolId}\n`;
  }
}

function generateTypeScriptSnippet(toolId: string, args: Record<string, any>, baseUrl: string): string {
  const jsonPayload = JSON.stringify({ tool: toolId, arguments: args }, null, 2);
  return `// Appel via l'API Wezas Africa Toolkit
async function callWezasToolkit() {
  const response = await fetch("${baseUrl}/api/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(${jsonPayload})
  });

  const { ok, data, error } = await response.json();
  if (ok) {
    console.log("Résultat :", data);
  } else {
    console.error("Erreur :", error);
  }
}

callWezasToolkit();`;
}

function generateCurlSnippet(toolId: string, args: Record<string, any>, baseUrl: string): string {
  const singleLinePayload = JSON.stringify({ tool: toolId, arguments: args });
  return `curl -X POST "${baseUrl}/api/execute" \\
  -H "Content-Type: application/json" \\
  -d '${singleLinePayload}'`;
}

function generatePhpSnippet(toolId: string, args: Record<string, any>, baseUrl: string): string {
  const jsonPayload = JSON.stringify({ tool: toolId, arguments: args }, null, 2);
  return `<?php
// Appel Wezas Africa Toolkit en PHP / Laravel
$url = "${baseUrl}/api/execute";
$data = ${jsonPayload};

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
if ($result['ok'] ?? false) {
    print_r($result['data']);
} else {
    echo "Erreur : " . ($result['error']['message']['fr'] ?? 'Inconnue');
}
`;
}
