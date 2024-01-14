/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

ajax = {}

/* ****************************************************************************************** */
// GESTION DU MULTI-LANGUE
if (window.IS_CAIRN_INT) {
    ajax.lang = "en";   
} else if (window.IS_CAIRN_MUNDO) {
    ajax.lang = "es";  
} else {
    ajax.lang = "fr"; 
}

// Multi-langue
ajax.mlabels = {
    "fr": {
        // Labels
        "cart-guest-create-account": "Lien d'activation envoyé à l'instant à ",
        "licence-removing": "Résiliation de votre abonnement en cours...",
        // Urls
        "url-cart-default": "panier.php",
        "url-mes-commandes": "mes_commandes.php",
    },
    "en": {
        // Labels
        "cart-guest-create-account": "Activation link sent to ",
        "licence-removing": "Deleting subscription in progress",
        // Urls
        "url-cart-default": "cart.php",
        "url-mes-commandes": "my_orders.php",
    },
    "es": {
        // Labels
        "cart-guest-create-account": "Activation link sent to ",
        "licence-removing": "Deleting subscription in progress",
        // Urls
        "url-cart-default": "cesta.php",
        "url-mes-commandes": "mis_pedidos.php",
    }
};
/* ****************************************************************************************** */


ajax.call = function (url, params, callback, callback_params) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var response = xmlhttp.responseText;
            if (response.indexOf("error_div_modal") >= 0) {
                document.getElementById('error_div').innerHTML = response;
                //cairn.show_modal("#error_div_modal");
                // Affichage de la modal d'erreur
                $(".error_div_modal").modal("show");
                // En cas d'erreur, on coupe la fenêtre de chargement
                cairn.close_loading_message();
            } else {
                if (ajax[callback])
                    ajax[callback](callback_params, response);
            }
        }
    }
    xmlhttp.open("POST", url, true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send(params);
}

ajax.callback_default = function (bloc, response) {
    document.getElementById(bloc).innerHTML = response;
    cairn.close_loading_message();

    ajax.reloadPluginAfterAjax();
}


ajax.callback_reload = function () {
    //On recharge la page pour permettre aux liens sécurisés de se mettre à jour
    setTimeout("window.location.reload()", 0500);
}
ajax.callback_login = function () {
    var isHomepage = document.getElementById('isHomepage').value;

    // Rechargement de la page lors de la connexion...
    if (isHomepage == 0) {
        window.location.reload();
    }
    // ...sauf sur une homepage
    else {
        // Récupération des informations de l'utilisateur
        $.get("./index.php?controleur=User&action=getInfosAboutUserForWebTrends", {})
            .done(function (data) {
                // Récupération des valeurs du callback
                var data = JSON.parse(data); // Transformation du string en tableau JSON

                // Connexion en tant qu'institution
                if (typeof data["U"] == "undefined" && typeof data["I"] != "undefined") {
                    window.location.reload();
                }
                // Connexion en tant qu'utilisateur
                if (typeof data["U"] != "undefined") {
                    if (window.IS_CAIRN_INT || window.IS_CAIRN_MUNDO) {
                        window.location.reload();
                    } else {
                        window.location.href = './mon_cairn.php';
                    }
                }
            }
            );
    }
}
ajax.callback_moncompte = function () {
    window.location.href = './mon_compte.php';
}
// ------------ END : CONNEXION DEPUIS LE FORMULAIRE DU HEADER ----


// ------------ START : DECONNEXION ----
ajax.logout = function () {
    // Message de chargement
    if (window.IS_CAIRN_INT) {
        cairn.show_loading_message('Signing out... Please wait');
    } else {
        cairn.show_loading_message('Déconnexion en cours...');
    }
    // Déconnexion
    this.call('./index.php?controleur=User&action=logout', null, 'callback_logout');
}

ajax.callback_logout = function () {
    //window.location.href = './connexion.php?connectFrom=logout';
    //window.location.href = './';
    window.location.reload();
}
// ------------ END : DECONNEXION ----


// ------------ START : MODELE DE CONNEXION COMPLEMENTAIRES ----

ajax.callback_createAccountSuivre = function () {
    type = document.getElementById('type').value;
    key = document.getElementById('key').value;

    // Exécution
    $.post("./index.php?controleur=User&action=toggleFollowing", { type: type, key: key, deleteIfExist: '0' });
}

ajax.callback_codePartenaires = function () {
    var codePartenaires = document.getElementById('code-partenaires').value;
    window.location.href = './enregistrer-code-partenaires?code-partenaires=' + codePartenaires;
}

ajax.directDownloadPDF = function (idArticle) {
    $(document).ready(function () {
        //Téléchargement du PDF

        // TAP
        params = cairn.parse_GET();
        tap = params.tap;
        tapParam = tap ? '&tap=' + tap : ''
        window.location.href = './load_pdf.php?ID_ARTICLE=' + idArticle + '&download=1' + tapParam;
    });
}
ajax.downloadPDFGuest = function (idArticle, idUser) {
    $(document).ready(function () {
        //Téléchargement du PDF
        window.location.href = './load_pdf.php?ID_ARTICLE=' + idArticle + '&ID_USER=' + idUser + '&access-without-account=1&download=1';
    });
}

ajax.directDownloadZippedPDFs = function (idNumpublie) {
    $(document).ready(function () {
        //Téléchargement du PDF
        window.location.href = './load_zip.php?ID_NUMPUBLIE=' + idNumpublie + '&download=1';
    });
}
// ------------ END : MODELE DE CONNEXION COMPLEMENTAIRES ----


// ------------ START : CREATION DE COMPTE ----
// Activation d'un compte utilisateur après l'achat sans compte
ajax.activateGuestAccountAfterCheckout = function() {
    // Récupération des valeurs
    var idCommande          = document.getElementById('no_commande').value;
    var email               = document.getElementById('email').value;
    var pswd                = document.getElementById('mdp').value;
    var checksuivirevue     = ($("#checksuivirevue").is(":checked")) ? 1 : 0;
    var checknewsletter     = ($("#checknewsletter").is(":checked")) ? 1 : 0;

    // Reset des erreurs
    $('#form-quick-account .alert').addClass("hide");

    console.log("./index.php?controleur=User&action=activateGuestAccountAfterCheckout&ID_COMMANDE="+idCommande+"&EMAIL="+email+"&PSWD="+pswd+"&SUIVI="+checksuivirevue+"&NEWSLETTER="+checknewsletter);

    // Activation d'un compte invité
    $.get("./index.php?controleur=User&action=activateGuestAccountAfterCheckout&ID_COMMANDE="+idCommande+"&EMAIL="+email+"&PSWD="+pswd+"&SUIVI="+checksuivirevue+"&NEWSLETTER="+checknewsletter)
        .done(function (data) {
            // Récupération des valeurs du callback
            var data = JSON.parse(data); // Transformation du string en tableau JSON

            // Activation OK
            if (data.statut == "success") {
                // Redirection vers la page "Mes commandes"
                document.location.href = "./"+ajax.mlabels[ajax.lang]["url-mes-commandes"];
            }
            // Erreur d'activation
            else {
                $('#panier--erreur-'+data.type).removeClass("hide");
            }
        }
    );
}
// ------------ END : CREATION DE COMPTE ----


