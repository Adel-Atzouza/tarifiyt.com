/*
 * Projet : CAIRN-PLUS
 *
 * Description :
 * Fonctions spécifique aux textes de la page article
 *
 */
(function($) {
    "use strict";

    // Ajoute les liens autour des auteurs dans l'onglet auteurs
    // On le fait du côté javascript parce que c'est plus simple et le plus sûr
    $.fn.articleAuteurs = function(selectorLinksAuthors) {
        var self = this;
        if (!self || !self.length) return;
        var liminaireAuthors = $(selectorLinksAuthors);
        if (!liminaireAuthors.length) return;
        self.each(function(index, textAuthor) {
            textAuthor = $(textAuthor);
            var liminaireAuthor = liminaireAuthors[index];
            if (!liminaireAuthor) return;
            liminaireAuthor = $(liminaireAuthor);
            // Ajout du bouton d'ajout à la liste des auteurs suivis
            var followBtn = liminaireAuthor.children(".btn-following").clone();
            followBtn.insertAfter(textAuthor);
            followBtn.show();

            // Ajout d'un lien vers la page de l'auteur, entourant le nom de l'auteur
            var linkAuthor = liminaireAuthor.children(".lien-auteur").clone();
            linkAuthor.html('');
            $(textAuthor).wrap(linkAuthor);

            // Récupération des auteurs
            var typeAuthor = $('#panel-auteurs').find(".typeaut-auteur");

            // Récuparation des traducteurs
            var typeTranslator = $('#panel-auteurs').find(".typeaut-traducteur");

            if(window.IS_CAIRN_INT) {
                var linkAuthorBtn = '<a class=\"btn btn-default btn-link-author\" href=\"'+linkAuthor.attr('href')+'\"><span class="name">See all articles</span></a>';
            } else {
                var linkAuthorBtn = '<a class=\"btn btn-default btn-link-author\" href=\"'+linkAuthor.attr('href')+'\"><span class="name">Voir toutes ses publications</span></a>';
            }

            $("#auteurs .publication-article-auteur div").first().appendTo(typeAuthor[index]);
        });
        $("#auteurs div.publication-article-auteur").remove();

        // #133894 - Non-affichage des boutons 'Suivre cet auteur'
        if (window.IS_CAIRN_INT || window.IS_CAIRN_MUNDO ) { $("#auteurs .btn-following").remove(); }

        ajax.refreshNotificationPlugins();
    }

    // Insère une lettrine dans le corps d'un texte
    $.fn.articleLettrine = function() {
        var self = this;
        if (!self || !self.length) return;
        recInsertLettrine(self.find('.corps > .section > .para').get(0));
        return self;
    }


    // Ajoute le texte des notes comme amorce dans les renvois
    $.fn.articleAmorce = function() {
        var self = this;
        if (!self || !self.length) return;
        var notes = {};
        var maxLengthText = 16 * 4;  // n chars par ligne, et m lignes
        self.find('.note').each(function(index, note) {
            note = $(note);
            var text = note.find('.wrapper-note').text().trim();
            // On ajoute des points de suspensions si l'amorce est trop longue
            text = text.replace(/\s/, ' ');
            if (text.length > maxLengthText) {
                text = text.substr(0, maxLengthText);
                // On évite la coupure en plein milieu d'un mot
                var lastIndexOf = text.lastIndexOf(' ');
                if (lastIndexOf > 0) {
                    text = text.substr(0, lastIndexOf);
                }
                text += '…';
            }
            // On échappe le texte, dans le cas où il y a un chevron
            text = text.replace(/</, '&lt;').replace(/>/, '&gt;')
            notes['#' + note.attr('id')] = {
                no: note.find('.no').text().trim(),
                text: text,
            };
        });
        var corpsOffsetLeft = $('#article').offset().left;
        // Le décalage normal des amorces par rapport au texte
        // Il faudrait calculer ça proprement plutôt que d'avoir une valeur en dur.
        var normalShiftAmorce = -43;
        self.find('.renvoi').each(function(index, renvoi) {
            renvoi = $(renvoi);
            if (renvoi.parents('.panneau').length) return;
            var note = notes[renvoi.attr('href')];
            if (note === undefined) return;
            var amorce = $('<a href="' + renvoi.attr('href') + '" class="amorce amorce-renvoi"><span class="no">' + note.no + "</span>" + note.text + '<span>');
            amorce.insertAfter(renvoi);
            // Si le décalage de l'amorce est au dessus du texte, alors on l'aligne correctement
            // TODO: le code ci-dessous est temporairement désactivé, en attendant que la page article
            // devienne stable.
            // var amorceOffset = amorce.offset();
            // var amorceWidth = amorce.width();
            // var shiftAmorce = (amorceOffset.left  + amorceWidth) - corpsOffsetLeft;
            // if (shiftAmorce > 0) {
            //     amorce.offset({
            //         top: amorceOffset.top,
            //         left: amorceOffset.left + (-shiftAmorce + normalShiftAmorce),
            //     })
            // }
            // Fin du calcul de décalage
        });
    }

    // Les comptes rendus ont un niveau de section diminué de 1
    $.fn.articleCompteRendu = function() {
        var self = this;
        self.find('.section').each(function(index, section) {
            section = $(section);
            var matchObj = section.attr('class').match(/section(\d)/);
            if (!matchObj) return;
            section.removeClass(matchObj[0]);
            section.addClass("section" + (Number(matchObj[1]) + 1));
        });
    }

    // Les figures se déplacent sur le côté, comme les amorces
    $.fn.articleFigures = function() {
        this.each(function(index, figure) {
            figure = $(figure);
            if (figure.hasClass('contexte-ligne')) return;
            if (figure.parents().hasClass('amorce')) return;
            figure.addClass('amorce');
        });
    }


    // Les opérations sur les images
    // Principalement utilisée pour mettre en place le caroussel
    $.fn.articleImages = function(idModal) {
        var modal = $(idModal);
        var caroussel = null;
        var items = [];
        // Chaque image est dans un objetmedia, lui-même dans une balise ancêtre (figure, para,etc.).
        // Les images dans une balise sont regroupées dans la visionneuse.
        // Par conséquent, on a besoin de calculer le nombre de ces ancètres pour afficher ou non
        // les flèches de défilements.
        var imagesAncestors = [];
        this.filter(function(index, image) {
            var $image = $(image);
            if ($image.css('display') === 'inline') return false;
            // if ($image.parent().hasClass('flot-ligne')) return false;
            return true;
        }).each(function(index, image) {
            image = $(image);

            // Attribution d'un identifiant unique pour le parent et enregistrement de cet id
            // Cela permet de détecter le nombre d'élément unique porteur d'image pour afficher
            // ou non les contrôles de la visionneuse
            var imageAncestor = image.parent().parent();
            if (!imageAncestor.attr('id')) {
                imageAncestor.attr('id', image.attr('id') + '-parent-' + cairn.generateID());
            }
            imagesAncestors.push(imageAncestor.attr('id'));

            var div = $('<div></div>');
            div.hide();
            div.attr('id', 'fancybox-' + image.attr('id'));
            var panneau = image.parents('.panneau').first();
            if (panneau.length) {
                div.append(panneau.clone().removeClass('amorce'));
            } else {
                div.append(image.parents('.objetmedia').clone());
            }
            var tete = div.find('.tete');
            var pied = div.find('.pied');
            if (!tete.find('.titre')) {
                tete.append(pied.find('.titre').first());
            }
            tete.removeClass('tete').addClass('container').wrap('<div class="tete row"><div class="col-sm-12"></div></div>');
            pied.removeClass('pied').addClass('container').wrap('<div class="pied row"><div class="col-sm-12"></div></div>');

            items.push({
                src: div.html(),
            });
            image.css('cursor', 'pointer').click(function(ev) {
                modal.magnificPopup('open');
                modal.magnificPopup('goTo', index);
            });
        });
        var magnificPopupOptions = {
            items: items,
            gallery: {
                enabled: true,
                navigateByImgClick: false,
                preload: 3,
            },
            type: 'inline',
        };
        // S'il n'y a qu'une seule image, ne pas afficher les flèches
        if ($.unique(imagesAncestors).length < 2) {
            magnificPopupOptions.gallery.arrowMarkup = '';
        }
        modal.magnificPopup(magnificPopupOptions);
    }

    // Affiche "Sur un sujet proche"
    var $$hasAskedSurUnSujetProche = false;
    $.fn.articleSurUnSujetProche = function(panelId, idArticle, idNumpublie, typepub) {
        if ($$hasAskedSurUnSujetProche) return;
        $$hasAskedSurUnSujetProche = true;
        $.get('./?controleur=Pages&action=sujetsProches&ID_ARTICLE=' + idArticle + '&ID_NUMPUBLIE=' + idNumpublie + '&TYPEPUB=' + typepub, null, null, 'text').then(function(data) {
            $(panelId).html(data);
        });
    }

    // Affiche "Cité par"
    var $$hasAskedCitePar = false;
    $.fn.articleCitePar = function(panelId, idArticle) {
        if ($$hasAskedCitePar) return;
        $$hasAskedCitePar = true;
        $.get('./?controleur=ListeDetail&TYPE=citepar&ID_ARTICLE=' + idArticle, null, null, 'text').then(function(data) {
            $(panelId).html(data);
        });
    }

    // Au click sur un lien relatif, on redirige vers le panneau article
    $.fn.redirectLinksToArticleTab = function(tabId) {
        var tab = $(tabId);
        if (!tab.length) return;
        this.each(function(index, link) {
            link = $(link);
            // On filtre sur les liens vers un panneau
            if (link.attr('href').match(/^#panel-?/)) return;
            // On filtre sur les figures
            link.click(function() {
                $.fn.articleChangeTab('article');
                // Je ne sais pas trop pourquoi, je suis obligé de mettre setTimeout sinon, ça ne scroll pas
                setTimeout(function() {
                    $(document).scrollTop($(document).scrollTop() - 70);
                }, 50);
            });
        });
    }


    // Les mots clés deviennent des liens menant vers la recherche simple de cairn
    $.fn.articleMotCle = function() {
        this.each(function(index, motCle) {
            motCle = $(motCle);
            var link = $('<a class="btn btn-default btn-xs"></a>');
            link.attr('href', './resultats_recherche.php?searchTerm=' +
                encodeURIComponent(motCle.text())
            );
            link.html(motCle.html());
            motCle.html(link);
        });
    }


    // Les tableaux et figures doivent être fusionnés en onglets sur certaines revues
    $.fn.mergeToTabs = function(followingSelector) {
        this.each(function(index, panel) {
            panel = $(panel);
            // Le traitement ne s'effectue que sur le premier élement
            if (panel.prev(followingSelector).length) return;
            // Le traitement ne s'effectue que sur des élements successifs
            var followingPanel = panel.nextAll(followingSelector);
            if (!followingPanel.length) return;
            var panels = $.merge([panel], followingPanel);

            // Ajout du conteneur global pour les onglets
            var container = $('<div class="merge-tabs"></div>');
            panel.before(container);
            // Ajout des onglets
            var tabs = $('<ul class="nav nav-tabs"></ul>');
            container.append(tabs);
            // Ajout du contenu d'onglets
            var tabsContent = $('<div class="tab-content"></div>');
            container.append(tabsContent);

            // Analyse des élements consécutifs
            panels.forEach(function(nestedPanel, index) {
                nestedPanel = $(nestedPanel);
                // Ajout de l'onglet
                var tab = $('<li></li>');
                tabs.append(tab);
                var tabLink = $('<a data-toggle="tab"></a>');
                tabLink.attr('href', '#' + nestedPanel.attr('id'));
                // Ajout du label de l'onglet
                var tabLabel = nestedPanel.find('.no').first().text();
                if (!tabLabel) tabLabel = '<span class="warning">PAS DE &lt;NO&gt;</span>';
                tabLink.html(tabLabel);

                tab.append(tabLink);
                // Les tableaux ne sont pas stylisés de base comme des panneaux
                nestedPanel.addClass('panneau');
                // Ajout du contenu
                nestedPanel.addClass('tab-pane');
                nestedPanel.detach().appendTo(tabsContent);
                // Mise en place de la mécanique pour les onglets
                if (index === 0) {
                    tabLink.tab('show');
                    tabLink.addClass('active');
                    nestedPanel.addClass('active');
                } else {
                    tabLink.tab();
                }
            })
        });
    }


    // Les tableaux CALS ont certains styles qui ne peuvent être rendus qu'en JS
    $.fn.articleStylizeCals = function() {
        this.each(function(index, table) {
            table = $(table);
            table.find('[data-width]').each(function(index, elem) {
                elem = $(elem);
                elem.css('width', elem.data('width'));
            });
        });
    }

     $.fn.articleChangeLinksPlan =  function(elem) {
        if (!elem) return;
        var htmlPlan = document.querySelector(elem);
       if (!htmlPlan) return;
        var linksPlan = htmlPlan.querySelectorAll('a');

        for(var i=0; i<linksPlan.length; ++i) {
          var hrefPlan = linksPlan[i].href;
          linksPlan[i].href = hrefPlan.replace("?contenu=plan", "");
        }
    }

    // Recherche la première lettre d'un noeud DOM
    function recInsertLettrine(elem) {
        if (!elem) return false;
        // On ne veut pas de la lettrine sur certaines classes
        if (elem.classList !== undefined) {
            if (elem.classList.contains('no-para')) return;
            if (elem.classList.contains('renvoi')) return;
            if (elem.classList.contains('btn')) return;
        }
        // On ne peut pas utiliser la fonction trim car elle vire les espaces insécables
        var textContent = elem.textContent.replace(/^\s+/, '');
        if ((elem.nodeType == 3) && (textContent != '')) {
            var span = document.createElement("span");
            span.textContent = textContent[0];
            elem.parentNode.insertBefore(span, elem);
            elem.textContent = textContent.substr(1);
            span.className = "lettrine";
            // FIX pour firefox.
            // Le float:left défini en css ne fonctionne pas correctement si l'on ne crée pas un contexte de formattage à posteriori.
            window.setTimeout(function() {
                span.style.position = 'relative';
            }, 0.1);
            return true;
        }

        var length = elem.childNodes.length;
        var child;
        for (var i = 0; i < length; i++) {
            child = elem.childNodes[i];
            if (recInsertLettrine(child))
                return true;
        }
        return;
    }

    // http://redmine.cairn.info/issues/150774
    // Ajout du bloc pub au niveau des numéros de paragraphe
    $.fn.articleBlocPubTexteIntegrale =  function(link) {
        // Ce n'est probablement pas optimal, mais je vais partir d'une valeur fixe
        // Ou alors il faut me définir ce qu'on entend par "scroll" (petit, moyen, long, avec quelle sensi, ...)
        // Simulation de la hauteur du scroll
        var heightBeforeDisplay = 300;
        // Hauteur de la page visible
        var pageSize = $(window).height();
        // Hauteur de l'article (avec metadonnées), donnée vraiment approximative
        var articleSize = $('#contenu').height();

        // On parse l'ensemble des paragraphes
        $('.para').each(function(index) {
            var para = $(this);
            var position = para.offset().top;
            // Calcul de la hauteur du paragraphe 
            var paraHeight = para.height();

            // On vérifie que le bloc n'existe pas déjà pour éviter de l'afficher à chaque paragraphe
            if (!$('.bloc-promo')[0]) {
                // On affiche le bloc si le paragraphe a une hauteur supérieur à 230
                if (paraHeight > 230) {
                    // Si la hauteur du dernier paragraphe de l'article plus grand que trois scrolls
                    if (articleSize > (pageSize + (heightBeforeDisplay * 3))) {
                        if (position > (pageSize + heightBeforeDisplay * 3)) {
                            para.prepend(link);
                        }
                        return;                
                    }
                    // Si la hauteur du dernier paragraphe de l'article plus grand que deux scrolls
                    else if (articleSize > (pageSize + (heightBeforeDisplay * 2))) {
                        if (position > (pageSize + heightBeforeDisplay * 2)){
                            para.prepend(link);
                            return;   
                        }            
                    }
                    // Sinon on n'affiche rien 
                    else {
                        return;
                    }      
                }
            } else {
                return;
            }
            return;
        }); 
              
    }

})(jQuery);
