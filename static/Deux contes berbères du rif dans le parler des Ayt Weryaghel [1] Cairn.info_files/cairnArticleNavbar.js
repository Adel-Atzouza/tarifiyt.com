/*
 * Projet : CAIRN-PLUS
 * Date du projet : Mid. 2017
 *
 * Description :
 * Ce plugin gère la barre de navigation et l'affichage des panneaux (DESKTOP) et
 * le changement de label du menu dropdown (MOBILE)
 *
 */
(function($) {
    var currentTab = null;
    
    // Selon la langue du portail, on utilise ?contenu= ou ?content= dans l'URL
    // if(window.IS_CAIRN_INT) { contentParam = "content"; }
    // else { contentParam = "contenu"; }

    // Pour ne pas chambouler les stats, j'initialise pour l'instant à "contenu"
    contentParam = "contenu";

    // Le tracking des changements d'onglet n'est initialement pas activé.
    // Parce que le premier click d'un onglet est émulé au chargement de la page.
    var trackingSwitchTabs = false;

    $.fn.articleNavbar = function(selectorTabContent) {
        self = this;
        if (!self.length) return;
        $.fn.articleNavbar.$$navbar = self;

        var tabs = self.find('li');
        if (!tabs.length) return;
        $.fn.articleNavbar.$$tabs = tabs;

        var tabContent = $(selectorTabContent);
        if (!tabContent.length) return;
        $.fn.articleNavbar.$$tabContent = tabContent;

        var tabContentPanels = tabContent.find('.tabs-panel');
        if (!tabContentPanels.length) return;
        $.fn.articleNavbar.$$tabContentPanels = tabContentPanels;

        // On change de panneau au moment du click
        tabs.find('a[data-toggle="tab"]').click(function(event) {
            event.preventDefault();
            // Récupération des valeurs
            var target = $(this).data('target');
            // Changement des panneaux
            $.fn.articleChangeTab(target);
            // #123348 - Mise à jour du matchHeight
            $.fn.matchHeight._update();
            // Changement de l'url
            changeUrl(target);
            return false;
        });


        var urlParams = cairn.parse_GET();
        if (urlParams[contentParam]) {
            if (urlParams[contentParam] instanceof Array) {
                // Dans le cas d'url type
                // ?controleur=Pages&HTML=1&ID_ARTICLE=AG_660_0129&contenu=article&contenu=resume
                // on récupère le dernier contenu
                urlParams[contentParam] = urlParams[contentParam][urlParams[contentParam].length - 1];
            }
            // Exécution du script mentionné dans le bouton
            $("a[data-target='"+urlParams[contentParam]+"']").first().click();
        }
        // On bascule sur le tracking des changements d'onglets
        // Je serre les fesses pour que les clicks ne soient pas asynchrone....
        trackingSwitchTabs = true;

        // Changement du hash
        function changeUrl(target) {
            var params = cairn.parse_GET();
            params[contentParam] = target;
            // history.pushState(null, null, '#' + target);
            history.pushState(null, null, '?' + $.param(params));
        }
    };

    var $$offsetTabs = {};
    // Changement du panel
    $.fn.articleChangeTab = function(target) {
        // Vérification de la présence d'une navbar
        var navBar = $.fn.articleNavbar.$$navbar;
        if (!navBar) return;
        // Vérification de la présence d'un panel
        var tabPanelId = 'panel-' + target;
        var panel = $.fn.articleNavbar.$$tabContentPanels.filter('#' + tabPanelId);
        if (!panel.length) return;

        // Définitions
        var tabs = $.fn.articleNavbar.$$tabs;
        var tabContentPanels = $.fn.articleNavbar.$$tabContentPanels
        var previousPannel = tabContentPanels.filter('.active');

        // Enregistrement de la position du panneau pour le retrouver plus tard
        var isSticky = $('#sticky-nav-sticky-wrapper.is-sticky').length > 0;
        if (isSticky) {
            $$offsetTabs[previousPannel.attr('id')] = $(window).scrollTop();
        } else {
            delete $$offsetTabs[previousPannel.attr('id')];
        }

        // Marquage de l'onglet actif
        previousPannel.removeClass('active');
        panel.addClass('active');
        panel.trigger('click');
        // Réinitialisation des panneaux
        // tabContentPanels.hide();
        tabContentPanels.removeClass('show').addClass('hidden');
        // Affichage du panneau sélectionné
        // panel.show();
        panel.removeClass('hidden')
            .addClass('show') // à la place de .show()
            .addClass('has-been-clicked');  // pour filtrer les trucs non chargés
        // Activation de l'onglet
        tabs.filter('.active').removeClass('active');
        var label = tabs.find('a[data-target="'+target+'"]').parent('li').first().addClass('active').text();
        // Changement du nom du menu mobile
        var menuDropdown = $.fn.articleNavbar.$$tabs.find('#dropdown-article-menu').parent('li');
        menuDropdown.children("a").children(".dropdown-name-wrapper").children(".name").html(label);
        if (menuDropdown.hasClass('open')) {
            menuDropdown.removeClass('open');
        }

        // Scolling vers le moment précédemment enregistré
        if ($$offsetTabs.hasOwnProperty(tabPanelId)) {
            $(document).scrollTop($$offsetTabs[tabPanelId]);
        }
        // Pas d'historique de position
        else {
            // En mode Sticky, on place la vue au niveau de la barre de navigation
            if (isSticky) {
                $(document).scrollTop(panel.offset().top - 50);
            }
            // Sans mode sticky, on remonte en haut de la page (ex.: au chargement de la page)
            else {
                $(document).scrollTop(0);
            }
        }

        // C'est du code spécifique à la page article
        // Chaque fois qu'on change d'onglet, on enregistre une ligne dans la BDD
        // de stats.
        // L'idéal aurait été que ce code soit dans le JS spécifique aux articles.
        // Mais il aurait peut être fallu déplacer des machins, et j'ai pas le courage.
        var dataTracking = panel.data('tracking');
        if (dataTracking && trackingSwitchTabs && (target !== currentTab)) {
            $.post('index.php?controleur=Pages&action=trackingSwichContenu', {
                data: dataTracking,
                content: target,
            });
        }
        currentTab = target;
    }

})(jQuery);