// ------------ START : REDIRECTION / RECHARGEMENT ----
ajax.goToIndex = function () {
    window.location.href = './';
}
// ------------ END : REDIRECTION / RECHARGEMENT ----



// ------------ START : COOKIES ----
ajax.CairnInstitutionAlert = function () {
    this.call('./index.php?controleur=User&action=CairnInstitutionAlertCookie');
    document.getElementById('institution-bar').style.display = 'none';
}

ajax.CairnAcceptCookies = function () {
    // Site Courant
    this.call('./index.php?controleur=User&action=CairnAcceptCookies');
    // Cross-domaine
    var crossurl = document.getElementById('corsURL').value;
    this.call(window.SITE_PROTOCOL + crossurl + '/index.php?controleur=User&action=CairnAcceptCookies');
    // Suppression du message
    $("#cookie-warning").remove();
}

ajax.CairnPdfCookie = function (redirect) {
    this.call('./index.php?controleur=User&action=CairnPdfCookie');
}

ajax.CreditArticleAlert = function () {
    var todo = "";
    var status = document.getElementById('CreditArticleAlert').checked;
    if (status === true) { todo = "create"; } else { todo = "tempo"; }
    this.call('./index.php?controleur=User&action=CreditArticleAlertCookie&todo=' + todo);
}
// ------------ END : COOKIES ----


// ######## A SUPPRIMER APRES REFONTE DU PANIER ######## //
// ------------ START : PANIER ----
// Ajout d'un numéro dans le panier à la place d'articles
ajax.addNumeroFromBasket = function (idNumPublie, array) {

    //On affiche le message
    cairn.show_loading_message();

    // Init
    var type = "ART";

    // Récupération des articles à supprimer au profis du numéro
    var articles = array.split(',');
    for (i = 0; i < articles.length; i++) {
        // Suppression de l'élément du panier
        var id_article = articles[i];
        var str = "type=" + type + "&id=" + id_article + "&extra=";
        this.call('./index.php?controleur=User&action=panierRemove', str);
    }

    // Suppression terminée, on ajoute le numéro au panier
    setTimeout(function () { window.location.href = 'panier.php?VERSION=ELEC&ID_NUMPUBLIE=' + idNumPublie; }, 500);
}
// ------------ END : PANIER ----
// ######## A SUPPRIMER APRES REFONTE DU PANIER ######## //


// ------------ START : BIBLIOGRAPHIE ----
// Ajouter ou Retirer un élément de la bibliographie
ajax.toggleBiblio = function (type, idArticle, extra) {

    if (type == undefined && idArticle == undefined) {
        type = document.getElementById('type').value;
        idArticle = document.getElementById('id').value;
    }

    // Validation des données
    if (type != "" && idArticle != "") {

        // Identification du bouton
        var btnId = type + "-" + idArticle;

        // Parcours de tous les boutons identique de la page
        $("a[data-id-biblio='" + btnId + "']").each(function (e) {

            // Récupération des données
            var isIconOnly = $(this).data("biblioIsicononly");    // Est-ce que l'icon est accompagné d'un libellé ?
            var loadingLabel = $(this).data("biblioLabelLoading");  // Message de chargement

            // Marquage du bouton comme occupé
            // ICON uniquement
            if (isIconOnly == "1") {
                $(this).html('<img style=\"width: 32px;\" src=\"./static/images/loading.gif\" />');
            }
            // ICON & NOM
            else {
                $(this).html('<span class=\"name\">' + loadingLabel + '</span>').fadeTo(0, 0.5);;
            }
        });

        $.get("./index.php?controleur=User&action=toggleBiblio", { type: type, id: idArticle })
            .done(function (data) {
                // Récupération des valeurs du callback
                var data = JSON.parse(data); // Transformation du string en tableau JSON
                var action = data["action"];

                // Mise à jour des boutons
                ajax.updateBiblioButton(action, type, idArticle);
            }
            );
    }
    else {
        console.log("Valeur de biblio non-définie");
    }
}

// Change le libellé du bouton d'ajout/suppression de la bibliographie
ajax.updateBiblioButton = function (action, type, idArticle) {

    // Identification du bouton
    var btnId = type + "-" + idArticle;                       // Définition de l'ID du bouton
    var btn = $("a[data-id-biblio='" + btnId + "']");       // Définition du bouton cible

    // Parcours de tous les boutons identique de la page
    $("a[data-id-biblio='" + btnId + "']").each(function (e) {

        // Définition du type de bouton
        var isIconOnly = $(this).data("biblioIsicononly");     // Est-ce que l'icon est accompagné d'un libellé ?
        var hideOnRemove = $(this).data("biblioHideOnRemove");  // Doit on supprimer le bloc parent ? (1 = OUI, 0 = NON)

        // AJOUT
        if (action == "add") {
            // Récupération des valeurs et définition des éléments du bouton
            // DESKTOP
            if (browserInfos.isMobile() === false) {
                title = $(this).data("biblioLabelAdded");
                titleTooltip = $(this).data("biblioLabelToremove");
                btnName = " <span class=\"name\">" + title + "</span>";
                btnIcon = "<span class=\"icon icon-biblio-checked\"></span>";
                isInBiblio = true;
            }
            // MOBILE
            else {
                title = $(this).data("biblioLabelAdded");
                titleTooltip = $(this).data("biblioLabelToremove");
                btnName = " <span class=\"name\">" + title + "</span>";
                btnIcon = "<span class=\"icon icon-biblio-remove\"></span>";
                isInBiblio = true;
            }
        }
        // SUPPRESSION
        if (action == "remove") {
            // Récupération des valeurs et définition des éléments du bouton
            title = $(this).data("biblioLabelToadd");
            titleTooltip = title;
            btnName = " <span class=\"name\">" + title + "</span>";
            btnIcon = "<span class=\"icon icon-biblio-add\"></span>";
            isInBiblio = false;

            // Suppression du bloc parent du bouton
            if (hideOnRemove == "1") {
                ajax.removeBiblioParent(this, type, idArticle);
            }
        }

        // Si il s'agit d'un bouton complet (ICON + Texte), on n'affiche pas le Tooltips
        if (isIconOnly == "0") { titleTooltip = ""; }
        if (isIconOnly == "1") { btnName = ""; }

        // Modification du bouton (ET du tooltip -> @https://stackoverflow.com/questions/9501921/change-twitter-bootstrap-tooltip-content-on-click)
        $(this).html(btnIcon + btnName).attr("data-biblio-bool", isInBiblio).attr("title", titleTooltip).tooltip('fixTitle').fadeTo(0, 1);
    });
}

