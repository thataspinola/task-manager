#!/usr/bin/env python3
"""Gera uma entrada de histórico MkDocs a partir do push atual do GitHub Actions."""

from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
ENTRIES = DOCS / "historico" / "entries"
INDEX = DOCS / "historico" / "index.md"


def run_git(*args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).strip()


def load_event() -> dict:
    path = os.environ.get("GITHUB_EVENT_PATH")
    if not path or not Path(path).is_file():
        return {}
    return json.loads(Path(path).read_text(encoding="utf-8"))


def short_sha(sha: str) -> str:
    return (sha or "unknown")[:7]


def safe_slug(value: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9._-]+", "-", value).strip("-").lower()
    return value or "push"


def changed_files(before: str, after: str) -> list[str]:
    if not before or before == "0" * 40:
        try:
            out = run_git("show", "--name-only", "--pretty=format:", after)
        except subprocess.CalledProcessError:
            return []
    else:
        try:
            out = run_git("diff", "--name-only", f"{before}...{after}")
        except subprocess.CalledProcessError:
            out = run_git("show", "--name-only", "--pretty=format:", after)
    return [line for line in out.splitlines() if line.strip()]


def commits_between(before: str, after: str, event: dict) -> list[dict]:
    commits = event.get("commits") or []
    if commits:
        return [
            {
                "id": c.get("id", ""),
                "message": (c.get("message") or "").strip(),
                "author": (c.get("author") or {}).get("name")
                or (c.get("author") or {}).get("username")
                or "desconhecido",
                "timestamp": c.get("timestamp") or "",
                "url": c.get("url") or "",
            }
            for c in commits
        ]

    range_spec = after if not before or before == "0" * 40 else f"{before}...{after}"
    try:
        fmt = "%H%x09%s%x09%an%x09%aI"
        out = run_git("log", "--pretty=format:" + fmt, range_spec)
    except subprocess.CalledProcessError:
        return []

    result = []
    for line in out.splitlines():
        parts = line.split("\t")
        if len(parts) < 4:
            continue
        sha, subject, author, ts = parts[0], parts[1], parts[2], parts[3]
        result.append(
            {
                "id": sha,
                "message": subject,
                "author": author,
                "timestamp": ts,
                "url": "",
            }
        )
    return result


def render_entry(
    *,
    branch: str,
    before: str,
    after: str,
    pusher: str,
    compare_url: str,
    commits: list[dict],
    files: list[str],
    generated_at: str,
) -> str:
    lines = [
        f"# Push `{short_sha(after)}`",
        "",
        f"**Data (UTC):** {generated_at}  ",
        f"**Branch:** `{branch}`  ",
        f"**Autor do push:** {pusher}  ",
        f"**SHA:** [`{short_sha(after)}`](https://github.com/{os.environ.get('GITHUB_REPOSITORY', 'thataspinola/task-manager')}/commit/{after})  ",
    ]
    if compare_url:
        lines.append(f"**Compare:** [diff do push]({compare_url})  ")
    if before and before != "0" * 40:
        lines.append(f"**Antes:** `{short_sha(before)}`  ")

    lines.extend(["", "## Commits", ""])
    if not commits:
        lines.append("_Nenhum commit listado neste evento._")
    else:
        for c in commits:
            msg = (c["message"] or "").splitlines()[0]
            sha = short_sha(c["id"])
            author = c.get("author") or "desconhecido"
            ts = c.get("timestamp") or ""
            url = c.get("url") or ""
            title = f"[`{sha}`]({url}) — {msg}" if url else f"`{sha}` — {msg}"
            lines.append(f"- {title}  ")
            lines.append(f"  - Autor: {author}" + (f" · {ts}" if ts else ""))

    lines.extend(["", "## Arquivos alterados", ""])
    if not files:
        lines.append("_Nenhum arquivo listado._")
    else:
        for path in files:
            lines.append(f"- `{path}`")

    lines.extend(
        [
            "",
            "---",
            "",
            "_Entrada gerada automaticamente pelo workflow de documentação._",
            "",
        ]
    )
    return "\n".join(lines)


def rebuild_index() -> None:
    entries = sorted(ENTRIES.glob("*.md"), reverse=True)
    lines = [
        "# Histórico de pushes",
        "",
        "Registro automático do que entrou em cada push no repositório.",
        "Cada entrada lista commits, autor e arquivos alterados.",
        "",
        f"**Total de registros:** {len(entries)}",
        "",
        "| Data (UTC) | Branch | SHA | Resumo |",
        "| ---------- | ------ | --- | ------ |",
    ]

    for path in entries:
        text = path.read_text(encoding="utf-8")
        first_heading = next(
            (ln[2:].strip() for ln in text.splitlines() if ln.startswith("# ")),
            path.stem,
        )
        branch = ""
        date = ""
        for ln in text.splitlines():
            if ln.startswith("**Branch:**"):
                branch = ln.split("`")[1] if "`" in ln else ""
            if ln.startswith("**Data (UTC):**"):
                date = ln.replace("**Data (UTC):**", "").strip().rstrip(" ")
        rel = f"entries/{path.name}"
        lines.append(
            f"| {date} | `{branch}` | [{first_heading}]({rel}) | [abrir]({rel}) |"
        )

    if not entries:
        lines.extend(
            [
                "",
                "_Ainda não há pushes registrados. O próximo push no CI criará a primeira entrada._",
                "",
            ]
        )
    else:
        lines.append("")

    INDEX.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    ENTRIES.mkdir(parents=True, exist_ok=True)

    event = load_event()
    after = (
        os.environ.get("GITHUB_SHA")
        or (event.get("after") or "")
        or run_git("rev-parse", "HEAD")
    )
    before = event.get("before") or os.environ.get("PUSH_BEFORE") or ""
    ref = os.environ.get("GITHUB_REF_NAME") or event.get("ref", "").replace(
        "refs/heads/", ""
    )
    pusher = (
        (event.get("pusher") or {}).get("name")
        or os.environ.get("GITHUB_ACTOR")
        or "desconhecido"
    )
    compare_url = event.get("compare") or ""
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    commits = commits_between(before, after, event)
    files = changed_files(before, after)

    filename = f"{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}-{safe_slug(short_sha(after))}.md"
    entry_path = ENTRIES / filename
    entry_path.write_text(
        render_entry(
            branch=ref or "unknown",
            before=before,
            after=after,
            pusher=pusher,
            compare_url=compare_url,
            commits=commits,
            files=files,
            generated_at=generated_at,
        ),
        encoding="utf-8",
    )

    rebuild_index()

    print(f"Histórico gerado: {entry_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
