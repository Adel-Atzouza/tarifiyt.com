/*
 * Projet : CAIRN-PLUS
 * Date du projet : Mid. 2017
 *
 * Description :
 * Par défaut, Bootstrap permet d'afficher et/ou de cacher une série d'élément HTML
 * grâce, notamment, à une class .in 
 *
 * Cependant, dans le cas où l'on redimensionne la page, il peut y avoir des problèmes
 * d'affichage de ces éléments. Par exemple :
 * 1) si on passe d'un affichage DESKTOP à MOBILE, le menu qui devrait être caché ne l'est pas. On doit donc par défaut, sous une certaine taille de page, cacher automatiquement le menu.
 * 2) si après avoir caché le menu en MOBILE et que l'on repasse en DESKTOP, le menu restera caché. On doit donc par défaut, au dessus d'une certaine taille de page, afficher automatiquement le menu.
 * 
 */
(function($) {
	var breakpoint = 992;

	$.fn.filterMenu = function() {

		// Conservation de la taille
		var width = $(window).width();

		// Activation au chargement
		defaultFilterMenuDisplay();
		
		// Détection d'un redimensionnement
		$(window).resize(function() {
			// GESTION DE L'OUVERTURE ET FERMETURE DU PANEL
			// Définition de la nouvelle taille
			var nWidth = $(this).width();

			// Changement de taille
			if(nWidth != width) {
				width = nWidth;
				defaultFilterMenuDisplay();
			}

			// GESTION DU MODE STICKY
			// Définition de la cible
			var target = ".filter-menu .fit-in-screen";					
			// Désactivation sur mobile
			if($(window).width() < breakpoint) { $(target).unstick(); }
			// Activation du mode sticky
			else {				
				$(target).sticky({
					zIndex: 999,
					topSpacing: 20,
					bottomSpacing: 300
				});
			}
		});
	};

	function defaultFilterMenuDisplay(e) {
		
		// Définition des valeurs
		//var breakpoint 	= 992;
		var windowWidth = $(window).width();

		// SM, MD & LG - Afficher par default
		if(windowWidth >= breakpoint) {
			$('.filter-menu').addClass('in');
		}
		// XS - Cacherpar défault
		else {
			$('.filter-menu').removeClass('in');
		}
	}

})(jQuery);