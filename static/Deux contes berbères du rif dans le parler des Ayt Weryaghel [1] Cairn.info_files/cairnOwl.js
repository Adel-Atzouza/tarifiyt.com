/*
 * Projet : CAIRN
 * Date du projet : Aout 2021
 *
 * Description :
 * Ce plugin permet la génération uniforme des
 * différents carousels sur cairn.info
 *
 * Remarque : ce plugin remplace cairnOwlCoverResizer.js
 * qui n'était plus utilisé
 * 
 */
(function($) {
    // Générateur de carrousel
    $.fn.owlCreator = function(params) {

        // Paramètres par défaut du carrousel
        var settings = {
            onInitialized: $( ".my-lists-content" ).fadeIn( "slow"),
            loop : true,
            nav : true,
            margin : 10,
            mouseDrag : false,
            navText: ['',''],
            responsive : {
                   0 : { items : 1, slideBy: 1, loop: true },
                 600 : { items : 2, slideBy: 2, loop: true },
                 768 : { items : 3, slideBy: 3, loop: true },
                 992 : { items : 4, slideBy: 4, loop: true },
                1200 : { items : 5, slideBy: 5, loop: true }
            }
        };

        // Mixage des paramètres
        settings = $.extend(settings, params);

        // Création des carrousels
        this.each(function() {

            // GENERATION DU CARROUSEL
            // Exécution du carousel
            $(this).owlCarousel(settings);


            // SUPPRESSION DE LA NAVIGATION
            // Si il n'y a pas de clone OU si il n'y a qu'une seule page,
            // on affiche pas les flèches de navigation, ni les puces
            if(!$(this).find('.owl-item.cloned').length || $(this).find('.owl-dot').length == 1) {
                $(this).find('.owl-controls').hide();
            }


            // GENERATION DES PUCES DE NAVIGATION
            // Initialisation des puces
            owlDotsInit($(this));
            // Mise à jour des puces
            $(this).on('changed.owl.carousel', function(event) { owlDotsInit($(this)); });
            $(this).on('resized.owl.carousel', function(event) { owlDotsInit($(this)); });
            $(this).on('refreshed.owl.carousel', function(event) { owlDotsInit($(this)); });
        });
    }

    // Initialisation des puces
    // Schéma
    // X, X-1 et X+1 => grand
    // X-2 et X+2 => moyen
    // X-3 et X+3 => petit
    // X-3+ et X+3+ => none
    function owlDotsInit(dots) {
        // Paramètres
        var countDots = dots.find('.owl-dot').length;           // Nombre de puces
        var position  = dots.find('.owl-dot.active').index();   // Position courrante

        // Big dots : N, N+1, N-1 (défaut), sauf si 1er et dernier
        bigprev     = position-1;
        bignext     = position+1;
        bigcurrent  = position;

        // Modification des points si il y a plus de 4 pages
        if(countDots > 4) {
            // Parcours des puces
            for(i = 0; i < countDots; i++) {

                // Reset
                dots.find('.owl-dot:eq('+i+')').removeClass('big');
                dots.find('.owl-dot:eq('+i+')').removeClass('medium');
                dots.find('.owl-dot:eq('+i+')').removeClass('small');
                dots.find('.owl-dot:eq('+i+')').removeClass('none');

                // Assignation des styles
                if(i == position || i == position-1 || i == position+1) {
                    dots.find('.owl-dot:eq('+i+')').addClass('big');
                }
                else if(i == position-2 || i == position+2) {
                    dots.find('.owl-dot:eq('+i+')').addClass('medium');
                }
                else if(i == position-3 || i == position+3) {
                    dots.find('.owl-dot:eq('+i+')').addClass('small');
                }
                else {
                    dots.find('.owl-dot:eq('+i+')').addClass('none');
                }
            }
        }
    }

})(jQuery);

