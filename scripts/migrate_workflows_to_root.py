from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / ".github" / "workflows"
OUT.mkdir(parents=True, exist_ok=True)

PACKAGES = {
    "api": {
        "paths": ["api/**", ".github/workflows/api-*.yml"],
        "dir": "api",
        "has_prisma": True,
    },
    "bff": {
        "paths": ["bff/**", ".github/workflows/bff-*.yml"],
        "dir": "bff",
        "has_prisma": False,
    },
}

FILE_MAP = [
    ("1 - validate.yaml", "validate.yml", "Validate"),
    ("2 - deploy-dev.yaml", "deploy-dev.yml", "Deploy develop"),
    ("3 - deploy-hom.yaml", "deploy-hom.yml", "Deploy Homol"),
    ("4 - deploy-prod.yml", "deploy-prod.yml", "Deploy Prod"),
]


def inject_paths(header: str, paths: list[str], events: list[str]) -> str:
    paths_yaml = "\n".join(f"      - '{p}'" for p in paths)

    for event in events:
        pattern = rf"(  {event}:\n(?:    .*\n)*)"
        match = re.search(pattern, header)
        if not match or "paths:" in match.group(1):
            continue

        lines = match.group(1).splitlines(True)
        insert_at = 1
        i = 1
        while i < len(lines):
            line = lines[i]
            if re.match(r"    \w", line) and not line.startswith("      "):
                key = line.strip().split(":")[0]
                if key in ("branches", "types", "inputs"):
                    i += 1
                    while i < len(lines) and (
                        lines[i].startswith("      ") or lines[i].strip() == ""
                    ):
                        i += 1
                    insert_at = i
                    continue
                break
            i += 1
            insert_at = i

        lines.insert(insert_at, f"    paths:\n{paths_yaml}\n")
        header = header[: match.start(1)] + "".join(lines) + header[match.end(1) :]

    return header


def patch_setup_node_cache(content: str, pkg_dir: str) -> str:
    pattern = re.compile(
        r"(uses: actions/setup-node@v6\n(?:[^\n]*\n)*?          cache: npm\n)"
    )

    def repl(match: re.Match[str]) -> str:
        block = match.group(1)
        if "cache-dependency-path" in block:
            return block
        return block.rstrip("\n") + f"\n          cache-dependency-path: {pkg_dir}/package-lock.json\n"

    return pattern.sub(repl, content)


