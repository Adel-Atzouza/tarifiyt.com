import re
from unidecode import unidecode

mapping_table_to_tifinaɣ = str.maketrans({
    'ɛ': 'ⵄ',
    'â': 'ⴰⴰ',
    'a': 'ⴰ',
    'b': 'ⴱ',
    'ḇ': 'ⴲ',
    'c': 'ⵞ',
    'č': 'ⵞ',
    'd': 'ⴷ',
    'ḏ': 'ⴸ',
    'ḍ': 'ⴹ',
    # 'ḍ̱': 'ⴺ',
    'e': 'ⴻ',
    'f': 'ⴼ',
    'g': 'ⴳ',
    'ḡ': 'ⴴ',
    'ǧ': 'ⴵ',
    'h': 'ⵀ',
    'ḥ': 'ⵃ',
    'i': 'ⵉ',
    'j': 'ⵊ',
    'k': 'ⴽ',
    'ḵ': 'ⴿ',
    'l': 'ⵍ',
    'm': 'ⵎ',
    'n': 'ⵏ',
    'o': 'ⵓ',
    'p': 'ⵒ',
    'q': 'ⵇ',
    'r': 'ⵔ',
    'ṛ': 'ⵕ',
    'ɣ': 'ⵖ',
    's': 'ⵙ',
    'ṣ': 'ⵚ',
    't': 'ⵜ',
    'ṭ': 'ⵟ',
    'ṯ': 'ⵝ',
    'u': 'ⵓ',
    'v': 'ⵠ',
    'w': 'ⵡ',
    'ʷ': 'ⵯ',
    'x': 'ⵅ',
    'y': 'ⵢ',
    'z': 'ⵣ',
    'ẓ': 'ⵥ'
})


def to_tifinaɣ(text: str) -> str:
    if not type(text) is str: raise TypeError(text, "should be a strings.")
    return text.lower().translate(mapping_table_to_tifinaɣ)


def generate_breadcrumb(path: str) -> list:
    '''Generates list of sub-paths from a path.'''
    if not type(path) is str: raise TypeError(path, "should be a strings.")
    paths = []

    sub_paths = [i for i in path.split('/') if i != '']
    for i in range(len(sub_paths), 0, -1):
        paths.append([sub_paths[i-1], '/'.join(sub_paths[:i])])

    paths.reverse()
    return paths


def get_abrv(definition):
    replaced = re.split('(\|\||Syn\.|v→|Mod\.|Var\.)', definition)
    replaced_2 = [index for (index, item) in enumerate(replaced) if item == "Syn."]

    rebuild = ''
    skip = []

    for ind, value in enumerate(replaced):
        if ind in skip: continue
            
        if value == 'Syn.':
            rebuild += value + '<i>' + replaced[ind+1] + '</i>'
            skip.append(ind+1)
        else: rebuild += value

    
    list_of_synonyms = map(lambda y: y.split(','), [item for (index, item) in enumerate(replaced) if index in map(lambda x: x+1, replaced_2)])
    return list_of_synonyms, rebuild


def text_equalizer(text: str) -> str:
    if not type(text) is str: raise TypeError(text, "should be a strings.")
    return unidecode(text.replace('ɛ', '@').replace('ɣ', '$'))


