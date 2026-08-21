#!/usr/bin/env python3
"""Confere, mecanicamente, o que a checklist do README afirma.

Roda sobre os arquivos de docs/cases/ e nada mais — não fala com o banco, não fala com o IFS,
não registra nada. É a metade da conferência que uma leitura não precisa fazer: concordância de
nomes entre registros vizinhos, e as regras de coerência que o motor aplica a cada leitura.

    cd docs/cases && python3 _registry/check.py

Saída: ERROS (o cadastro seria recusado, ou um campo desapareceria em silêncio) e AVISOS
(um termo registrado que nenhum caso cita — sem lastro, não um defeito).

O que ele NÃO pega, e por que:
  - se `address` aponta para um host real (é decisão de operação, ver README §Pendências 1);
  - se um `criterion` é uma reivindicação falsificável só (é leitura, não decisão de ferramenta);
  - se um `ttl` ou um `timeout` é o valor certo (ninguém mediu — README §Pendências 4);
  - se o limiar de re-inits está correto (README §Pendências 7).
"""
import json, glob, re, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
os.chdir(ROOT)

ENDINGS = ('ok', 'unavailable', 'denied', 'timeout')
METHODS = ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')
# src/src/investigation/evidence-collection-stage.ts:24 — o teto real de qualquer timeout declarado
COLLECTION_STAGE_BUDGET_MS = 7000
# src/src/glossary/terms.ts:81 — escritos pelo seed, antes de qualquer caso
NON_CONCLUSION = ('inconclusive-no-data', 'inconclusive-hypotheses-exhausted')

L = lambda p: json.load(open(p))
err, warn = [], []

st = {t['name'] for t in L('_glossary/subject-type.json')}
sa = {t['name'] for t in L('_glossary/subject-attribute.json')}
oc_reg = {t['name'] for t in L('_glossary/outcome.json')}
oc = oc_reg | set(NON_CONCLUSION)
ac = {t['name'] for t in L('_glossary/action.json')}
rc = {t['name'] for t in L('_glossary/recipient.json')}
con = {c['name']: c for c in L('_glossary/concept.json')}
caps = [L(p) for p in sorted(glob.glob('_registry/capabilities/*.json'))]
conns = {}
for p in sorted(glob.glob('_registry/connectors/*.json')):
    c = L(p)
    conns[c['connector']] = c['configuration']
cases = {os.path.basename(os.path.dirname(p)): L(p)
         for p in sorted(glob.glob('*/1.json'))}

for n, c in con.items():
    for a in c['accepts']:
        if a not in st:
            err.append(f'concept {n}: accepts "{a}" nao e subject-type registrado')
    if not isinstance(c.get('ttl'), int):
        err.append(f'concept {n}: ttl ausente ou nao-inteiro (nao existe valor padrao)')

by_concept = {}
for cap in caps:
    nm = cap.get('name')
    for f in ('name', 'version', 'nature', 'input_schema', 'output_schema',
              'timeout', 'connector', 'concept'):
        if not cap.get(f):
            err.append(f'capability {nm}: campo {f} vazio ou ausente')
    if cap.get('nature') != 'read-only':
        err.append(f'capability {nm}: nature != "read-only" (unico valor aceito)')
    if not isinstance(cap.get('timeout'), int):
        err.append(f'capability {nm}: timeout nao-inteiro')
    elif cap['timeout'] > COLLECTION_STAGE_BUDGET_MS:
        err.append(f'capability {nm}: timeout {cap["timeout"]} acima do teto '
                   f'{COLLECTION_STAGE_BUDGET_MS} da etapa de coleta — nunca sera honrado')
    if cap.get('concept') not in con:
        err.append(f'capability {nm}: concept "{cap.get("concept")}" nao registrado')
    by_concept.setdefault(cap.get('concept'), []).append(nm)
    if cap.get('connector') not in conns:
        err.append(f'capability {nm}: connector "{cap.get("connector")}" sem ConnectorConfiguration')
    try:
        props = set(json.loads(cap['output_schema'])['properties'])
    except Exception as e:
        err.append(f'capability {nm}: output_schema nao parseia ou nao tem "properties" ({e}) '
                   f'— toda citacao sobre este concept seria recusada')
        continue
    rmap = set(conns.get(cap.get('connector'), {}).get('responseMap', {}))
    if props - rmap:
        err.append(f'capability {nm}: properties sem caminho no responseMap '
                   f'-> {sorted(props - rmap)} (campo sempre ausente da observacao)')
for c, names in by_concept.items():
    if len(names) > 1:
        err.append(f'concept {c}: mais de uma capability responde por ele: {sorted(names)}')

for name, cfg in conns.items():
    for f in ('address', 'method', 'responseMap', 'statusMap'):
        if f not in cfg:
            err.append(f'connector {name}: falta {f}')
    if cfg.get('method') not in METHODS:
        err.append(f'connector {name}: method "{cfg.get("method")}" invalido')
    for s, e in cfg.get('statusMap', {}).items():
        if e not in ENDINGS:
            err.append(f'connector {name}: status {s} -> "{e}" nao e um dos quatro desfechos')
    for ph in re.findall(r'\$\{([^}]*)\}', json.dumps(cfg)):
        kind, _, arg = ph.partition(':')
        if kind == 'subject':
            if arg not in sa:
                err.append(f'connector {name}: ${{subject:{arg}}} nao e subject-attribute registrado')
        elif kind in ('requester',):
            pass
        elif kind == 'credential':
            if not arg:
                err.append(f'connector {name}: ${{credential:}} sem nome de variavel')
        else:
            err.append(f'connector {name}: placeholder "{ph}" de tipo desconhecido')
    declared = set()
    for cap in caps:
        if cap.get('connector') == name:
            try:
                declared |= set(json.loads(cap['output_schema'])['properties'])
            except Exception:
                pass
    extra = set(cfg.get('responseMap', {})) - declared
    if extra:
        err.append(f'connector {name}: responseMap declara {sorted(extra)}, que nenhuma '
                   f'capability deste connector tem em properties — filtrado em silencio')

