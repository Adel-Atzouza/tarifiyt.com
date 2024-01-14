/*
 * Projet : CAIRN-PLUS
 * Date du projet : Mid. 2017
 *
 * Description :
 * Permet de calculer automatiquement le nombre de cible présent dans une liste et
 * de changer le titre en fonction du nombre (singulier/pluriel)
 *
 * Utilisation :
 * Il faut appeler le plugin $().articleMediaCounter(options) sur la page que l'on souhaite.
 *
 * HTML :
 * Le target est généralement un titre et doit contenir deux spans ["data-counter='counter'"] ET ["data-counter='name'"]. 
 * Les deux balises peuvent être pré-remplies ou non.
 * 
 * Le target aura deux attributs ["data-titre-single=''"] et ["data-titre-plural=''"] avec respectivement le titre au 
 * singulier et le titre au pluriel souhaité.
 *
 * Exemple :
 *  <h2 class="title-subdivision" data-titre-single="titre_au_singulier" data-titre-plural="titre_au_pluriel">
 *      <span data-counter="counter"></span> 
 *      <span data-counter="name"></span>
 *  </h2>
 */
(function($) {

    $.fn.articleMediaCounter = function(options) {

        // Définition des options
        var settings = $.extend({
            target           : "h2.title-subdivision.counter",   // Titre cible contenant le compteur.
            targetChild      : "",                               // Balise contenant les éléments à compter. A définir si les éléments ne suivent pas directement le target.
            toCount          : "div.media",                      // Elements à compter.
            deleteIfZero     : true,                             // Supprime le titre et le reste si le compteur arrive à zero.
            countLabelIfZero : "",                               // Défini le compteur à afficher si il arrive à zéro. Attention, ne fonctionne que si deleteIfZero est sur false.
        }, options );
    	
    	// Initialisation
    	counter(settings);

        // Valeur initial du nombre d'élément
        var total = getTotal(settings.toCount);

    	// Détection d'un changement
        setInterval(function() {
            var totalCheck = getTotal(settings.toCount);            
            if(total != totalCheck) {
                counter(settings);
                total = totalCheck;                
            };
        }, 1000);
    };


    // Calcul le nombre d'un élément et renvoi la valeur
    function getTotal(target) {
        return $(target).length;
    }


    // Calcul le nombre d'élément et modifie les données affichées
    function counter(options) {

        // Définition des options
        var target          = options.target;
        var targetChild     = options.targetChild;
        var toCount         = options.toCount;
        var deleteIfZero    = options.deleteIfZero;
        var countLabelIfZero= options.countLabelIfZero;

        // Parcours des cibles
        $(target).each(function( index ) {

            // Récupération des titres
            var titreSingle  = $(this).data("titreSingle");
            var titrePlural  = $(this).data("titrePlural");

            // Calcul du nombre de media        
            if(targetChild == "") {
                var count = $(this).nextAll(toCount).length;
            }   
            else {
                var count = $(this).next(targetChild).children(toCount).length;
            }
            
            // Remplacement du nombre
            $(this).children("[data-counter='counter']").html(count);
            
            // Attribution du titre
            // Singulier
            if(count == 1) {
                $(this).children("[data-counter='name']").html(titreSingle);
            }
            // Pluriel
            else if(count > 1) {
                $(this).children("[data-counter='name']").html(titrePlural);
            }
            // Suppression
            else {
                if(deleteIfZero) {
                    $(this).remove();
                    $(this).nextAll(toCount).remove();
                }
                else {
                    if(countLabelIfZero != "") {
                        $(this).children("[data-counter='counter']").html(countLabelIfZero);
                    }
                }
            }
        });   	
    }

})(jQuery);