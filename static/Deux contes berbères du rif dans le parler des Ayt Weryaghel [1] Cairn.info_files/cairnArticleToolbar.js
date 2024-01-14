/*
 * Projet : CAIRN-PLUS
 * Date du projet : Mid. 2017
 *
 * Description :
 * Permet d'optimiser le positionnement de la toolbar des articles (PDF, Imprimer, etc.)
 * en fonction de la taille de la fenêtre du navigateur
 * 
 */
(function($) {
    $.fn.articleToolBarPosition = function() {
    	
    	// Initialisation
    	repositionToolsBar();

    	// Détection d'un redimensionnement
    	$(window).resize(function() {
			repositionToolsBar();
    	});
    };

    function repositionToolsBar(e) {
    	
    	// Récupération des valeurs
        var windowWidth                 = $(window).width();
        var containerWidth              = $("#article-content .tabs-panel").width();
        
        // Uniquement si la fenêtre fait plus de 1300px de large
        if(windowWidth > 1300) {
            var emptySpace              = windowWidth-containerWidth;
            var guardSpace              = 15; // (px)
            var bootstrapDefaultMargin  = 15; // (px)
            var movement                = (emptySpace/2)-guardSpace; // Calcul du mouvement à effectuer

            // Repositionnement des éléments
            $('#article-content .article-toolsbox').css('right', -(movement));
            $('#article-content .article-toolsbox').css('display', 'block');
        }
        else if(windowWidth < 1300 && windowWidth >= 1185) {
            // Repositionnement des éléments
            $('#article-content .article-toolsbox').css('right', '-190px');
            $('#article-content .article-toolsbox').css('display', 'block');
        }
        // Aucun changement
        else {
            // Repositionnement des éléments
            $('#article-content .article-toolsbox').css('display', 'none');
        }
    }

})(jQuery);