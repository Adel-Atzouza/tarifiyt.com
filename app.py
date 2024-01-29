from flask import Flask, render_template, request, session, jsonify
import extra, json, difflib, re, string
from markupsafe import Markup


app = Flask(__name__)
app.secret_key = b'_5#y2Ldccd"dcdcF4Q8dcdcz\n\xec]zfrgb543/'

@app.route('/Amawal-n-Taweryaɣelt/')
def amawal_n_tawaryaɣelt():
    # defines variables to pass to the tempalte
    var = {
        'path': extra.generate_breadcrumb(path=request.path)
    }

    # deletes previous variables from session and assign the current one to the session
    if 'var' in session: session.pop('var', None)
    session['var'] = var

    return render_template('Amawal n Taweryaɣelt.html', var=var)

amawal_n_tawaryaɣelt_data = {}
@app.route('/Amawal-n-Taweryaɣelt/', methods=['POST'])
def amawal_n_tawaryaɣelt_post():
    global amawal_n_tawaryaɣelt_data
    # load previous variables passed to the template
    var = session.get('var')
    var['abbrevations'] = extra.abbreviations

    # loads dictionary if it hasn't already
    if len(amawal_n_tawaryaɣelt_data) == 0:
        with open('data/dictionaries/amawal_n_taweryaɣelt.json', 'r', encoding='utf8') as file:
            amawal_n_tawaryaɣelt_data = json.load(file)

    query = request.form['search'].lower()
    print(query)

    # var['related_results'] = [[key, amawal_n_tawaryaɣelt_data[key]] for key in amawal_n_tawaryaɣelt_data if query in key]
    # main_result = difflib.get_close_matches(query, [i[0].lower() for i in var['related_results']], n=1, cutoff=0.1)
    res_15 = difflib.get_close_matches(query, [i for i in amawal_n_tawaryaɣelt_data], n=15, cutoff=0.1)
    print(res_15)

    if len(res_15) == 0:
        main_result = []
    else:
        main_result = res_15[0]
        var['related_results'] = res_15[1:]

    if len(main_result) != 0:
        var['main_result'] = [main_result, amawal_n_tawaryaɣelt_data[main_result]]
        var['main_result'][0] = [main_result.capitalize(), extra.to_tifinaɣ(main_result)]


        synonyms, rebuild = extra.get_abrv(definition=var['main_result'][1])
        var['main_result_syn'] = []

        for i in synonyms: var['main_result_syn'] += i

        var['main_result'][1] = Markup(rebuild)
        var['translate'] = Markup(extra.translate(rebuild))

    return render_template('Amawal n Taweryaɣelt.html', var=var)

wiktionary_data = []
@app.route('/wiktionary.html/<word>/')
def wiktionary(word):
    global wiktionary_data

    if len(wiktionary_data) == 0:
        with open('data/dictionaries/kaikki.org-dictionary-Tarifit.json', 'r', encoding='utf8') as file:
            wiktionary_data = json.load(file)

    for item in wiktionary_data:
        if item['word'].lower() == word.lower():
            return render_template('wiktionary.html', word=item)
    return render_template('wiktionary.html')

@app.route('/get_suggestions_wiktionary/')
def get_suggestions_wiktionary():
    global wiktionary_data

    if len(wiktionary_data) == 0:
        with open('data/dictionaries/kaikki.org-dictionary-Tarifit.json', 'r', encoding='utf8') as file:
            wiktionary_data = json.load(file)

    query = request.args.get('query', '')

    # Filter suggestions based on the query
    suggestions = [word['word'] for word in wiktionary_data if query.lower() in word['word'].lower()]
    for word in wiktionary_data:
        for w in word['senses'][0]['glosses']:
            if query.lower() in w.lower():
                suggestions += [word['word']]

    # Return suggestions as JSON
    return jsonify({'suggestions': suggestions})


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<html>/')
def any_html(html):
    return render_template(html)

@app.route("/<page>/<var>/")
def any_html2(page, var):
    print(page, var)
    return render_template(f'{page}/{var}')

@app.route("/<page>/<var>/<var2>/")
def any_html3(page, var, var2):
    return render_template(f'{page}/{var}/{var2}')

# @app.route('/figuig.html/')
# def figuig():
#     return render_template('figuig.html')

# @app.route('/figuig/tinfusin.html/')
# def figuig_tinfusin():
#     return render_template('figuig/tinfusin.html')

# @app.route('/figuig/tinfusin/<story>/')
# def figuig_tinfusin_stories(story):
#     return render_template(f'figuig/tinfusin/{story}')


if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')





# to do
# Mod. to table
# Combine words
# extract voir
# fix search results
# abrevation list
# make results a table or grid


