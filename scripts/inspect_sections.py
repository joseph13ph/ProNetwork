from docx import Document
from pathlib import Path

p = Path(r'c:\Users\AQuilezZ\OneDrive - Universidad Simón Bolívar\Documentos\7 semestre\TECNOLOGÍAS WEB\corte 3\web\proconnect\INFORME DE PRUEBAS DE SOFTWARE.docx')
doc = Document(str(p))
for i, para in enumerate(doc.paragraphs):
    t = para.text.strip()
    if t.startswith('4.') or t.startswith('6.') or 'PLAN DE PRUEBAS' in t or 'RESULTADOS DE LAS PRUEBAS' in t:
        print(f'P{i}: {t}')
