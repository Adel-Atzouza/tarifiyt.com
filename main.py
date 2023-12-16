import json

dictionary = {}
d2 = {}

with open('ayt weryaɣel.json', 'r', encoding='utf8') as file:
    dictionary = json.load(file)

    for i in dictionary:
        d2[i.replace('(', '( ').replace(')', ') ').replace('  ', ' ').replace('  ', ' ').replace(' 10', '10').replace('10', ' 10')] = dictionary[i]
    
with open('a.json', 'w', encoding='utf8') as file:
    json.dump(d2, file, ensure_ascii=False, indent=4)