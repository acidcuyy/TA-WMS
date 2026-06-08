import os
import re

css_dir = r"c:\Users\keina\OneDrive\Documents\tugas all\TA\TA-WMS\frontend\src\pages"
pattern = re.compile(r'\.([a-zA-Z0-9_-]+__table)\s*th\s*\{')

for root, _, files in os.walk(css_dir):
    for f in files:
        if f.endswith('.css'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Find all unique table classes that have 'th' selectors
            matches = pattern.finditer(content)
            updated = False
            for match in matches:
                table_class = match.group(1)
                decl_pattern = re.compile(r'\.' + table_class + r'\s*\{')
                if not decl_pattern.search(content):
                    replacement = f".{table_class} {{\n  width: 100%;\n  border-collapse: collapse;\n}}\n\n.{table_class} th {{"
                    content = content.replace(f".{table_class} th {{", replacement)
                    updated = True
            
            if updated:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f"Updated {f}")
