#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FILE_DL="$ROOT_DIR/node_modules/expo-updates/ios/EXUpdates/AppLoader/FileDownloader.swift"
PODSPEC="$ROOT_DIR/node_modules/expo-updates/ios/EXUpdates.podspec"
EAS_CONFIG="$ROOT_DIR/node_modules/expo-eas-client/expo-module.config.json"
EAS_SRC="$ROOT_DIR/node_modules/expo-eas-client/src/EASClient.ts"
EAS_BUILD_JS="$ROOT_DIR/node_modules/expo-eas-client/build/EASClient.js"
EAS_BUILD_MAP="$ROOT_DIR/node_modules/expo-eas-client/build/EASClient.js.map"
PODS_CONFIG_DIR="$ROOT_DIR/ios/Pods/Target Support Files/Pods-WeatherSunscreen"

export WS_ROOT="$ROOT_DIR"

# 1. Expo Updates – inline the client ID helper so we can drop the EASClient pod
if [ -f "$FILE_DL" ]; then
  python3 - <<'PY'
import os
from pathlib import Path
root = Path(os.environ['WS_ROOT'])
file_path = root / 'node_modules' / 'expo-updates' / 'ios' / 'EXUpdates' / 'AppLoader' / 'FileDownloader.swift'
text = file_path.read_text()
text = text.replace('import EASClient\n', '')
marker = 'private typealias ParseDirectiveErrorBlock = (_ error: UpdatesError) -> Void\n\n'
helper = """private enum EASClientUUID {\n  private static let storageKey = \"expo.eas-client-id\"\n\n  static func value() -> UUID {\n    if let stored = UserDefaults.standard.string(forKey: storageKey),\n       let uuid = UUID(uuidString: stored) {\n      return uuid\n    }\n    let uuid = UUID()\n    UserDefaults.standard.set(uuid.uuidString, forKey: storageKey)\n    return uuid\n  }\n}\n\n"""
if helper not in text:
    text = text.replace(marker, marker + helper)
text = text.replace('EASClientID.uuid().uuidString', 'EASClientUUID.value().uuidString')
file_path.write_text(text)
PY
fi

if [ -f "$PODSPEC" ]; then
  python3 - <<'PY'
import os
from pathlib import Path
root = Path(os.environ['WS_ROOT'])
podspec = root / 'node_modules' / 'expo-updates' / 'ios' / 'EXUpdates.podspec'
text = podspec.read_text()
text = text.replace("  s.dependency 'EASClient'\n", '')
podspec.write_text(text)
PY
fi

# 2. Disable the iOS half of expo-eas-client (we still keep Android)
if [ -f "$EAS_CONFIG" ]; then
  python3 - <<'PY'
import json
import os
from pathlib import Path
root = Path(os.environ['WS_ROOT'])
config_path = root / 'node_modules' / 'expo-eas-client' / 'expo-module.config.json'
data = json.loads(config_path.read_text())
platforms = data.get('platforms')
if isinstance(platforms, list):
    data['platforms'] = [p for p in platforms if p.lower() != 'apple']
apple = data.get('apple')
if apple is None:
    data['apple'] = {'modules': []}
else:
    apple['modules'] = []
config_path.write_text(json.dumps(data, indent=2) + "\n")
PY
fi

