# import json

# with open('data/stories/stories.html.json', encoding='utf8') as f:
#     stories = json.load(f)

#     for c, i in enumerate(stories):
#         s = i['story']
#         title = i['title']
#         file = """<!DOCTYPE html>
#             <html>
#             <head>
#                 <meta charset="utf-8">
#                 <meta name="viewport" content="width=device-width, initial-scale=1">
#                 <title>Tarifiyt.com</title>

#                 <script defer src="https://use.fontawesome.com/releases/v5.3.1/js/all.js"></script>
#                 <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js"></script>
#                 <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
#                 <script src="https://cdn.tailwindcss.com"></script>
#                 <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous"></script>
#                 <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">

#                 <style>
#                     #story {
#                         --s: 30px; /* the size on the corner */
#                         --t: 7px;  /* the thickness of the border */
#                         --g: 20px; /* the gap between the border and image */
#                         --r: 5px;
                        
#                         padding: calc(var(--g) + var(--t));
#                         outline: var(--t) solid #000000; /* the color here */
#                         outline-offset: calc(-1*var(--t));
#                         border-radius: var(--r);
#                         -webkit-mask:
#                             conic-gradient(at var(--s) var(--s),#0000 75%,#000 0)
#                             0 0/calc(100% - var(--s)) calc(100% - var(--s)),
#                             linear-gradient(#000 0 0) content-box;
#                     }
#                 </style>

#             </head>
#             <body>

#                 <nav class="navbar" style="margin: 4px;" role="navigation" aria-label="main navigation">
#                     <div class="navbar-brand">
#                         <a class="navbar-item" href="https://tarifiyt.com"><img src="/static/images/logo.png" alt="Tarifiyt.com: Mani tt-munen Imaziɣen d iḥuriyen"></a>
#                     </div>
#                 </nav>



#             <section class="section">
#                 <div class="container">
#                     <h1 class="title">Tinfusin n Figuig</h1>

#                     <nav class="breadcrumb" aria-label="breadcrumbs">
#                         <ul>
#                             <li><a href="https://tarifiyt.com">
#                                 <span class="icon">
#                                     <i class="fas fa-home"></i>
#                                 </span>
#                                 Tarifiyt.com</a></li>
#                             <li><a href="/figuig.html">Figuig</a></li>
#                             <li><a href="/figuig/tinfusin.html">Tinfusin</a></li>
#                             <li class="is-active"><a id="story-title2" href="#" aria-current="page">""" + title.split('<')[0] + """</a></li>
#                         </ul>
#                     </nav>


#                     <div style="background-color: rgb(249, 243, 243); border-radius: 20px;">
#                         <div class="text-center max-w-3xl mx-auto p-4" style="font-family: sans-serif;">
#                             <h2 class="title is-4 pb-4" id="story-title">""" + title + """</h2>
#                             <p class="subtitle" id="story">""" + s + """
#                             </p>
#                         </div>
#                     </div>
#                 </div>
#             </section>

#                 <script src="https://code.jquery.com/jquery-3.7.0.min.js" integrity="sha256-2Pmvv0kuTBOenSvLm6bvfBSSHrUJ+3A7x6P5Ebd07/g=" crossorigin="anonymous"></script>
#                 <script>
#                     $(function () {
#                         $('[data-toggle="tooltip"]').tooltip({html:true})
#                     })    
#                 </script>
#             </body>  
#             </html>"""
        
#         with open('figuig/tinfusin/' + str(c+1) + '. ' + title.replace('<sup>', ' ').replace('</sup>', '  ') + '.html', 'w+', encoding='utf8') as f:
#             f.write(file)
x = 'figuig/tinfusin/1. Uccen d yinsi ikerrazen.html figuig/tinfusin/2. Tacerza n wuccen d yinsi.html figuig/tinfusin/3. Tuceṛḍa n wuccen d yinsi.html figuig/tinfusin/4. Uccen, insi d uyṛaḍ.html figuig/tinfusin/5. Ikεeb d wuccen.html figuig/tinfusin/6. Aɣerda d tɣerdayt.html figuig/tinfusin/7. Taɣerdayt tajellitt.html figuig/tinfusin/8. At ukeṛkeṛ.html figuig/tinfusin/9. Awessar d imendi.html figuig/tinfusin/10. Tayujilt.html figuig/tinfusin/11. Ayujil.html figuig/tinfusin/12. Timefṛeṭṭ n yiɣed.html figuig/tinfusin/13. Aṛḍel d Uzgen n Uṛḍel.html figuig/tinfusin/14. Tayemlult d Yemlul.html figuig/tinfusin/15. Tanfust n uɣatir.html figuig/tinfusin/16. Qefqaf, Zefzaf, Ḥefḥaf, Tzizwett.html figuig/tinfusin/17. Aman n jaṛ iɣanimen.html figuig/tinfusin/18. Tanfust n umẓa.html figuig/tinfusin/19. Lunja 6  .html figuig/tinfusin/20. Lila d Ɛmeṛ.html figuig/tinfusin/21. Ɛica Hengaḷa.html figuig/tinfusin/22. Yenṣiṣ.html figuig/tinfusin/23. Taslit d temɣaṛt.html figuig/tinfusin/24. Taḍekkʷalt d temɣaṛt.html figuig/tinfusin/25. Taslit d teẓyeṭṭ.html figuig/tinfusin/26. Tameṭṭut itcen mmis.html figuig/tinfusin/27. Tajenneyt ittaṛwen.html figuig/tinfusin/28. Knuz 17  .html figuig/tinfusin/29. Uṛeɣ n Vvu.html figuig/tinfusin/30. Taslit n Wuday.html'.replace('figuig/tinfusin/', '').split('.html ')

for c, i in enumerate(x):
    print(f"<div class='list-item'><div class='list-item-title'>{c+1}. <a href='/figuig/tinfusin/{i}.html'>{i.split('. ')[1].replace('  ', '</sup>').replace(' ', '<sup>')}</a></div></div>")