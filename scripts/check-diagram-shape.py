#!/usr/bin/env python3
"""فحص شكل مخططات المرحلة 1 (بلا متصفح).

يقرأ كل `S1-*/DIAGRAMS.md` ويفحص ما يمكن عدّه من النص:

  C1  لا تلوين: لا classDef ولا style ولا linkStyle ولا fill.
  S1  كل مخطط تسلسل يبدأ بسطر الالتفاف (WRAP أدناه).
  S2  التسلسل: 6 مشاركين على الأكثر.
  S3  التسلسل: 20 رسالة على الأكثر.
  S4  نص الرسالة 60 حرفاً على الأكثر.
  S5  نص الملاحظة 80 حرفاً على الأكثر.
  S6  لا كلمة متصلة فوق 24 حرفاً في رسالة أو ملاحظة (مسار خادم كامل مثلاً).
  F1  مخطط التدفق: 20 عقدة على الأكثر.
  E1  ERD: 12 جدولاً على الأكثر.
  B1  لا لفظ لاتيني بين كلمتين عربيتين في تسمية واحدة (ينقلب ترتيب الجملة عند الرسم).
  H1  لا محارف اتجاه مخفية: U+202A…U+202E وU+2066…U+2069 في الملف كله،
      وU+200E وU+200F داخل كتل المخططات.

العرض المرسوم نفسه يقيسه `scripts/measure-diagrams.mjs` (يحتاج متصفحاً).

التشغيل من جذر المستودع:
    python3 scripts/check-diagram-shape.py            # ملخص لكل نظام
    python3 scripts/check-diagram-shape.py --list     # كل مخالفة بسطرها
    python3 scripts/check-diagram-shape.py --only S1-06 --list
يخرج بغير الصفر عند أي مخالفة.
"""
import glob
import os
import re
import sys
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHASE = os.path.join(ROOT, 'docs', 'family-os', 'governance', 'phases', 'phase-1')
WRAP = '%%{init: {"sequence": {"wrap": true}}}%%'
RULES = ['C1', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'F1', 'E1', 'B1', 'H1']
HIDDEN = re.compile('[\u202a-\u202e\u2066-\u2069]')
MARKS = re.compile('[\u200e\u200f]')
MSG_MAX, NOTE_MAX, TOKEN_MAX = 60, 80, 24
AR = '[\u0600-\u06FF]'
SANDWICH = re.compile(AR + r'[^A-Za-z\u0600-\u06FF]*[A-Za-z][^\u0600-\u06FF]*' + AR)
ARROW = re.compile(r'^\s*[\w]+\s*-{1,2}(>>|\)|x|>)[+-]?\s*[\w]+\s*:')
KEYWORDS = {'subgraph', 'classDef', 'class', 'style', 'linkStyle', 'direction', 'click', 'end'}
SHAPES = r'(\[\(|\(\[|\(\(|\[\[|\{\{|\[|\(|\{)[^\[\]\(\)\{\}]*(\)\]|\]\)|\)\)|\]\]|\}\}|\]|\)|\})'


def blocks(path):
    lines = open(path, encoding='utf-8').read().split('\n')
    heading, i = '', 0
    while i < len(lines):
        if lines[i].startswith('#'):
            heading = lines[i].lstrip('# ').strip()
        if lines[i].strip().startswith('```mermaid'):
            j = i + 1
            while j < len(lines) and not lines[j].strip().startswith('```'):
                j += 1
            yield i + 1, heading, lines[i + 1:j]
            i = j
        i += 1


def flow_nodes(body):
    subs = {m.group(1) for x in body for m in [re.match(r'\s*subgraph\s+(\w+)', x)] if m}
    ids = set()
    for x in body[1:]:
        t = x.strip()
        if not t or t.split()[0] in KEYWORDS:
            continue
        t = re.sub(r'"[^"]*"', '""', t)
        t = re.sub(r'\|[^|]*\|', ' ', t)
        t = re.sub(SHAPES, ' ', t)
        t = re.sub(r'<?[-=.]{2,}>?|[&~;]', ' ', t)
        ids.update(re.findall(r'\b[A-Za-z_]\w*\b', t))
    return ids - subs - KEYWORDS - {'o', 'x'}