// Suppression du bloc parent
ajax.removeBiblioParent = function (e, type, idArticle) {

    // Apriori, on est sur la page Bibliographie
    // Total
    var total = $("#nbreTotalBiblio");
    var totalValue = total.val();

    // Valeur -1
    var newTotal = totalValue - 1;

    // Redirection si la bibliographie est maintenant vide
    if (newTotal == 0) {
        window.location.reload();
    }
    // Suppression des blocs
    else {
        // Assignation des nouvelles valeurs
        total.val(newTotal);

        // Suppression visuelle du bloc
        $(e).closest(".article-list-item").animate({ "marginLeft": "+=1000px", "marginBottom": "-30px", "padding": 0, "opacity": 0, "width": 0, "height": 0 }, "slow", function () { $(this).remove(); });
    }
}
// ------------ END : BIBLIOGRAPHIE ----


// ------------ START : FOLLOWING / SUIVI ----
// Recherche un élément pour l'afficher
ajax.searchToFollow = function (type) {

    // Récupération de la valeur du champ (le champ porte le même nom que le type avec le préfixe search_)
    var searchField = $("#form-mon-cairn-add-" + type + " #search_" + type);
    var value = searchField.val();

    if (value != "") {
        // Loading
        //On affiche le message
        cairn.show_loading_message('Recherche en cours...');

        // Recherche d'une revue
        if (type == "revue") {
            // Recherche
            $.post("./index.php?controleur=Recherche&action=monCairnSearchRevueByName", { searchValue: value })
                .done(function (data) {
                    // Récupération des valeurs du callback
                    var data = JSON.parse(data); // Transformation du string en tableau JSON
                    var statut = data["statut"];
                    var typeresult = data["type"];

                    // Success
                    if (statut == "success") {
                        // Insertion de la nouvelle revue
                        $('#listeRevues').append(data.template);

                        // On uniformise les tuiles
                        $('#listeRevues .article-list-item').matchHeight({ byRow: false });

                        // On vide le formulaire
                        searchField.val('');
                    }

                    // Erreur
                    if (statut == "erreur") {
                        // Affichage de l'erreur
                        if (typeresult == "not-found") {
                            $('#listeRevues').before("<div class=\"alert alert-danger alert-error-search-to-follow\">La recherche n'a retourné aucun résultat. Veuillez recommencer.</div>");
                        }
                        if (typeresult == "no-value") {
                            $('#listeRevues').before("<div class=\"alert alert-danger alert-error-search-to-follow\">Veuillez entrer le nom d'une revue pour l'ajouter.</div>");
                        }
                        if (typeresult == "already-in") {
                            $('#listeRevues').before("<div class=\"alert alert-warning alert-error-search-to-follow\">Vous suivez déjà cette revue.</div>");
                        }
                        // Suppression automatique du message
                        $(".alert-error-search-to-follow").delay(3000).fadeOut("slow");
                    }

                    // Suppression du message
                    cairn.close_loading_message();
                }
                );
        }
        // Recherche d'un auteur
        if (type == "auteur") {
            // Recherche
            $.post("./index.php?controleur=Recherche&action=monCairnSearchAuteurByName", { searchValue: value })
                .done(function (data) {
                    // Récupération des valeurs du callback
                    var data = JSON.parse(data); // Transformation du string en tableau JSON
                    var statut = data["statut"];
                    var typeresult = data["type"];

                    // Success
                    if (statut == "success") {
                        // Insertion de la nouvelle revue
                        $('#listeAuteurs').append(data.template);

                        // On uniformise les tuiles
                        $('#listeAuteurs .article-list-item').matchHeight({ byRow: false });

                        // On vide le formulaire
                        searchField.val('');
                    }

                    // Erreur
                    if (statut == "erreur") {
                        // Affichage de l'erreur
                        if (typeresult == "not-found") {
                            $('#listeAuteurs').prepend("<div class=\"alert alert-danger alert-error-search-to-follow\">La recherche n'a retourné aucun résultat. Veuillez recommencer.</div>");
                        }
                        if (typeresult == "no-value") {
                            $('#listeAuteurs').prepend("<div class=\"alert alert-danger alert-error-search-to-follow\">Veuillez entrer le nom d'un auteur pour l'ajouter.</div>");
                        }
                        if (typeresult == "already-in") {
                            $('#listeAuteurs').before("<div class=\"alert alert-warning alert-error-search-to-follow\">Vous suivez déjà cet auteur.</div>");
                        }
                        // Suppression automatique du message
                        $(".alert-error-search-to-follow").delay(3000).fadeOut("slow");
                    }

                    // Suppression du message
                    cairn.close_loading_message();
                }
                );
        }

        // Refresh plugins
        ajax.refreshNotificationPlugins();
    }
}
// ------------ END : FOLLOWING / SUIVI ----


// ------------ START : VIDER HISTORIQUE ----
// Ajouter ou Retirer un suivi (auteur, revue, ...) à un utilisateur
ajax.viderHistorique = function () {

    //On affiche le message
    document.getElementById("delete_historique_message").style.display = 'none';
    document.getElementById("delete_historique_in_progress").style.display = 'block';

    // Gestion des callback
    $.post("./index.php?controleur=Accueil&action=viderHistorique")
        .done(function (data) {
            //On recharge la page
            window.location.href = 'mon_historique.php?flush';
        }
        );
}
// ------------ END : VIDER HISTORIQUE ----


// ------------ START : RECOMMANDATIONS DANS MON CAIRN.INFO ----
/* Sur la page Mon Cairn, un système de recommandation à été ajouté. Il permet
 * d'afficher des tuiles de revues qui pourraient intéressé l'utilisateur.
 * Quand on ajoute ou enlève une recommandation, la tuile doit disparaître et
 * une autre doit être chargée.
 */
