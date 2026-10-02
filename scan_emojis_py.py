import os
def has_emoji(s):
    return any(0x1F600 <= ord(c) <= 0x1F64F or 0x1F300 <= ord(c) <= 0x1F5FF or 0x1F680 <= ord(c) <= 0x1F6FF for c in s)

for root, _, files in os.walk('backend'):
    for f in files:
        if f.endswith('.py'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                lines = file.readlines()
                for i, line in enumerate(lines):
                    if has_emoji(line):
                        print(f"{path}:{i+1}: {line.strip()}")
