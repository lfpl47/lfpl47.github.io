#!/usr/bin/env python3
from __future__ import annotations

import ast
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.request import Request, urlopen

USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

FOLDERS: list[dict[str, Any]] = [
    {
        "key": "productivity",
        "id": "1FoLPpFMMTd4a58OWVCVZ_vkHkwXfZktL",
        "labels": {"en": "Productivity", "es": "Productividad"},
    },
    {
        "key": "programming",
        "id": "1o6nFBrTdgTIcbMq1r8fz4wYi3mk9rNRk",
        "labels": {"en": "Programming", "es": "Programación"},
    },
    {
        "key": "data_science_bi",
        "id": "14nFR4HDK2S2utS4hyWhbarSJ9-JW1g9l",
        "labels": {"en": "Data Science & BI", "es": "Ciencia de datos & BI"},
    },
    {
        "key": "cloud",
        "id": "1d9RIRpi20g6ve4FZj4QMZXe6P1a_Gjxc",
        "labels": {"en": "Cloud", "es": "Cloud"},
    },
]


def fetch_html(url: str) -> str:
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=30) as resp:  # nosec - public, read-only URL
        return resp.read().decode("utf-8", errors="ignore")


def extract_drive_ivd_json_text(html: str) -> str:
    match = re.search(r"window\['_DRIVE_ivd'\]\s*=\s*'([^']*)'", html)
    if not match:
        raise ValueError("Could not find window['_DRIVE_ivd'] in folder HTML.")

    raw = match.group(1)
    # Avoid Python parser warnings/errors for JS's escaped slashes.
    raw = raw.replace("\\/", "/")

    # Decode JS string literal escapes (\xNN, \uNNNN, etc.) into real characters.
    decoded = ast.literal_eval("'" + raw + "'")
    if not isinstance(decoded, str):
        raise TypeError("Decoded _DRIVE_ivd payload is not a string.")
    return decoded


def find_drive_file_url(node: list[Any], file_id: str) -> str:
    needle = f"/file/d/{file_id}/"
    for value in node:
        if isinstance(value, str) and needle in value:
            return value
    return f"https://drive.google.com/file/d/{file_id}/view"


def extract_pdf_files(data: Any, *, folder_id: str, folder_key: str) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []

    def walk(node: Any) -> None:
        if not isinstance(node, list):
            return

        if (
            len(node) >= 4
            and isinstance(node[0], str)
            and isinstance(node[1], list)
            and isinstance(node[2], str)
            and isinstance(node[3], str)
        ):
            file_id = node[0]
            parents = [p for p in node[1] if isinstance(p, str)]
            file_name = node[2]
            mime_type = node[3]

            if folder_id in parents and mime_type == "application/pdf":
                title = file_name.rsplit(".", 1)[0] if "." in file_name else file_name
                found.append(
                    {
                        "id": file_id,
                        "folderKey": folder_key,
                        "folderId": folder_id,
                        "fileName": file_name,
                        "title": title,
                        "mimeType": mime_type,
                        "url": find_drive_file_url(node, file_id),
                    }
                )

        for child in node:
            walk(child)

    walk(data)

    seen: set[str] = set()
    unique: list[dict[str, Any]] = []
    for item in found:
        if item["id"] in seen:
            continue
        seen.add(item["id"])
        unique.append(item)

    return unique


def main() -> int:
    items: list[dict[str, Any]] = []
    folders_out: list[dict[str, Any]] = []

    for folder in FOLDERS:
        folder_id = folder["id"]
        folder_key = folder["key"]
        folder_url = f"https://drive.google.com/drive/folders/{folder_id}?usp=sharing"

        html = fetch_html(folder_url)
        ivd_json_text = extract_drive_ivd_json_text(html)
        data = json.loads(ivd_json_text)

        folders_out.append(
            {
                "key": folder_key,
                "id": folder_id,
                "url": folder_url,
                "labels": folder["labels"],
            }
        )
        items.extend(extract_pdf_files(data, folder_id=folder_id, folder_key=folder_key))

    items.sort(key=lambda x: (x["folderKey"], x["title"].casefold()))

    out = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "folders": folders_out,
        "items": items,
    }

    out_path = Path("src/data/certifications.json")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Wrote {out_path} with {len(items)} PDFs across {len(folders_out)} folders.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