ajax.initListRecommandations = function () {

    // Pour forcer le rafraichissement des recommandations
    var dateTimestamp = new Date().getTime();

    // Récupération des recommandations
    $.get("./index.php?controleur=Recherche&action=monCairnSearchRecommandations&time=" + dateTimestamp)
        .done(function (data) {
            // Récupération des valeurs du callback
            var data = JSON.parse(data); // Transformation du string en tableau JSON
            var statut = data["statut"];
            var typeresult = data["type"];

            // Suppression du message de chargement
            $('#recommandation_loading').remove();
            $('#listeRevuesRecommandations .alert').remove();

            // Success
            if (statut == "success") {
                var details = data["details"];

                // Parcours des résultats
                $.each(details, function (key, value) {
                    // Insertion de la nouvelle revue
                    $('#listeRevuesRecommandations').append(value.template);
                    // Ajout des outils à la tuile
                    ajax.addToolsForRecommandations(value.idRevue);
                    // Uniformisation des tailles des tuiles
                    $('#listeRevuesRecommandations .media').matchHeight({ byRow: false });
                });

                // Mise au singulier du titre si nécessaire
                ajax.checkRecommandationTitle($("#listeRevuesRecommandations div.media").length);

                // Refresh plugins
                ajax.refreshNotificationPlugins();
            }

            // Erreur
            if (statut == "erreur") {
                if (typeresult == "no-result") {
                    $('#listeRevuesRecommandations').prepend("<div class=\"alert alert-warning\">Aucune recommandation trouvée.</div>");
                }
            }
        }
        );
}

// Ajoute les options nécessaires
/* Pour la page 'Mon Cairn', il a été demandé d'ajouter un système de recommandation,
 * ceci m'aurait obligé d'ajouter une Xeme condition au service de formatage des tuiles,
 * comme je n'avais pas envie, j'ai choisi d'ajouter un bouton et un comportement via
 * javascript. Il m'a en plus semblé comprendre que ce système serait temporaire donc
 * raison de plus pour ne pas en faire quelque chose de trop complexe à supprimer.
 *
 * La fonction ci-dessous ajoute une bouton SUPPRIMER et un comportement à exécuter
 * APRES avoir ajouté une revue dans la liste des suivis.
 */
ajax.addToolsForRecommandations = function (idRevue) {
    // Identification de la tuile où l'on souhaite ajouter le bouton et le comportement
    var tuile = $("#listeRevuesRecommandations .media[data-id-revue='" + idRevue + "']").addClass('wellow');

    // Définition d'un bouton de suppression
    // Les tooltips n'aiment pas trop être ajouté après le chargement de la page, donc on doit
    // redéfinir les options "placement" et "delay".
    var toolboxBtn = "<a href=\"javascript:void(0);\" onclick=\"ajax.removeFromListRecommandation('" + idRevue + "');\" data-id-recommandation=\"" + idRevue + "\" data-toggle=\"tooltip\" data-placement=\"bottom\" data-delay='{\"show\":\"500\",\"hide\":\"100\"}' title=\"Ne plus me suggérer cette revue\"><span class=\"material-icons\">clear</span></a>";
    // Création de la Toolbox
    tuile.children(".media-body").children(".media-body-inner-wrapper").children(".article-meta").after("<div class=\"article-toolbox\">" + toolboxBtn + "</div>");
    // Refresh du Tooltips
    tuile.children(".media-body").children(".media-body-inner-wrapper").children(".article-toolbox").children("a").tooltip('fixTitle');

    // Définition d'un comportement complémentaire lors du clic sur le bouton 'Suivre'
    $("#listeRevuesRecommandations .media[data-id-revue='" + idRevue + "'] a.btn-following").attr('onclick', 'ajax.addFromListRecommandation("' + idRevue + '");');
}

// Supprime une revue des recommandations
ajax.removeFromListRecommandation = function (idRevue) {

    // Marquage du bouton comme occupé
    $("a[data-id-recommandation='" + idRevue + "']").html('<img style=\"width: 32px;\" src=\"./static/images/loading.gif\" />');

    // Récupération des recommandations
    $.get("./index.php?controleur=User&action=removeRecommandation", { idRevue: idRevue })
        .done(function (data) {
            // Identification du bloc parent
            var parentId = $("a[data-id-recommandation='" + idRevue + "']").closest(".article-list-item");
            // Suppression visuelle du bloc
            parentId.animate({ "opacity": 0 }, "slow", function () { $(this).remove(); });

            // Contrôle
            setTimeout(function () { ajax.hasRecommandationLeft(); }, 500);
        }
        );
}

// Valide une recommandation de revue
ajax.addFromListRecommandation = function (idRevue) {

    // Récupération des recommandations
    $.get("./index.php?controleur=User&action=addRecommandation", { idRevue: idRevue })
        .done(function (data) {
            // Identification du bloc parent
            var parentId = $("a[data-id-recommandation='" + idRevue + "']").closest(".article-list-item");
            // Suppression visuelle du bloc
            parentId.animate({ "opacity": 0 }, "slow", function () { $(this).remove(); });

            // Mise à jour du compteur
            var counter = $('#counterSuiviPublication');
            var counterCount = counter.html();
            var parentCounter = counter.parent();
            var parentCounterHtml = parentCounter.html();

            // Incrémentation
            var ncounterCount = parseInt(counterCount) + 1;
            var html = parentCounterHtml;

            // Remplacement des valeurs
            // Pluriels
            if (ncounterCount > 1 && counterCount <= 1) {
                var html = html.replace(" revue", " revues");   // Le mot revue est également présent dans l'ancre d'un lien, avec l'espace devant on s'assure qu'il s'agit d'un mot
                var html = html.replace(" suivie", " suivies"); // On fait pareil par sécurité
            }
            // Nombre
            html = html.replace(counterCount, ncounterCount);

            // Remplacement
            parentCounter.html(html);

            // Contrôle
            setTimeout(function () { ajax.hasRecommandationLeft(); }, 1000);
        }
        );
}

// Vérification du nombre de recommandation encore disponibles
ajax.hasRecommandationLeft = function () {
    // Calcul du nombre de recommandation
    var count = $("#listeRevuesRecommandations .media").length;

    // Si plus de recommandation dans la liste
    if (count == 0) {
        // Vérification des recommandations restantes en base de données
        $.get("./index.php?controleur=User&action=countNotificationLeft")
            .done(function (nbre) {

                // Il y a encore des recommandations, on propose de les voir
                if (nbre > 0) {
                    // Message
                    $('#recommandations #listeRevuesRecommandations').html('<div class="alert alert-info">Nous avons encore des recommandations pour vous, souhaitez-vous les voir maintenant ?<br /><a class="alert-link" href="javascript:void(0);" onclick="window.location.reload();">Voir les autres recommandations</a></div>');

                    // Mise au singulier du titre si nécessaire
                    ajax.checkRecommandationTitle(nbre);
                }
                // Plus aucune recommandation, on supprime le bloc
                else {
                    $('section#recommandations').remove();
                    window.location.reload();
                }
            }
            );
    }
    else {
        // Mise au singulier du titre si nécessaire
        ajax.checkRecommandationTitle(count);
    }
}