used_oc, used_ac, used_rc, used_con = set(), set(), set(), set()
for d, c in cases.items():
    if c.get('slug') != d:
        err.append(f'{d}: slug "{c.get("slug")}" difere do nome do diretorio')
    if c.get('subject') not in st:
        err.append(f'{d}: subject "{c.get("subject")}" nao e subject-type registrado')
    if c.get('consolidation_register') not in ('formal', 'plain', None):
        err.append(f'{d}: consolidation_register invalido')
    if c.get('state') not in ('draft', 'released'):
        err.append(f'{d}: state deve ser "draft" ou "released"')
    if c.get('state') == 'released' and 'released_at' not in c:
        err.append(f'{d}: released sem released_at')
    if c.get('state') == 'draft' and 'released_at' in c:
        err.append(f'{d}: draft com released_at')
    if 'hypotheses' in c:
        err.append(f'{d}: usa o array "hypotheses" (forma retirada) — o parser le "manifest"')
    manifest = c.get('manifest')
    if not manifest:
        err.append(f'{d}: manifest ausente ou vazio (um caso sem hipotese nao investiga nada)')
        continue
    pos = [e.get('position') for e in manifest]
    nms = [e.get('hypothesis_name') for e in manifest]
    if len(set(pos)) != len(pos):
        err.append(f'{d}: position repetida entre entradas do manifest')
    if len(set(nms)) != len(nms):
        err.append(f'{d}: hypothesis_name repetido')
    if pos != sorted(pos):
        err.append(f'{d}: lista do manifest fora da ordem de position')
    resolutions = []
    for e in manifest:
        h = e.get('hypothesis_name')
        if not isinstance(e.get('revision'), int):
            err.append(f'{d}/{h}: revision ausente ou nao-inteira')
        if not e.get('criterion'):
            err.append(f'{d}/{h}: criterion vazio')
        if not e.get('collects'):
            err.append(f'{d}/{h}: collects vazio')
        for cn in e.get('collects', []):
            if cn not in con:
                err.append(f'{d}/{h}: collects "{cn}" nao registrado no glossario')
            elif c.get('subject') not in con[cn]['accepts']:
                err.append(f'{d}/{h}: concept "{cn}" nao aceita subject "{c.get("subject")}"')
            elif cn not in by_concept:
                err.append(f'{d}/{h}: concept "{cn}" sem capability read-only')
            used_con.add(cn)
        r = e.get('resolution') or {}
        ref = r.get('referral') or {}
        if r.get('outcome') not in oc:
            err.append(f'{d}/{h}: outcome "{r.get("outcome")}" nao registrado')
        if ref.get('action') not in ac:
            err.append(f'{d}/{h}: action "{ref.get("action")}" nao registrada')
        if ref.get('recipient') not in rc:
            err.append(f'{d}/{h}: recipient "{ref.get("recipient")}" nao registrado')
        used_oc.add(r.get('outcome')); used_ac.add(ref.get('action')); used_rc.add(ref.get('recipient'))
        resolutions.append((r.get('outcome'), ref.get('action'), ref.get('recipient')))
    fb = c.get('fallback') or {}
    fref = fb.get('referral') or {}
    if fb.get('outcome') not in NON_CONCLUSION:
        err.append(f'{d}: fallback outcome "{fb.get("outcome")}" nao e de nao-conclusao')
    if fref.get('action') not in ac:
        err.append(f'{d}: fallback action nao registrada')
    if fref.get('recipient') not in rc:
        err.append(f'{d}: fallback recipient nao registrado')
    used_ac.add(fref.get('action')); used_rc.add(fref.get('recipient'))
    if (fb.get('outcome'), fref.get('action'), fref.get('recipient')) in resolutions:
        err.append(f'{d}: fallback identico a resolucao de uma hipotese — esconderia qual confirmou')

for label, reg, used in (('outcome', oc_reg, used_oc), ('action', ac, used_ac),
                         ('recipient', rc, used_rc), ('concept', set(con), used_con)):
    if reg - used:
        warn.append(f'{label} registrado e nao citado por nenhum caso: {sorted(reg - used)}')
for a in sa:
    if not any(f'${{subject:{a}}}' in json.dumps(cfg) for cfg in conns.values()):
        warn.append(f'subject-attribute registrado e nao usado por nenhum connector: {a}')
for t in st:
    if not any(c.get('subject') == t for c in cases.values()):
        warn.append(f'subject-type registrado e nao usado por nenhum caso: {t}')

print(f'{len(cases)} casos, {len(con)} concepts, {len(caps)} capabilities, {len(conns)} connectors')
print(f'ERROS: {len(err)}')
for e in err:
    print('  x', e)
print(f'AVISOS: {len(warn)}')
for w in warn:
    print('  !', w)
sys.exit(1 if err else 0)
