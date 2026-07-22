#!/usr/bin/env python3
"""Resolve conflitos de merge em docs/historico.

Mantém a união das entries dos dois lados; se o mesmo ficheiro existir nos dois,
fica a versão com o commit mais recente. O index.md é sempre reconstruído a
partir das entries (evita conflito manual no PR).
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from generate_push_log import ENTRIES, rebuild_index  # noqa: E402


def run_git(*args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).strip()


def ref_exists(ref: str) -> bool:
    try:
        run_git("rev-parse", "-q", "--verify", ref)
        return True
    except subprocess.CalledProcessError:
        return False


def list_entries(ref: str) -> list[str]:
    try:
        out = run_git("ls-tree", "-r", "--name-only", ref, "--", "docs/historico/entries")
    except subprocess.CalledProcessError:
        return []
    return [line for line in out.splitlines() if line.strip().endswith(".md")]


def show_file(ref: str, path: str) -> str | None:
    try:
        return run_git("show", f"{ref}:{path}")
    except subprocess.CalledProcessError:
        return None


def file_commit_ts(ref: str, path: str) -> int:
    try:
        raw = run_git("log", "-1", "--format=%ct", ref, "--", path)
        return int(raw or "0")
    except (subprocess.CalledProcessError, ValueError):
        return 0


def main() -> int:
    refs = [ref for ref in ("HEAD", "MERGE_HEAD") if ref_exists(ref)]
    if not refs:
        print("Sem HEAD/MERGE_HEAD — nada a resolver.", file=sys.stderr)
        return 1

    ENTRIES.mkdir(parents=True, exist_ok=True)

    paths: set[str] = set()
    for ref in refs:
        paths.update(list_entries(ref))

    # Também inclui entries já no working tree (ex.: untracked após checkout parcial).
    paths.update(
        f"docs/historico/entries/{p.name}"
        for p in ENTRIES.glob("*.md")
    )

    for path in sorted(paths):
        name = Path(path).name
        candidates: list[tuple[int, str]] = []
        for ref in refs:
            content = show_file(ref, path)
            if content is None:
                continue
            candidates.append((file_commit_ts(ref, path), content))

        existing = ENTRIES / name
        if existing.is_file() and not candidates:
            continue
        if existing.is_file():
            # working tree como fallback de timestamp 0 só se nenhum lado tiver o ficheiro
            pass

        if not candidates:
            continue

        # Versão mais recente (maior %ct).
        candidates.sort(key=lambda item: item[0], reverse=True)
        (ENTRIES / name).write_text(candidates[0][1], encoding="utf-8", newline="\n")

    rebuild_index()
    subprocess.check_call(["git", "add", "--", "docs/historico"], cwd=ROOT)
    print(
        f"docs/historico resolvido: {len(list(ENTRIES.glob('*.md')))} entries; "
        "index.md reconstruído."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