// Mise au singulier du titre
ajax.checkRecommandationTitle = function (count) {
    // Singulier
    if (count == 1) {
        $('#recommandations .title-subdivision').text('Peut-être souhaiteriez-vous suivre aussi la revue suivante ?');
    }
    // Pluriel
    else {
        $('#recommandations .title-subdivision').text('Peut-être souhaiteriez-vous suivre aussi les revues suivantes ?');
    }
}
// ------------ END : RECOMMANDATIONS DANS MON CAIRN.INFO ----


// ------------ START : RESILIATION ABONNEMENT CAIRN ---------
ajax.abonnementCairnResiliation = function () {

    // Affichage du chargement
    cairn.show_loading_message(ajax.mlabels[ajax.lang]["licence-removing"]);

    // Récupération des recommandations
    $.get("./index.php?controleur=User&action=abonnementCairnResiliation")
        .done(function (data) {
            window.location.reload();
        }
        );
}
// ------------ END : RESILIATION ABONNEMENT CAIRN -----------



// ------------------ START : CODE REVENDEUR -----------------
// Vérification de la validité d'un code revendeur
ajax.codeRevendeurVerification = function () {

    // Récupération des valeurs
    var error = 0; // 0 = Aucune erreur, 1 = code expiré, 2 = code n'existe pas, 3 = code déjà utilisé
    var code = document.getElementById('code').value;
    var licenceCode = document.getElementById('licenceCode').value;

    // Reset des erreurs
    $('[id^=formCodeError]').css('display', 'none');

    // Validation du formulaire
    if (code != "") {
        //On affiche le message de connexion en cours
        cairn.show_loading_message('Vérification en cours...');

        // Vérification du code
        $.post("./index.php?controleur=User&action=codeRevendeurDoVerification", { code: code }, function (response) {

            // Récupération des valeurs du callback
            var response = JSON.parse(response); // Transformation du string en tableau JSON

            // Validation
            if (response.statut) {
                const redirectOnSuccess = "/activer-"+licenceCode+"-confirmer.php?code=" + code;
                // L'utilisateur n'est pas connecté...
                if (!response.userIsConnected) {
                    // ...on passe par la connexion
                    document.location.href = "./connexion.php?redirectOnSuccess=" + encodeURIComponent(redirectOnSuccess);
                }
                // L'utilisateur est connecté...
                else {
                    // ...on passe à l'étape suivante
                    document.location.href = '.' + redirectOnSuccess;
                }
            }
            // Erreur
            else {
                // Suppression du message de chargement
                cairn.close_loading_message();

                // Définition de l'erreur
                if (response.type == "expired") { error = 1; }
                if (response.type == "not-exist") { error = 2; }
                if (response.type == "already-used") { error = 3; }

                // Affichage de l'erreur
                $('#formCodeError' + error).css('display', 'block');
            }
        });
    }
}

// Activation d'un code revendeur
ajax.codeRevendeurActivation = function () {

    // Récupération des valeurs
    var error = 0; // 0 = Aucune erreur, 1 = code expiré, 2 = code n'existe pas, 3 = code déjà utilisé
    var code = document.getElementById('code').value;
    var licenceCode = document.getElementById('licenceCode').value;

    // Reset des erreurs
    $('[id^=formCodeError]').css('display', 'none');

    // Validation du formulaire
    if (code != "") {
        //On affiche le message de connexion en cours
        cairn.show_loading_message('Vérification en cours...');

        // Vérificatio du code
        $.post("./index.php?controleur=User&action=codeRevendeurDoVerification", { code: code}, function (response) {

            // Récupération des valeurs du callback
            var response = JSON.parse(response); // Transformation du string en tableau JSON

            // Validation
            if (response.statut) {
                // L'utilisateur n'est pas connecté
                if (!response.userIsConnected) {
                    // ...on passe par la connexion
                    document.location.href = "./connexion.php?connectFrom=coderevendeur&type=coderevendeur&id=" + code;
                }
                // L'utilisateur est connecté...
                else {
                    //On affiche le message de connexion en cours
                    cairn.show_loading_message('Activation en cours...');

                    // Activation du code
                    $.post("./index.php?controleur=User&action=codeRevendeurDoActivation", { code: code}, function (response) {

                        // Récupération des valeurs du callback
                        var response = response;

                        // Validation
                        if (response.statut) {
                            // Redirection
                            document.location.href = "./activer-" +licenceCode+ "-confirme.php?code=" + code;
                        }
                        // Erreur
                        else {
                            // Suppression du message de chargement
                            cairn.close_loading_message();

                            // Définition de l'erreur
                            error = 4;

                            // Affichage de l'erreur
                            $('#formCodeError' + error).css('display', 'block');
                        }
                    });
                }
            }
            // Erreur
            else {
                // Suppression du message de chargement
                cairn.close_loading_message();

                // Définition de l'erreur
                if (response.type == "expired") { error = 1; }
                if (response.type == "not-exist") { error = 2; }
                if (response.type == "already-used") { error = 3; }

                // Affichage de l'erreur
                $('#formCodeError' + error).css('display', 'block');
            }
        });
    }
}
// ------------------- END : CODE REVENDEUR ------------------



ajax.sendBiblioMail = function () {
    /*names = document.getElementById('userNames').value;
    biblioList = document.getElementById('biblioList').value;
    mail = document.getElementById('emailUser').value;
    commentaire = document.getElementById('commentaire').value;*/

    // Récupération des valeurs
    var error = 0; // 0 = Aucune erreur, 1 = Nom ou E-mail manquante, 2 = Aucun destinataire
    var biblioList = document.getElementById('biblioList').value;
    var site = document.getElementById('site').value; // cairn.info ou cairn-int.info ?
    // L'utilisateur
    var sendToUser = document.getElementById('sendToUser').checked;        // true or false
    var nomUser = document.getElementById('nomUser').value;
    var emailUser = document.getElementById('emailUser').value;
    // Le destinataire
    var sendToDestination = document.getElementById('sendToDestination').checked; // true or false
    var nomDestination = document.getElementById('nomDestination').value;
    var emailDestination = document.getElementById('emailDestination').value;
    // Le commentaire
    var commentaire = document.getElementById('commentaire').value;

    // Validation du formulaire
    if ((sendToUser === true) && (nomUser == "" || emailUser == "")) { error = 1; }
    if ((sendToDestination === true) && (nomDestination == "" || emailDestination == "")) { error = 1; }
    if ((sendToUser === false) && (sendToDestination === false)) { error = 2; }

    // Reset des erreurs
    document.getElementById('formSendBiblioMailError1').style.display = 'none';
    document.getElementById('formSendBiblioMailError2').style.display = 'none';

    // Définition du suffixe
    var suffixe = "";
    if (site == "cairn-int") { suffixe = "-int"; }

    // Exécution
    // Erreur 1
    if (error == 1) {
        document.getElementById('formSendBiblioMailError1').style.display = 'block';
    }
    // Erreur 2
    else if (error == 2) {
        document.getElementById('formSendBiblioMailError2').style.display = 'block';
    }
    // Validation
    else {
        //Debug
        //console.log("./Tools/mail-biblio/index"+suffixe+".php?from_nom="+nomUser+"&from_email="+emailUser+"&from_commentaire="+commentaire+"&to_nom="+nomUser+"&to_email="+emailUser+"&to_user_exist="+'1'+"&bibliographie="+biblioList);

        // Envoi à l'utilisateur
        if (sendToUser === true) {
            $.get("./Tools/mail-biblio/index" + suffixe + ".php", { from_nom: nomUser, from_email: emailUser, from_commentaire: commentaire, to_nom: nomUser, to_email: emailUser, to_user_exist: '1', bibliographie: biblioList });
        }
        // Envoi à destination
        if (sendToDestination === true) {
            // Est-ce que cet utilisateur existe ?
            $.post("./index.php?controleur=User&action=isUserExist", { USERMAIL: emailDestination }, function (response) {
                $.get("./Tools/mail-biblio/index" + suffixe + ".php", { from_nom: nomUser, from_email: emailUser, from_commentaire: commentaire, to_nom: nomDestination, to_email: emailDestination, to_user_exist: response, bibliographie: biblioList });
            });
        }
        $("#modal_biblio_by_email").modal("hide");
    }
}