def flow_labels(body):
    text = '\n'.join(body[1:])
    labels = re.findall(r'[\[\(\{]"?([^\[\]\(\)\{\}\n"]+)"?[\]\)\}]', text)
    labels += re.findall(r'\|"?([^|\n"]+)"?\|', text)
    return labels


def check(path):
    out = []
    for n, text in enumerate(open(path, encoding='utf-8').read().split('\n'), 1):
        if HIDDEN.search(text):
            out.append(('H1', n, '', 'محرف اتجاه مخفي'))
    for line, heading, raw in blocks(path):
        body = [x for x in raw if x.strip()]
        code = [x for x in body if not x.strip().startswith('%%')]
        if not code:
            continue
        kind = code[0].split()[0]
        tag = heading.split('.')[0][:12]

        def add(rule, msg):
            out.append((rule, line, tag, msg))

        for x in body:
            if MARKS.search(x):
                add('H1', 'علامة اتجاه داخل المخطط')
        for x in code:
            if re.match(r'\s*(classDef|style|linkStyle)\b', x) or 'fill:' in x:
                add('C1', x.strip()[:60])
        if kind == 'sequenceDiagram':
            if body[0].strip() != WRAP:
                add('S1', 'سطر الالتفاف غائب')
            parts = [x for x in code if re.match(r'\s*(participant|actor)\s', x)]
            msgs = [x.split(':', 1)[1].strip() for x in code if ARROW.match(x)]
            notes = [x.split(':', 1)[1].strip() for x in code if re.match(r'\s*[Nn]ote\s', x) and ':' in x]
            if len(parts) > 6:
                add('S2', f'{len(parts)} مشاركين')
            if len(msgs) > 20:
                add('S3', f'{len(msgs)} رسالة')
            for m in msgs:
                if len(m) > MSG_MAX:
                    add('S4', f'{len(m)} حرفاً: {m[:50]}')
            for n in notes:
                if len(n) > NOTE_MAX:
                    add('S5', f'{len(n)} حرفاً: {n[:50]}')
            for t in msgs + notes:
                long = [w for w in re.split(r'\s+|<br\s*/?>', t) if len(w) > TOKEN_MAX]
                if long:
                    add('S6', long[0][:60])
                if SANDWICH.search(t):
                    add('B1', t[:60])
        elif kind in ('flowchart', 'graph'):
            n = len(flow_nodes(code))
            if n > 20:
                add('F1', f'{n} عقدة')
            for t in flow_labels(code):
                if SANDWICH.search(t):
                    add('B1', t[:60])
        elif kind == 'erDiagram':
            ents = set(re.findall(r'^\s*([\w-]+)\s*\{', '\n'.join(code), re.M))
            if len(ents) > 12:
                add('E1', f'{len(ents)} جدولاً')
    return out


def main():
    args = sys.argv[1:]
    listing = '--list' in args
    only = args[args.index('--only') + 1] if '--only' in args else ''
    files = sorted(glob.glob(os.path.join(PHASE, 'S1-*', 'DIAGRAMS.md')))
    files = [f for f in files if only in f]
    total = Counter()
    per = defaultdict(Counter)
    print('النظام  ' + '  '.join(f'{r:>4}' for r in RULES))
    for f in files:
        name = os.path.basename(os.path.dirname(f))[:5]
        found = check(f)
        for rule, line, tag, msg in found:
            per[name][rule] += 1
            total[rule] += 1
        print(f'{name}   ' + '  '.join(f'{per[name][r]:>4}' for r in RULES))
        if listing:
            for rule, line, tag, msg in found:
                print(f'    {rule}  سطر {line}  [{tag}]  {msg}')
    print('المجموع ' + '  '.join(f'{total[r]:>4}' for r in RULES))
    bad = sum(total.values())
    print('diagram-shape: OK' if not bad else f'diagram-shape: {bad} مخالفة')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