abbreviations = {
    "1, 2, 3,…" : ["modèles de conjugaison", "conjugation models"],
    "A.Yeṭṭ." : ["Ayt Yeṭṭefṯ", "Ayt Yeṭṭefṯ"],
    "A. Wery." : ["Ayṯ Weryaɣel", "Ayṯ Weryaɣel"],
    "adj." : ["adjectif", "adjective"],
    "adv." : ["adverbe", "adverb"],
    "agri." : ["Agriculture", "Agriculture"],
    "anat." : ["Anatomie", "Anatomy"],
    "ant." : ["antonyme", "antonym"],
    "aphor." : ["Aphorisme", "Aphorism"],
    "aram." : ["araméen", "Aramaic"],
    "Barb." : ["barbarisme", "Barbarism"],
    "Ḇeṭṭ." : ["Ḇeṭṭiwa", "Ḇeṭṭiwa"],
    "biol." : ["biologie", "Biology"],
    "bot." : ["botanique", "Botany"],
    "c.d." : ["complément direct", "direct object complement"],
    "c.i." : ["complément indirect", "indirect object complement"],
    "COD" : ["complément d’objet direct", "direct object complement"],
    "COI" : ["complément d’objet indirect", "indirect object complement"],
    "c. prépos." : ["complément prépositionnel", "prepositional complement"],
    "CP" : ["complément prépositionnel", "prepositional complement"],
    "coll." : ["collectif", "collective"],
    "conj." : ["conjonction", "conjunction"],
    "conju. mod." : ["conjugaison mode", "conjugation mode"],
    "compl." : ["Complainte", "Complaint"],
    "dev." : ["devinette", "riddle"],
    "dim." : ["diminutif", "diminutive"],
    "div." : ["divers", "various"],
    "ea." : ["état d’annexion.", "state of annexation"],
    "écono." : ["économie", "economics"],
    "Egy." : ["Egyptien", "Egyptian"],
    "emph." : ["Emphatique, cela concerne la 1re syllabe des adj., allongement de la voyelle", "emphatic, concerns the 1st syllable of adjectives, vowel lengthening"],
    "énumér." : ["énumération", "enumeration"],
    "ent." : ["entomologie", "entomology"],
    "épigr." : ["épigramme", "epigram"],
    "esp." : ["espagnol", "Spanish"],
    "expr." : ["expression", "expression"],
    "f. partic." : ["forme participiale", "participle form"],
    "fam." : ["familier", "informal"],
    "fém." : ["féminin", "feminine"],
    "fig." : ["figuré", "figurative"],
    "form. l’Inacc." : ["Forme de l’inaccompli", "Form of the incomplete"],
    "Fr." : ["français", "French"],
    "géo." : ["géographie", "geography"],
    "G.N." : ["groupe nominal", "nominal group"],
    "ibeqq." : ["Ibequyen", "Ibequyen"],
    "icht." : ["ichtyologie", "ichthyology"],
    "inform." : ["Informatique", "informatics"],
    "int." : ["intensif", "intensive"],
    "interj." : ["interjection", "interjection"],
    "intr." : ["intransitif", "intransitive"],
    "Inv." : ["invariable", "invariable"],
    "Iqerε." : ["Iqerεiyn", "Iqerεiyn"],
    "Izn." : ["Iznasn", "Iznasn"],
    "lat." : ["latin", "Latin"],
    "litt." : ["littéralement", "literally"],
    "loc." : ["adv locution adverbiale", "adverbial phrase"],
    "m." : ["masculin", "masculine"],
    "math." : ["mathématique", "mathematics"],
    "max." : ["la maxime", "the maxim"],
    "méd." : ["médecine", "medicine"],
    "Mod." : ["Modèle de conjugaison", "Conjugation model"],
    "n." : ["nom.", "noun"],
    "nég." : ["négation", "negation"],
    "néo." : ["néologisme", "neologism"],
    "onoma." : ["onomatopée", "onomatopoeia"],
    "ordi." : ["ordinal", "ordinal"],
    "orn." : ["ornithologie", "ornithology"],
    "paléogr." : ["paléographie", "paleography"],
    "pané." : ["panégyrique", "panegyric"],
    "Parti. interro." : ["particule interrogative", "interrogative particle"],
    "péj." : ["péjoratif", "pejorative"],
    "pers." : ["personnel", "personal"],
    "philol." : ["philologie", "philology"],
    "phys." : ["physique", "physics"],
    "pl." : ["pluriel", "plural"],
    "pop." : ["populaire", "popular"],
    "préf." : ["préfixe", "prefix"],
    "prép." : ["préposition", "preposition"],
    "prés." : ["présentatif", "presentative"],
    "pron." : ["pronom.", "pronoun"],
    "pron. rel." : ["pronom relatif", "relative pronoun"],
    "pron. indéf." : ["pronom indéfini", "indefinite pronoun"],
    "prov." : ["Proverbe", "Proverb"],
    "S" : ["sujet", "subject"],
    "Semi-auxil." : ["semi-auxiliaire", "semi-auxiliary"],
    "sing." : ["singulier", "singular"]
}



def search_in(query: str, data: dict):
    if not type(query) is str: raise TypeError(query, "should be a strings.")
    if not type(data) is dict: raise TypeError(data, "should be a dictionary.")

    keys = data.keys()
    keys_copy = map(text_equalizer, keys)


from deep_translator import GoogleTranslator
def translate(text: str):
    if not type(text) is str: raise TypeError(text, "should be a strings.")
    return GoogleTranslator(source='fr', target='en').translate(text)

import json
# Use any translator you like, in this example GoogleTranslator
if __name__ == '__main__':
    # print(generate_breadcrumb('hi/hidhdi/hidjid/idic'))


    with open("data/dictionaries/amawal_n_taweryaɣelt.json", 'r', encoding='utf8') as file:
        data = json.load(file)
        # translated =   # output -> Weiter so, du bist großartig
        # print(translated)
    # print(unidecode('ɣḵṭṯ+@$'))





# not my code

from difflib import SequenceMatcher
from heapq import nlargest as _nlargest

def get_close_matches_indexes(word, possibilities, n=3, cutoff=0.6):
    """Use SequenceMatcher to return a list of the indexes of the best 
    "good enough" matches. word is a sequence for which close matches 
    are desired (typically a string).
    possibilities is a list of sequences against which to match word
    (typically a list of strings).
    Optional arg n (default 3) is the maximum number of close matches to
    return.  n must be > 0.
    Optional arg cutoff (default 0.6) is a float in [0, 1].  Possibilities
    that don't score at least that similar to word are ignored.
    """

    if not n >  0:
        raise ValueError("n must be > 0: %r" % (n,))
    if not 0.0 <= cutoff <= 1.0:
        raise ValueError("cutoff must be in [0.0, 1.0]: %r" % (cutoff,))
    result = []
    s = SequenceMatcher()
    s.set_seq2(word)
    for idx, x in enumerate(possibilities):
        s.set_seq1(x)
        if s.real_quick_ratio() >= cutoff and \
           s.quick_ratio() >= cutoff and \
           s.ratio() >= cutoff:
            result.append((s.ratio(), idx))

    # Move the best scorers to head of list
    result = _nlargest(n, result)

    # Strip scores for the best n matches
    return [x for score, x in result]