ajax.sendPasswordMail = function () {
    // Récupération des données
    var email = document.getElementById('email').value;

    // Envoie d'un e-mail de récupération
    $.post("./index.php?controleur=User&action=sendPasswordMail", { USERMAIL: email }, function (response) {
        // E-mail envoyé
        if (response != 1) {
            document.getElementById('email-address-sent').innerHTML = document.getElementById('email').value;
            $("#modal-email-sent").modal("show");
        }
        // Erreur lors de l'envoi
        else {
            document.getElementById('email-address-not-sent').innerHTML = document.getElementById('email').value;
            $("#modal-email-not-sent").modal("show");
        }
    });
}

ajax.saveNewPassword = function (form) {
    // Récupération des données
    var userId = document.getElementById('id_user').value;
    var newPassword = document.getElementById('newPwd').value;
    var confirmNewPassword = document.getElementById('confirmPwd').value;
    var token = getParameterByName('id');

    // Les mots de passe ne correspondent pas
    if (newPassword != confirmNewPassword) {
        $("#modal-pswd-error").modal("show");
    }
    // Vérification des mots de passe ok :
    else {
        //On affiche le message de chargement
        cairn.show_loading_message('Enregistrement de votre nouveau mot de passe...');

        // Mise à jour du mot de passe
        $.post("./index.php?controleur=User&action=saveNewPassword", { USERID: userId, PWD: newPassword, TOKEN: token }, function (response) {
            // OK
            if (response == '0') {
                // Identification automatique
                $.fn.cairnDirectAuthenticate(userId, newPassword, true, '/confirmation_mot_de_passe.php');
            }
            // Erreur de token
            else {
                // Suppression du message de chargement
                cairn.close_loading_message();

                // Affichage de l'erreur
                $("#modal-token-error").modal("show");
            }
        });
    }
}