def patch_content(content: str, pkg: str, meta: dict, title_suffix: str) -> str:
    pkg_dir = meta["dir"]
    paths = meta["paths"]

    content = re.sub(
        r"^name:.*$",
        f"name: {pkg.upper()} - {title_suffix}",
        content,
        count=1,
        flags=re.M,
    )

    for old, new in [
        ("group: validate-", f"group: {pkg}-validate-"),
        ("group: deploy-dev-", f"group: {pkg}-deploy-dev-"),
        ("group: deploy-hom-", f"group: {pkg}-deploy-hom-"),
        ("group: deploy-prod-", f"group: {pkg}-deploy-prod-"),
    ]:
        content = content.replace(old, new)

    header, jobs = content.split("\njobs:", 1)
    events = []
    if re.search(r"^  push:", header, re.M):
        events.append("push")
    if re.search(r"^  pull_request:", header, re.M):
        events.append("pull_request")
    header = inject_paths(header, paths, events)

    if "defaults:" not in header:
        header = (
            header.rstrip()
            + f"\n\ndefaults:\n  run:\n    working-directory: {pkg_dir}\n\n"
        )

    content = header + "jobs:" + jobs
    content = patch_setup_node_cache(content, pkg_dir)

    if not meta["has_prisma"]:
        content = content.replace("\n      - run: npm run prisma:generate", "")
        content = re.sub(r"\nenv:\n  DATABASE_URL:.*\n", "\n", content, count=1)

    content = content.replace(
        'HOM_WORKFLOW_PATH=".github/workflows/3 - deploy-hom.yaml"',
        f'HOM_WORKFLOW_PATH=".github/workflows/{pkg}-deploy-hom.yml"',
    )
    content = content.replace(
        'PROD_WORKFLOW_PATH=".github/workflows/4 - deploy-prod.yml"',
        f'PROD_WORKFLOW_PATH=".github/workflows/{pkg}-deploy-prod.yml"',
    )

    content = content.replace(
        'git checkout "origin/${SOURCE_BRANCH}" -- "${HOM_WORKFLOW_PATH}"',
        'git -C "${{ github.workspace }}" checkout "origin/${SOURCE_BRANCH}" -- "${HOM_WORKFLOW_PATH}"',
    )
    content = content.replace(
        'git checkout "origin/${SOURCE_BRANCH}" -- "${PROD_WORKFLOW_PATH}"',
        'git -C "${{ github.workspace }}" checkout "origin/${SOURCE_BRANCH}" -- "${PROD_WORKFLOW_PATH}"',
    )
    content = content.replace(
        'git add "${HOM_WORKFLOW_PATH}" "${PROD_WORKFLOW_PATH}" || true',
        'git -C "${{ github.workspace }}" add "${HOM_WORKFLOW_PATH}" "${PROD_WORKFLOW_PATH}" || true',
    )

    content = content.replace(
        "execSync(`git show ${ref}:package.json`",
        "execSync(`git show ${ref}:" + pkg_dir + "/package.json`",
    )

    content = content.replace(
        "          path: |\n            package.json\n            package-lock.json\n",
        f"          path: |\n            {pkg_dir}/package.json\n            {pkg_dir}/package-lock.json\n",
    )

    content = re.sub(
        r"(name: package-metadata-prod\n          path: )\.",
        rf"\1{pkg_dir}",
        content,
    )

    content = content.replace(
        "package.json|package-lock.json) ;;",
        f"{pkg_dir}/package.json|{pkg_dir}/package-lock.json) ;;",
    )
    content = content.replace(
        "só package.json / package-lock.json são resolvidos automaticamente.",
        f"só {pkg_dir}/package.json / package-lock.json são resolvidos automaticamente.",
    )

    # Steps that only do git PR automation should run at repo root
    content = content.replace(
        '      - name: "Create or update PR"\n        shell: bash\n        run: |',
        '      - name: "Create or update PR"\n        shell: bash\n        working-directory: .\n        run: |',
    )
    content = content.replace(
        "      - name: Delete promote branch\n        shell: bash\n        run: |",
        "      - name: Delete promote branch\n        shell: bash\n        working-directory: .\n        run: |",
    )
    content = content.replace(
        "      - name: Create or update release and promote branches\n        shell: bash\n        run: |",
        "      - name: Create or update release and promote branches\n        shell: bash\n        working-directory: .\n        run: |",
    )
    content = content.replace(
        "      - name: Merge main into release and align npm version\n        shell: bash\n",
        "      - name: Merge main into release and align npm version\n        shell: bash\n        working-directory: .\n",
    )
    content = content.replace(
        "      - name: Create or update PR\n        shell: bash\n        env:\n          GH_TOKEN:",
        "      - name: Create or update PR\n        shell: bash\n        working-directory: .\n        env:\n          GH_TOKEN:",
    )

    # Version bump scripts now run at repo root — point to package dir
    content = content.replace(
        'PACKAGE_VERSION="$(node -p "require(\'./package.json\').version")"',
        f'PACKAGE_VERSION="$(node -p "require(\'./{pkg_dir}/package.json\').version")"',
    )
    content = content.replace(
        'current_version="$(node -p "require(\'./package.json\').version")"',
        f'current_version="$(node -p "require(\'./{pkg_dir}/package.json\').version")"',
    )
    content = content.replace(
        'npm version "$target_version" --no-git-tag-version',
        f'npm version "$target_version" --no-git-tag-version --prefix {pkg_dir}',
    )
    content = content.replace(
        "git add package.json package-lock.json",
        f"git add {pkg_dir}/package.json {pkg_dir}/package-lock.json",
    )

    # Prod resolve-version node script writes package.json at cwd; force working-dir
    content = content.replace(
        "      - name: Definir versão como a mais recente entre os pais do merge\n        run: |",
        "      - name: Definir versão como a mais recente entre os pais do merge\n        working-directory: .\n        run: |",
    )
    content = content.replace(
        "const cur = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;",
        f"const cur = JSON.parse(fs.readFileSync('{pkg_dir}/package.json', 'utf8')).version;",
    )
    content = content.replace(
        "execSync(`npm version ${target} --no-git-tag-version`, { stdio: 'inherit' });",
        "execSync(`npm version ${target} --no-git-tag-version --prefix "
        + pkg_dir
        + "`, { stdio: 'inherit' });",
    )

    return content


def main() -> None:
    for pkg, meta in PACKAGES.items():
        src_dir = ROOT / pkg / ".github" / "workflows"
        for src_name, dst_name, title in FILE_MAP:
            text = (src_dir / src_name).read_text(encoding="utf-8")
            text = patch_content(text, pkg, meta, title)
            out = OUT / f"{pkg}-{dst_name}"
            out.write_text(text, encoding="utf-8")
            print(f"wrote {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
