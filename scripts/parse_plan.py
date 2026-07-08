#!/usr/bin/env python3
"""Parsea plan-carrera-geoespacial.md -> src/data/plan.json

Estructura de salida:
  phases:   [{id, name, emoji, description, deliverable, order}]
  weeks:    [{id, phaseId, number, title, startDate}]
  tasks:    [{id, weekId, dayOfWeek, block, title, description, doneCriteria,
              resourceUrl, type, xp, date}]
  holidays: [{date, name}]
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_MD = ROOT.parent / "plan-carrera-geoespacial.md"
OUT = ROOT / "src" / "data" / "plan.json"

WEEK1_MONDAY = date(2026, 7, 13)
DAY_TOKENS = ["Lun", "Mar", "Mié", "Jue", "Vie"]
MONTHS = {
    "ene": 1, "feb": 2, "mar": 3, "abr": 4, "may": 5, "jun": 6,
    "jul": 7, "ago": 8, "sep": 9, "oct": 10, "nov": 11, "dic": 12,
}
PHASE_EMOJI = {
    "FASE 0": "🐍", "MES 1": "🗺️", "MES 2": "🛰️", "MES 3": "🌲",
    "MÓDULO SENSORES": "🔌", "MES 4": "🌱", "MES 5": "🛠️", "MESES 6–7": "🚀",
}


def slug(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text


def strip_md(text: str) -> str:
    """Quita marcado markdown pero conserva el texto (incl. texto de links)."""
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = text.replace("**", "").replace("*", "").replace("`", "")
    text = re.sub(r"\s+", " ", text).strip()
    return re.sub(r"\s+([,.;:])", r"\1", text)


def first_url(text: str) -> str | None:
    m = re.search(r"\[[^\]]+\]\((https?://[^)]+)\)", text)
    return m.group(1) if m else None


def parse_holidays(md: str) -> list[dict]:
    holidays = []
    for m in re.finditer(
        r"^\|\s*(\d{1,2})\s+([a-z]{3})\s+(\d{4})\s*\|\s*\w+\s*\|\s*([^|]+?)\s*\|",
        md, re.MULTILINE,
    ):
        d, mon, yr, name = m.groups()
        if mon not in MONTHS:
            continue
        holidays.append({
            "date": date(int(yr), MONTHS[mon], int(d)).isoformat(),
            "name": name.strip(),
        })
    return holidays


def parse_day_header(header: str) -> tuple[int, int, str, bool] | None:
    """Devuelve (day_start, day_end, title, is_rest) o None."""
    hm = re.match(
        r"^(Lun|Mar|Mié|Jue|Vie)(?:\s+a\s+(Lun|Mar|Mié|Jue|Vie))?"
        r"(?:\s*\(([^)]*)\))?\s*—\s*(.+?)\.?$",
        header,
    )
    if not hm:
        return None
    d1, d2, paren, title = hm.groups()
    day_start = DAY_TOKENS.index(d1)
    day_end = DAY_TOKENS.index(d2) if d2 else day_start
    is_rest = (
        "FESTIVO" in header
        or (paren and "FESTIVO" in paren)
        or strip_md(title).lower() == "descanso"
    )
    return day_start, day_end, title, is_rest


def parse_day_body(body: str) -> tuple[str, str, str]:
    """Extrae mañana, noche y hecho del cuerpo (inline o bloques v5)."""
    morning_m = re.search(
        r"\*Mañana(?:\s*\([^)]*\))?\*:\s*(.*?)(?=\s*\*Noche(?:\s*\([^)]*\))?\*:|\s*\*Hecho:\*|$)",
        body,
        re.DOTALL | re.IGNORECASE,
    )
    night_m = re.search(
        r"\*Noche(?:\s*\([^)]*\))?\*:\s*(.*?)(?=\s*\*Hecho:\*|$)",
        body,
        re.DOTALL | re.IGNORECASE,
    )
    done_m = re.search(r"\*Hecho:\*\s*(.*?)$", body, re.DOTALL)

    morning = morning_m.group(1).strip() if morning_m else ""
    night = night_m.group(1).strip() if night_m else ""
    done = done_m.group(1).strip() if done_m else ""
    return morning, night, done


def flatten_body(text: str) -> str:
    """Convierte pasos numerados y sub-bullets a líneas legibles."""
    lines: list[str] = []
    in_code = False
    for raw in text.splitlines():
        line = raw.strip()
        if line.startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        numbered = bool(re.match(r"^\d+\.\s+", line))
        bulleted = bool(re.match(r"^-\s+", line))
        line = re.sub(r"^\d+\.\s*", "", line)
        line = re.sub(r"^-\s+", "", line)
        line = strip_md(line)
        if not line or line == "-":
            continue
        if numbered or bulleted:
            lines.append(f"• {line}")
        else:
            lines.append(line)
    return "\n".join(lines)


def append_tasks(
    tasks: list[dict],
    *,
    cur_week: dict,
    cur_phase: dict,
    day_start: int,
    day_end: int,
    title: str,
    morning: str,
    night: str,
    done: str,
    body: str,
) -> None:
    is_project_week = (
        "Proyecto" in cur_week["title"]
        or cur_phase["id"] in ("modulo-sensores", "mes-5")
    )
    done_flat = strip_md(done).rstrip(".")

    for dow in range(day_start, day_end + 1):
        day_id = slug(DAY_TOKENS[dow])
        task_date = (
            date.fromisoformat(cur_week["startDate"]) + timedelta(days=dow)
        ).isoformat()

        if morning:
            if re.search(r"\*\*Posts?\s+\d|Post\s+\d+\s+LinkedIn", body, re.I):
                ttype, xp = "post", 30
            elif is_project_week:
                ttype, xp = "project", 15
            else:
                ttype, xp = "study", 10
            tasks.append({
                "id": f"{cur_week['id']}-{day_id}-m",
                "weekId": cur_week["id"],
                "dayOfWeek": dow,
                "block": "morning",
                "title": strip_md(title),
                "description": flatten_body(morning),
                "doneCriteria": done_flat,
                "resourceUrl": first_url(morning) or first_url(body),
                "type": ttype,
                "xp": xp,
                "date": task_date,
            })

        if night and not re.match(r"^descanso\.?$", strip_md(night), re.IGNORECASE):
            is_review = "revisión" in night.lower()
            tasks.append({
                "id": f"{cur_week['id']}-{day_id}-n",
                "weekId": cur_week["id"],
                "dayOfWeek": dow,
                "block": "night",
                "title": "Revisión semanal" if is_review else "Bloque ligero",
                "description": flatten_body(night),
                "doneCriteria": "",
                "resourceUrl": first_url(night) or first_url(body),
                "type": "review" if is_review else "study",
                "xp": 20 if is_review else 5,
                "date": task_date,
            })


def main() -> None:
    md = SRC_MD.read_text(encoding="utf-8")

    holidays = parse_holidays(md)

    # Solo la sección "## 5. Detalle día a día"
    detail = md.split("## 5. Detalle día a día", 1)[1]
    detail = detail.split("\n## 6.", 1)[0]

    phases: list[dict] = []
    weeks: list[dict] = []
    tasks: list[dict] = []

    cur_phase: dict | None = None
    cur_week: dict | None = None

    day_line = re.compile(r"^- \*\*(.+?)\*\*(.*)$")
    week_hdr = re.compile(r"^#### S(\d+) \([^)]*\) — (.+)$")
    phase_hdr = re.compile(r"^### (.+)$")

    lines = detail.splitlines()
    i = 0
    while i < len(lines):
        raw = lines[i]
        line = raw.strip()
        if not line:
            i += 1
            continue

        pm = phase_hdr.match(line)
        if pm:
            full = pm.group(1)
            key, _, _rest = full.partition(" — ")
            key = key.strip()
            cur_phase = {
                "id": slug(key),
                "name": strip_md(full),
                "emoji": PHASE_EMOJI.get(key, "📍"),
                "description": "",
                "deliverable": "",
                "order": len(phases),
            }
            phases.append(cur_phase)
            i += 1
            continue

        wm = week_hdr.match(line)
        if wm and cur_phase:
            num = int(wm.group(1))
            title = wm.group(2)
            title = re.split(r"\s*·\s*", title)[0].strip()
            cur_week = {
                "id": f"s{num:02d}",
                "phaseId": cur_phase["id"],
                "number": num,
                "title": strip_md(title),
                "startDate": (WEEK1_MONDAY + timedelta(weeks=num - 1)).isoformat(),
            }
            weeks.append(cur_week)
            i += 1
            continue

        if cur_phase and line.startswith("**Entregable"):
            cur_phase["deliverable"] = strip_md(line.split(":", 1)[-1])
            i += 1
            continue

        if (
            cur_phase
            and not cur_phase["description"]
            and cur_week is None
            and not line.startswith(("#", "-", "|", "**Entregable", "```", ">"))
        ):
            if not any(w["phaseId"] == cur_phase["id"] for w in weeks):
                cur_phase["description"] = strip_md(line)
                i += 1
                continue

        dm = day_line.match(line)
        if dm and cur_week and cur_phase and not raw.startswith("  "):
            header, inline_rest = dm.group(1), dm.group(2).strip()
            if inline_rest.startswith(("—", "–")):
                header = f"{header} {inline_rest.rstrip('.')}"
                inline_rest = ""
            parsed = parse_day_header(header)
            if not parsed:
                print(f"  [WARN] header no reconocido: {header!r}", file=sys.stderr)
                i += 1
                continue

            day_start, day_end, title, is_rest = parsed
            if is_rest:
                i += 1
                continue

            body_parts: list[str] = []
            if inline_rest:
                body_parts.append(inline_rest)
            i += 1
            while i < len(lines):
                nxt = lines[i]
                if nxt.startswith("#### ") or nxt.startswith("### "):
                    break
                if nxt.strip().startswith("**Entregable"):
                    break
                if re.match(r"^- \*\*", nxt) and not nxt.startswith("  "):
                    break
                if nxt.strip():
                    body_parts.append(nxt.rstrip())
                i += 1

            body = "\n".join(body_parts)
            morning, night, done = parse_day_body(body)
            append_tasks(
                tasks,
                cur_week=cur_week,
                cur_phase=cur_phase,
                day_start=day_start,
                day_end=day_end,
                title=title,
                morning=morning,
                night=night,
                done=done,
                body=body,
            )
            continue

        i += 1

    out = {"phases": phases, "weeks": weeks, "tasks": tasks, "holidays": holidays}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")

    print(f"fases:    {len(phases)}")
    for p in phases:
        wk = [w for w in weeks if w['phaseId'] == p['id']]
        print(f"  {p['emoji']} {p['name']}: {len(wk)} semanas")
    print(f"semanas:  {len(weeks)}")
    print(f"tareas:   {len(tasks)}")
    print(f"festivos: {len(holidays)}")
    types = {}
    for t in tasks:
        types[t["type"]] = types.get(t["type"], 0) + 1
    print(f"por tipo: {types}")
    total_xp = sum(t["xp"] for t in tasks)
    print(f"XP total tareas (sin bonus): {total_xp}")


if __name__ == "__main__":
    main()