ajax.deleteUserModal = function (type) {

    // Confirmation de la suppression du compte
    if (type == "confirm") {
        // Affichage de l'action en cours
        document.getElementById("delete_user_message").style.display = 'none';
        document.getElementById("delete_user_in_progress").style.display = 'block';
        $('#modal-confirm-suppression .modal-footer').hide();

        // Suppression du compte
        $.post("./index.php?controleur=User&action=supprimerCompte", "", function (response) {
            if (response == '1') {
                // Affichage de l'action en cours
                document.getElementById("delete_user_in_progress").style.display = 'none';
                document.getElementById("delete_user_valide").style.display = 'block';
                ajax.goToIndex();
            }
            else {
                // Affichage de l'action en cours
                document.getElementById("delete_user_in_progress").style.display = 'none';
                document.getElementById("delete_user_error").style.display = 'block';
                ajax.goToIndex();
            }
        });
    }
    // Affichage du modal
    else {
        $("#modal-confirm-suppression").modal("show");
    }
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


ajax.checkContactForm = function () {
    let objects = {};
    let errors = [];
    let fieldset = document.getElementsByTagName('fieldset')[0];
    let emailSyntax = new RegExp('^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,}$', 'i');

    // récuperation des elements du formulaire
    ['input', 'select', 'textarea'].forEach(function (item) {
        let elements = fieldset.getElementsByTagName(item);
        for (e of elements) {
            let label = e.previousElementSibling;
            if (label.tagName !== 'LABEL') {
                label = label.parentElement.previousElementSibling;
            }
            objects[e.id] = {
                type: e.type,
                tag: item,
                value: e.value,
                label: label ? label.textContent : '',
                require: e.required
            }
        }
    })

    // check le formulaire
    for (let [k, v] of Object.entries(objects)) {
        if (v.require) {
            if (v.value === '') {
                errors.push(`<li>le champ "${v.label}" ne peux pas être vide!</li>`);
            }
            if ((v.type === 'email') && !emailSyntax.test(v.value)) {
                errors.push(`<li>l'address ${v.value} n'est pas valide!</li>`);
            }
        }
    }

    // Vérification du captcha
    if (document.getElementById('captchaCode')) {
        var captcha = document.getElementById('formug').value;
        var code = document.getElementById('captchaCode').value;
        var captchaEncoded = '';
        jQuery.ajaxSetup({ async: false });
        $.post('./captcha/shared.php', { code: captcha, async: false }, function (response) {
            captchaEncoded = response;
        });
        jQuery.ajaxSetup({ async: true });
        if (captchaEncoded != code) {
            errors.push(`<li>Le code captcha ne correspond pas à l'image.</li>`)
        }
    }

    if (errors.length) {
        $('#error_list').empty().append(errors.join('\n'));
        $('#error_invalid').modal('show');
        return;
    }

    // On envoi la requête pour soumettre le formulaire de contact
    for (let [k, v] of Object.entries(objects)) {
        params[k] = v.value;
    }

    $.post("./index.php?controleur=Outils&action=sendContactMail", params, function (response) {
        if (response == '1') {
            $('#error_invalid').modal("show");
        } else {
            if (! params.hasOwnProperty('service')) {
                $('#error_invalid').modal("show");
            }
            document.location.href = "./formulaire-" + params['service'] + "-envoye.php";
        }
    });
}

// Regex vérification de mail
ajax.checkEmail = function (email) {
  var response = $.ajax({
    type: "GET",
    dataType: "json",
    data: {
      controleur: 'Outils',
      action: 'isValidEmailAddress',
      email: email,
    },
    async: false,
  });
  return response.responseJSON;
}

ajax.modifMdp = function () {
    var email = document.getElementById('email').value;
    var iduser = document.getElementById('iduser').value;
    var mdp = document.getElementById('mdp').value;
    var mdp2 = document.getElementById('mdp2').value;
    var mdp3 = document.getElementById('mdp3').value;

    var str = "email=" + email + "&iduser=" + encodeURIComponent(iduser) + "&mdp=" + encodeURIComponent(mdp) + "&mdp2=" + encodeURIComponent(mdp2) + "&mdp3=" + encodeURIComponent(mdp3);

    this.call('./index.php?controleur=User&action=updMdp', str, 'callback_moncompte');
}

ajax.demandeBiblio = function () {
    var str = "todo=demandeBiblio";
    this.call('./index.php?controleur=User&action=demandesActions', str, 'callback_default', 'body-content');
}

ajax.envoiDemandeBiblio = function () {
    if (document.getElementById('MOTIVATION').value == "") {
        document.getElementById('MOTIVATION').value = "-";
    }

    var str = "todo=envoiDemandeBiblio&prenom=" + document.getElementById('PRENOM').value
        + "&nom=" + document.getElementById('NOM').value
        + "&fonction=" + document.getElementById('FONCTION').value
        + "&motivation=" + document.getElementById('MOTIVATION').value
    this.call('./index.php?controleur=User&action=demandesActions', str, 'callback_default', 'body-content');
}

ajax.promotion = function (str) {
    this.call('./static/includes/ajax/promotion.php', str);
}

// Désactivé
ajax.mergePanier = function (str) {
    cairn.close_modal();
    this.call('./index.php?controleur=User&action=panierActions',
        'todo=merge', 'callback_default', 'body-content');
}
// Désactivé
ajax.erasePanier = function (str) {
    cairn.close_modal();
    var totalPrice = document.getElementById('totalPrice').value;
    this.call('./index.php?controleur=User&action=panierActions',
        'todo=erase&totalPrice=' + totalPrice, 'callback_default', 'body-content');
}

ajax.mergeDemande = function (str) {
    cairn.close_modal();
    this.call('./index.php?controleur=User&action=demandesActions',
        'todo=merge', 'callback_default', 'body-content');
}
ajax.eraseDemande = function (str) {
    cairn.close_modal();
    this.call('./index.php?controleur=User&action=demandesActions',
        'todo=erase', 'callback_default', 'body-content');
}




ajax.removeNetworkAddress = function (user, _id) {
    $.post("./index.php?controleur=Admin&action=removeNetworkAddress", { id: _id }, function () {
        window.location.href = 'gestion_utilisateurs.php?id_user=' + encodeURIComponent(user);
    });
}

ajax.editModalNetworkAddress = function (user, id, adress, mask) {
    $('#user_selected').val(user.toString());
    $('#ip_selected').val(id.toString());
    $('#edit-addess').val(adress.toString());
    $('#edit-mask').val(mask.toString());
}

ajax.editNetworkAddress = function () {
    user = $('#user_selected').val();
    line = $('#ip_selected').val();
    _address = $('#edit-addess').val();
    _mask = $('#edit-mask').val();

    if (_mask.indexOf("255.") != 0) {
        alert('invalid mask');
    } else {
        $.post("./index.php?controleur=Admin&action=editNetworkAddress", { edit_id: line, address: _address, mask: _mask }, function () {
            cairn.close_modal();
            window.location.href = 'gestion_utilisateurs.php?id_user=' + encodeURIComponent(user);
        });
    }
}

ajax.addNetworkAddress = function () {
    _user = $('#new_user_selected').val();
    _idAbonnes = $('#new_id_selected').val();
    _address = $('#new-addess').val();
    _mask = $('#new-mask').val();

    if (_mask.indexOf("255.") != 0) {
        alert('invalid mask');
    } else {
        $.post("./index.php?controleur=Admin&action=addNetworkAddress", { idAbonnes: _idAbonnes, address: _address, mask: _mask }, function () {
            cairn.close_modal();
            window.location.href = 'gestion_utilisateurs.php?id_user=' + encodeURIComponent(_user);
        });
    }

}

ajax.cleanseNetworkAddress = function () {
    var _idInstitution = $('#id-institution').val();
    var _ipRange = $('#ips').val();
    var _user = $('#new_user_selected').val();
    var _idAbonnes = $('#new_id_selected').val();
    $.ajax({
        url: 'index.php?controleur=Admin&action=cleanseNetworkAddress&idInstitution=' + _idInstitution + '&ipRange=' + encodeURIComponent(_ipRange) + '&user=' + _user + '&idAbonnes=' + _idAbonnes,
        type: 'GET',
        dataType: "json",
        success: function (response) {
            console.log(response);
            if (response.statut == 'success') {
                alert("Traitement des ip effectué !");

                $("#ips").hide();
                $('#formatIp').hide();
                $('#clear').hide();

                $("#ipCleanse").show();
                $("#previous").show();
                $("#addNetworkAddressCleanse").show();

                $("#ipCleanse").html(formatIpResult(response['detail']));
                $("#ipToAdd").html(JSON.stringify(response['detail']));
            }
            if (response.statut == 'error') {
                if (response.type == 'match') {
                    console.log(response.detail);
                    alert('Le format de l\'adresse ip est incorrect, veuillez respecter le format suivant, exemple :\n IP simple : 192.31.21.112  \n IP range : 192.67.20.0-192.67.21.255');
                }
                if (response.type == 'verif') {
                    console.log(response.detail);
                    alert('Le format de l\'adresse ip est incorrect, le segment d\'une ip ne doit pas dépasser 3 caractères');
                }
                if (response.type == 'list') {
                    console.log(response.detail);
                    alert('Aucune ip à ajouter');
                }
            }
        },

    });

}

ajax.convertIpCIDR = function () {
    var _cidr = $('#ipsCIDR').val();
    $.ajax({
        url: 'index.php?controleur=Admin&action=convertCIDR&ipCIDR=' + _cidr + '',
        type: 'GET',
        dataType: "json",
        success: function (response) {
            console.log(response);
            if (response.statut == 'success') {
                alert("Traitement des ip effectué !");
                $("#ipsCIDR").hide();
                $('#formatCIDR').hide();
                $('#clear').hide();

                $("#ipCleanseCIDR").show();
                $("#previousCIDR").show();

                $("#ipCleanseCIDR").html(formatCIDR(response['detail']));
                $("#ipToAddCIDR").html(JSON.stringify(response['detail']));
            }
        },

    });
}

function formatIpResult(data) {
    var content = "";
    var ipSubnetMask = data;
    var length = ipSubnetMask.length;
    console.log(data);

    for (i = 0; i < ipSubnetMask.length; i++) {
        table = '<tr><th>First IP</th><th>Mask</th></tr>';
        for (j = 0; j < ipSubnetMask[i].length; j++) {
            table += '<tr><td>' + ipSubnetMask[i][j]['startIp'] + '</td><td>' + ipSubnetMask[i][j]['subnetMask'] + '</tr>';
        }
        content += table;
    }
    return content;
}

function formatCIDR(data) {
    var content = "";
    var cidr = data;
    var length = cidr.length;

    table = '<tr><th>CIDR</th><th>First IP</th><th>Last IP</th></tr>';
    for (i = 0; i < length - 1; i++) {
        table += '<tr><td>' + cidr[i]['cidr'] + '</td><td>' + cidr[i]['firstIP'] + '</td><td>' + cidr[i]['lastIP'] + '</tr>';
    }
    content += table;
    return content;
}

function initModalCIDR() {
    $("#ipCleanseCIDR").hide();
    $("#previousCIDR").hide();

    $("#ipsCIDR").show();
    $('#formatCIDR').show();
    $('#clear').show();
}

function initModalNewtworkAddress() {
    $("#ipCleanse").hide();
    $("#addNetworkAddressCleanse").hide();
    $("#previous").hide();

    $("#ips").show();
    $('#formatIp').show();
    $('#clear').show();
}

ajax.eraseText = function (field) {
    $("#" + field).val("");
}


ajax.addNetworkAddressCleanse = function () {

    var _idInstitution = $('#id-institution').val();
    var _ipRange = $('#ipToAdd').val();
    var _user = $('#new_user_selected').val();
    var _idAbonnes = $('#new_id_selected').val();
    console.log(_ipRange);

    $.ajax({
        url: 'index.php?controleur=Admin&action=addNetworkListAddress&idInstitution=' + _idInstitution + '&ipRange=' + encodeURIComponent(_ipRange) + '&user=' + _user + '&idAbonnes=' + _idAbonnes,
        type: 'GET',
        dataType: "json",
        success: function (response) {
            if (response.statut == 'success') {
                alert('Mise à jour effectuée');
                cairn.close_modal();
                window.location.href = 'gestion_utilisateurs.php?id_user=' + encodeURIComponent(_user);
            }
            if (response.statut == 'error') {
                alert('Une erreur s\'est produite');
            }
        }

    });
}

ajax.addCairnParams = function () {
    _param = $('select#params_select').val();
    _value = $('.choice_value:visible').val();
    _user = $('input#user_params').val();

    $.post("./index.php?controleur=Admin&action=addCairnParams", { param: _param, value: _value, user: _user }, function () {
        cairn.close_modal();
        window.location.href = 'gestion_utilisateurs.php?id_user=' + encodeURIComponent(_user);
    });
}

ajax.removeCairnParam = function (_type, _value, _user) {
    $.post("./index.php?controleur=Admin&action=removeCairnParam", { type: _type, value: _value, user: _user }, function () {
        window.location.href = 'gestion_utilisateurs.php?id_user=' + encodeURIComponent(_user);
    });
}

ajax.changeMaxSessions = function () {
    var newMax = document.getElementById('changeMaxSessions').value;
    var user = document.getElementById('id_user').value;
    $.post("./index.php?controleur=Admin&action=changeMaxSessions", { newMax: newMax, user: user }, function () {
        window.location.reload();
    });

}

ajax.changeMaxSessionsIP = function () {
    var newMax = document.getElementById('changeMaxSessionsIP').value;
    var user = document.getElementById('id_user').value;
    $.post("./index.php?controleur=Admin&action=changeMaxSessionsIP", { newMax: newMax, user: user }, function () {
        window.location.reload();
    });
}

ajax.clearRechConfig = function () {
    $.post("./evidensseConfigurator/ajax/saveConfig.php", null, function () {
        window.location.reload();
    });
}

ajax.updateMode = function (mode) {
    ajax.call("/index.php?controleur=User&action=updateSearchMode", 'mode=' + mode);
}

ajax.alertSample = function (idNumPublie) {

    // Définition de la source de la frame
    //src = "http://dedi.cairn.info/NL/exemple_NL.php?ID_NUMPUBLIE="+idNumPublie;
    src = "Tools/alertes/?id_numpublie=" + idNumPublie;
    document.getElementById('alert_iframe').src = src;

    // Ouverture de la modal
    cairn.show_modal('#modal_alerte_email_exemple');
}

ajax.paiementOgone = function (tmpCmdId) {
    //Récupération des informations manquantes sur l'article.
    $.ajax({
        type: "POST",
        url: "index.php?controleur=User&action=commandeToBO",
        data: { tmpCmdId: tmpCmdId },
        async: false
    });

    $('#ogone').submit();
}

// L'utilisateur suggère un ouvrage à son bibliothécaire (seulement en tant qu'institution)
ajax.postSuggestionOuvragePourInstitution = function ($idNumpublie) {
    var commentaire = document.getElementById('commentaireSuggestion').value;
    var nom = document.getElementById('nomSuggestion').value;
    var prenom = document.getElementById('prenomSuggestion').value;
    var email = document.getElementById('emailSuggestion').value;
    var formation = document.getElementById('formationSuggestion').value;

    $.post('index.php?controleur=User&action=suggererOuvragePourInstitution',
        {
            ID_NUMPUBLIE: $idNumpublie,
            commentaireSuggestion: commentaire,
            nomSuggestion: nom,
            prenomSuggestion: prenom,
            emailSuggestion: email,
            formationSuggestion: formation
        }
    )
        .done(function () {
            // On affiche le message de succès
            $('#modal_suggestion .modal-body .alert-success').show();
            // On cache les éléments
            $('#modal_suggestion .modal-body .form-group').hide();
        });
}

// Sur les blocs générés et appelé en AJAX, les boutons de notifications (suivre),
// ne sont pas actifs. Il faut les réactiver. Comme il n'y a pas de fonction refresh
// sur ces deux plugins, on les relance simplement.
// Utilisé principalement dans Mon Cairn.info pour les recommandations et l'ajout
// via moteur de recherche.
ajax.refreshNotificationPlugins = function () {
    $("body").notificationToggleSubscribe();
    $().followingButtonOnHover();
}

// Lors du remplacement d'une partie du contenu par une vue appelée en AJAX, il faut
// pouvoir relancer certains plugins afin de prendre en compte les nouveaux éléments,
// on peut donc place ci-dessous les plugins qu'il faut relancer.
// Il faut prévoir de faire en sorte que les plugins ne se relance que sur les nouveaux
// éléments afin d'éviter d'être actif 2x sur les autres.
ajax.reloadPluginAfterAjax = function () {
    $('form').listenToValidate();
}
