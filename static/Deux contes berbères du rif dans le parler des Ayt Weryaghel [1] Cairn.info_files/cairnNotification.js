/*
 * Projet : CAIRN-PLUS
 *
 * Description :
 *
 * Gestion des notifications utilisateurs sur cairn
 */
(function($) {
    "use strict";

    $.fn.notificationDisplay = function(options) {
        // Pour gérer la petite cloche qui apparait en haut à droite de cairn
        var self = this;
        var settings = $.extend({
            trigger:    '#notification-display-trigger',
            list:       '#notification-display-list',
            counter:    '#notification-display-counter-',
        }, options);
        self.find(settings.trigger).click(function() {
            if (self.hasClass('open')) return;
            $.post('./?controleur=User&action=listNotifications&markAsRead=1').then(function(notifications) {
                var htmlList = self.find(settings.list);
                var htmlCounter = self.find(settings.counter);
                // Insertion de la liste des notifications
                htmlList.empty();
                // Arrow
                htmlList.append('<span class="arrow"></span>');   
                // Affichage des résultats
                if(notifications.length != 0) { 
                    // Parcours du tableau
                    $.each(notifications, function(index, notification) {
                        htmlList.append('<li class="notification">' + notification + '</li>');
                    });
                    // Division
                    // htmlList.append('<li class="divider" role="separator"></li>');
                    // htmlList.append('<li><a class="pull-right btn-bottom" href="./mes_notifications.php">Toutes mes notifications</a></li>');
                    // On a lu toutes les notifications
                    htmlCounter.html('0');

                    // Activation des liens
                    $("body").notificationClickToMarkAsConsulteAndGoTo();
                }
                // Aucun résultat
                else {          
                    htmlList.append('<li class="notification notification-no-result">Vous retrouverez ici les 5 dernières notifications concernant les revues et les auteurs que vous suivez, ainsi que des messages importants liés à votre compte. <a href=\"https://aide.cairn.info/article/175-comment-parametrer-mes-notifications\" target=\"_blank\">En savoir plus</a></li>');
                }
            });
        });
        return self;
    }


    $.fn.notificationClickToMarkAsConsulteAndGoTo = function(options) {
        var self = this;
        var settings = $.extend({
            trigger:            '.notification-link',
            attrId:             'data-notification-id',
            attrUrl:            'data-notification-url'
        }, options);

        self.find(settings.trigger).click(function() {
            // Identification du suivi
            var myBtn       = $(this);
            var idStatut    = myBtn.attr(settings.attrId);
            var url         = myBtn.attr(settings.attrUrl);

            // Marquage de la notification comme lue 
            $.get("./index.php?controleur=User&action=markAsConsulteNotification",{idStatut:idStatut})
                .done(function( data ) {
                    window.location = url;
                }
            );
        });
    }


    $.fn.notificationToggleSubscribe = function(options) {
        var self = this;
        var settings = $.extend({
            trigger:            '.notification-trigger',
            attrId:             'data-id-notification',
            attrType:           'data-notification-type',
            attrKey:            'data-notification-key',
            attrBool:           'data-notification-bool',
            attrHideOnRemove:   'data-notification-hide-on-remove',
            attrLabelToFollow:  'data-notification-label-tofollow',
            attrLabelFollowed:  'data-notification-label-followed',
            attrLabelToremove:  'data-notification-label-toremove',
            attrLabelLoading:   'data-notification-label-loading',
        }, options);

        self.find(settings.trigger).filter(function(index, elem) {
            return $(elem).data('$$alreadySubscribeNotification') !== 1;
        }).data('$$alreadySubscribeNotification', 1).click(function() {
            
            // Identification du suivi
            var myBtn   = $(this);
            var key     = myBtn.attr(settings.attrKey);
            var type    = myBtn.attr(settings.attrType);
            var btnId   = myBtn.attr(settings.attrId);

            // Vérification de la conformité des données
            if(key != "" && type != "") {
            
                // Parcours de tous les boutons identique de la page
                $("a[data-id-notification='"+btnId+"']").each(function(e) {
                
                    // Récupération des données
                    var isIconOnly   = $(this).data("notificationIsicononly");    // Est-ce que l'icon est accompagné d'un libellé ?
                    var btnType      = $(this).data("notificationBtntype");       // Type de bouton (texte, icon, ...)
                    var loadingLabel = $(this).data("notificationLabelLoading");  // Message de chargement
                    
                    // Marquage du bouton comme occupé
                    // ICON uniquement
                    if(btnType == "icon") {
                        $(this).html('<img style=\"width: 32px;\" src=\"./static/images/loading.gif\" />');
                    }
                    // ICON & NOM
                    else {
                        $(this).html('<span class=\"name\">'+loadingLabel+'</span>').fadeTo(0, 0.5);;
                    }                    
                });

                // Envoie de la requête
                $.post("./index.php?controleur=User&action=toggleFollowing",{type:type, key:key})
                    .done(function( data ) {
                        
                        // Récupération des valeurs du callback
                        var data   = JSON.parse(data); // Transformation du string en tableau JSON
                        var action = data["action"];
                        var statut = data["statut"];

                        // Parcours de tous les boutons identique de la page
                        $("a[data-id-notification='"+btnId+"']").each(function(e) {
                            
                            // Définition du type de bouton
                            var isIconOnly      = $(this).data("notificationIsicononly");     // Est-ce que l'icon est accompagné d'un libellé ?
                            var btnType         = $(this).data("notificationBtntype");        // Type de bouton (texte, icon, ...)
                            var hideOnRemove    = $(this).data("notificationHideOnRemove");   // Doit on supprimer le bloc parent ? (1 = OUI, 0 = NON)

                            // Action effectuée
                            if(statut == 1) {
                                // AJOUT
                                if(action == "add") {
                                    // Récupération des valeurs et définition des éléments du bouton
                                    // DESKTOP
                                    if(browserInfos.isMobile() === false) {
                                        var title           = $(this).data("notificationLabelFollowed");
                                        var titleTooltip    = $(this).data("notificationLabelToremove");
                                        var btnName         = " <span class=\"name\">"+title+"</span>";
                                        var btnIcon         = "<span class=\"icon-cairn-checked\"></span> ";
                                        var isFollowed      = true;
                                        var wtAction        = $(this).attr('data-webtrends-action');
                                        wtAction            = wtAction.replace("OnFollow", "OnUnfollow");
                                    }
                                    // MOBILE
                                    else {
                                        var title           = $(this).data("notificationLabelFollowed");
                                        var titleTooltip    = $(this).data("notificationLabelToremove");
                                        var btnName         = " <span class=\"name\">"+title+"</span>";
                                        var btnIcon         = "<span class=\"icon-cairn-remove\"></span> ";
                                        var isFollowed      = true;
                                        var wtAction        = $(this).attr('data-webtrends-action');
                                        wtAction            = wtAction.replace("OnFollow", "OnUnfollow");
                                    }
                                }

                                // SUPPRESSION
                                if(action == "remove") {
                                    // Récupération des valeurs et définition des éléments du bouton
                                    var title           = $(this).data("notificationLabelTofollow");
                                    var titleTooltip    = title;
                                    var btnName         = " <span class=\"name\">"+title+"</span>";
                                    var btnIcon         = "<span class=\"icon-cairn-add\"></span> ";
                                    var isFollowed      = false;
                                    var wtAction        = $(this).attr('data-webtrends-action');
                                    wtAction            = wtAction.replace("OnUnfollow", "OnFollow");

                                    // Suppression du bloc parent du bouton
                                    if(hideOnRemove == "1") {
                                        $(this).closest(".article-list-item").animate({ "marginLeft": "+=1000px", "marginBottom": "-30px", "padding": 0, "opacity": 0, "width": 0, "height": 0 }, "slow", function() {$(this).remove();} );
                                    }
                                }

                                // Si il s'agit d'un bouton complet (ICON + Texte), on n'affiche pas le Tooltips
                                //if(isIconOnly == "0") { titleTooltip = ""; }
                                //if(isIconOnly == "1") { btnName = ""; }
                                if(btnType == "icon") { btnName = ""; }
                                if(btnType == "texte" || "shortText") { titleTooltip = ""; }
                                if(btnType == "shortText") { btnIcon = ""; }

                                // Modification du bouton (ET du tooltip -> @https://stackoverflow.com/questions/9501921/change-twitter-bootstrap-tooltip-content-on-click)
                                $(this).html(btnIcon+btnName).attr("data-notification-bool", isFollowed).attr("title", titleTooltip).attr("data-webtrends-action", wtAction).tooltip('fixTitle').fadeTo(0, 1);
                            }
                            // Erreur
                            else {
                                $(this).html('Erreur...');
                            }
                        });
                    }
                );
            }
        })
    }


    $.fn.notificationUnsubscribe = function(options) {
    }

    // cairn.notification.toggleSubscribe = function($elem, type, key, hasSubscribe) {
    //     "use strict";
    //     // Initialisation
    //     if (cairn.notification.$$hasSubscribe[type + key] === undefined) {
    //         cairn.notification.$$hasSubscribe[type + key] = hasSubscribe;
    //     }
    //     if (cairn.notification.$$hasSubscribe[type + key]) {
    //         var action = 'unsubscribeNotifications';
    //     } else {
    //         var action = 'subscribeNotifications';
    //     }
    //     var url = './?controleur=User&action=' + action;
    //     url += '&typeNotifications={0}&keyNotifications={1}'.format(type, key);
    //     $.post(url).then(function() {
    //         cairn.notification.$$hasSubscribe[type + key] = !cairn.notification.$$hasSubscribe[type + key];
    //         $elem.find('span').toggle();
    //     });
    // }

    // cairn.notification.unsubscribe = function($type, $key) {
    //     "use strict";
    // }
})(jQuery);