JS_TS='const STORAGE_KEY = "expo.eas-client-id";\nlet cached: string | null = null;\n\nfunction generateUUID(): string {\n  if (typeof globalThis !== "undefined" && globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {\n    return globalThis.crypto.randomUUID();\n  }\n  const hex = "0123456789abcdef";\n  const chars = Array.from({ length: 36 }, (_, index) => {\n    if (index === 8 || index === 13 || index === 18 || index === 23) {\n      return "-";\n    }\n    const random = Math.floor(Math.random() * 16);\n    if (index === 14) {\n      return "4";\n    }\n    if (index === 19) {\n      return hex[(random & 0x3) | 0x8];\n    }\n    return hex[random];\n  });\n  return chars.join("");\n}\n\nfunction ensure(): string {\n  if (cached) {\n    return cached;\n  }\n  const memoKey = "__expo_eas_client_id__";\n  if (typeof globalThis !== "undefined") {\n    const existing = (globalThis as Record<string, unknown>)[memoKey];\n    if (typeof existing === "string" && existing.length > 0) {\n      cached = existing;\n      return cached;\n    }\n  }\n  cached = generateUUID();\n  try {\n    if (typeof globalThis !== "undefined") {\n      Object.defineProperty(globalThis, memoKey, { value: cached, configurable: true, enumerable: false, writable: false });\n    }\n  } catch {\n    // ignore inability to memoize globally\n  }\n  return cached;\n}\n\nconst moduleExport = {\n  get clientID(): string {\n    return ensure();\n  },\n};\n\nexport default moduleExport;\n'

JS_JS='let cached = null;\nfunction generateUUID() {\n  if (typeof globalThis !== "undefined" && globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {\n    return globalThis.crypto.randomUUID();\n  }\n  const hex = "0123456789abcdef";\n  const chars = Array.from({ length: 36 }, (_, index) => {\n    if (index === 8 || index === 13 || index === 18 || index === 23) {\n      return "-";\n    }\n    const random = Math.floor(Math.random() * 16);\n    if (index === 14) {\n      return "4";\n    }\n    if (index === 19) {\n      return hex[(random & 0x3) | 0x8];\n    }\n    return hex[random];\n  });\n  return chars.join("");\n}\nfunction ensure() {\n  if (cached) {\n    return cached;\n  }\n  const memoKey = "__expo_eas_client_id__";\n  if (typeof globalThis !== "undefined") {\n    const existing = globalThis[memoKey];\n    if (typeof existing === "string" && existing.length > 0) {\n      cached = existing;\n      return cached;\n    }\n  }\n  cached = generateUUID();\n  try {\n    if (typeof globalThis !== "undefined") {\n      Object.defineProperty(globalThis, memoKey, { value: cached, configurable: true, enumerable: false, writable: false });\n    }\n  } catch {\n    // ignore inability to memoize globally\n  }\n  return cached;\n}\nconst moduleExport = { get clientID() { return ensure(); } };\nexport default moduleExport;\n'

if [ -f "$EAS_SRC" ]; then
  printf "%s\n" "$JS_TS" > "$EAS_SRC"
fi
if [ -f "$EAS_BUILD_JS" ]; then
  printf "%s\n" "$JS_JS" > "$EAS_BUILD_JS"
fi
if [ -f "$EAS_BUILD_MAP" ]; then
  cat <<'MAP' > "$EAS_BUILD_MAP"
{"version":3,"file":"EASClient.js","sourceRoot":"","sources":["../src/EASClient.ts"],"names":[],"mappings":";AACA,IAAI,MAAM,GAAG,IAAI,CAAC;AACnB,SAAS,YAAY,GAAG;IACvB,IAAI,OAAO,UAAU,KAAK,WAAW,IAAI,UAAU,CAAC,MAAM,IAAI,OAAO,UAAU,CAAC,MAAM,CAAC,SAAS,KAAK,UAAU,EAAE;QAClG,OAAO,UAAU,CAAC,MAAM,EAAC;KAC3B;IACD,MAAM,GAAG,GAAG,\"0123456789abcdef\";IACpB,MAAM,KAAK,GAAG,MAAM,CAAC,IAAI,CAAC,EAAE,MAAM,EAAE,CAAC,EAAE,EAAE,EAAE,CAAC,EAAE,EAAE,EAAE,CAAC,EAAE,EAAE,EAAE,EAAE,EAAE;QACzD,IAAI,EAAE,KAAK,EAAE,KAAK,EAAE,IAAI,EAAE,KAAK,EAAE,IAAI,EAAE,IAAI,KAAK,CAAC,IAAI,CAAC,EAAE;YACpD,KAAK,OAAO,GAAG,GAAG,EAAE,CAAC;SACtB;QACD,IAAI,EAAE,KAAK,EAAE,KAAK,CAAC,GAAG,CAAC,IAAI,GAAG,CAAC,IAAI,IAAI,CAAC;YACrC,OAAO,GAAG,CAAC,CAAC,IAAI,CAAC;SACpB;QACD,IAAI,EAAE,KAAK,EAAE,EAAE,EAAE,IAAI,CAAC,UAAU,GAAG,CAAC,CAAC,EAAE,IAAI,CAAC,GAAG,GAAG,EAAE;YAC/C,KAAK,OAAO,GAAG,CAAC,CAAC,CAAC;SACrB;QACD,OAAO,GAAG,CAAC,MAAM,CAAC,CAAC;IACvB,CAAC,CAAC,CAAC;IACH,OAAO,KAAK,CAAC,IAAI,CAAC,GAAG,CAAC,CAAC;AAC1B;AAEA,SAAS,MAAM;IACf,IAAI,MAAM,EAAC,OAAO,EAAC;QACjB,OAAO,MAAM;KACf;IACD,MAAM,OAAO,GAAG,\"__expo_eas_client_id__\";IAC1B,IAAI,OAAO,UAAU,KAAK,WAAW,EAAE;QACrC,MAAM,QAAQ,GAAG,UAAU,CAAC,OAAO,CAAC,CAAC;QACtC,IAAI,OAAO,QAAQ,KAAK,QAAQ,IAAI,QAAQ,CAAC,MAAM,GAAG,CAAC,EAAE;YACrD,MAAM,GAAG,QAAQ;YACjB,OAAO,MAAM;SACf;KACF;IACD,MAAM,GAAG,YAAY,EAAE,CAAC;IACzB,IAAI;QACF,IAAI,OAAO,UAAU,KAAK,WAAW,EAAE;YACrC,OAAO,CAAC,cAAc,CAAC,UAAU,EAAE,YAAY,EAAE,YAAY,EAAE,OAAO,EAAE,cAAc,EAAE,IAAI,EAAE,YAAY,EAAE,KAAK,EAAE,WAAW,EAAE,IAAI,EAAE,OAAO,EAAE,KAAK,EAAE,CAAC,CAAC;SAC3H;KACF;IAAC,OAAO,CAAC,EAAE;QACV;KACF;IACD,OAAO,MAAM;AAChB;AAEA,MAAM,YAAY,GAAG,EAAE,GAAG,SAAS,EAAE,EAAE,OAAO,EAAE;IAC7C,OAAO,MAAM,CAAC;AAClB,CAAC;AACD,eAAe,YAAY,CAAC;"}
MAP
fi

# 3. Remove leftover linker search paths referencing EASClient
if [ -d "$PODS_CONFIG_DIR" ]; then
  python3 - <<'PY'
import os
from pathlib import Path
root = Path(os.environ['WS_ROOT'])
config_dir = root / 'ios' / 'Pods' / 'Target Support Files' / 'Pods-WeatherSunscreen'
replacements = [
    (' "${PODS_CONFIGURATION_BUILD_DIR}/EASClient"', ''),
    ('"${PODS_CONFIGURATION_BUILD_DIR}/EASClient"', ''),
    ('-l"EASClient" ', ''),
    (' -l"EASClient"', ''),
    ('"${PODS_CONFIGURATION_BUILD_DIR}/EASClient/EASClient.modulemap"', ''),
    ('"${PODS_CONFIGURATION_BUILD_DIR}/EASClient"', ''),
]
for name in ('Pods-WeatherSunscreen.debug.xcconfig', 'Pods-WeatherSunscreen.release.xcconfig'):
    path = config_dir / name
    if not path.exists():
        continue
    content = path.read_text()
    for old, new in replacements:
        content = content.replace(old, new)
    path.write_text(content)
PY
fi
