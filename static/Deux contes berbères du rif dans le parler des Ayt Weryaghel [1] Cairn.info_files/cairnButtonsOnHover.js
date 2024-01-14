/*
 * Projet : CAIRN-PLUS
 * Date du projet : Mid. 2017
 *
 * Description :
 * Permet de gérer l'affichage d'un texte secondaire lors du Roll-hover "Following" (auteur et revue)
 *
 * Attention, suite au ticket #121177, sur mobile, le message du survol doit être affiché par défaut et on 
 * empêche le changement du label au survol pour éviter le problème de double tap/touch sur mobile.
 */
(function($) {

    // Affichage du message d'invitation à la suppression dans le bouton de suivi.
    $.fn.followingButtonOnHover = function() {

        // DESKTOP
        if(browserInfos.isMobile() === false) {

        	// Modification du label du bouton au passage de la souris
        	$(document).on("mouseenter", "a[data-notification-bool='true']", function() {

                // Label de chargement
                var loadingLabel = $(this).data("notificationLabelLoading");  // Message de chargement
                var btnType      = $(this).data("notificationBtntype");       // Type de bouton (texte, icon, ...)

        		// Uniquement sur un bouton inactif
        		if($(this).children(".name").html() != loadingLabel) {
    	    		// Définition
                    btnLabelName  = $(this).data("notificationLabelToremove");
    	    		btnLabel      = "<span class=\"name\">"+btnLabelName+"</span>";
    	        	btnIcon       = "<span class=\"icon-cairn-remove\"></span> ";

                    // Définition du bouton
                    if(btnType == "icon") { btnName = ""; }
                    if(btnType == "shortText") { btnIcon = ""; }

    	    		// Modification du texte
    	    		$(this).html(btnIcon+btnLabel);
    	    	}
        	});

        	// Retour à la normal
        	$(document).on("mouseleave", "a[data-notification-bool='true']", function() {

                // Label de chargement
                var loadingLabel = $(this).data("notificationLabelLoading");  // Message de chargement
                var btnType      = $(this).data("notificationBtntype");       // Type de bouton (texte, icon, ...)

        		// Uniquement sur un bouton inactif
        		if($(this).children(".name").html() != loadingLabel) {
    	    		// Définition du nouveau bouton
    	    		btnLabelName = $(this).data("notificationLabelFollowed");
                    btnLabel     = "<span class=\"name\">"+btnLabelName+"</span>";
    	        	btnIcon      = "<span class=\"icon-cairn-checked\"></span> ";

                    // Définition du bouton
                    if(btnType == "icon") { btnName = ""; }
                    if(btnType == "shortText") { btnIcon = ""; }

    	    		// Modification du texte
    	    		$(this).html(btnIcon+btnLabel);
        		}
        	});
        }
        // MOBILE
        else {
            // On affiche directement le message d'invitation à la suppression
            $("a[data-notification-bool='true']").each(function( index ) {
                // Type de bouton (texte, icon, ...)
                btnType      = $(this).data("notificationBtntype");

                // Définition du nouveau bouton
                btnLabelName = $(this).data("notificationLabelToremove");
                btnLabel     = "<span class=\"name\">"+btnLabelName+"</span>";
                btnIcon      = "<span class=\"icon-cairn-remove\"></span> ";

                // Définition du bouton
                if(btnType == "icon") { btnName = ""; }
                if(btnType == "shortText") { btnIcon = ""; }

                // Modification du texte
                $(this).html(btnIcon+btnLabel);
            });
        }
    };

})(jQuery);

/*
 * Projet : CAIRN-PLUS
 * Date du projet : Mid. 2017
 *
 * Description :
 * Permet de gérer l'affichage d'un texte secondaire lors du Roll-hover des boutons "Ma Bibliographie"
 */
(function($) {

    // Affichage du message d'invitation à la suppression dans le bouton de bibliographie.
    $.fn.bibliographieButtonOnHover = function() {

        // DESKTOP
        if(browserInfos.isMobile() === false) {
            
            // Modification du label du bouton au passage de la souris
            $(document).on("mouseenter", "a[data-biblio-bool='true'][data-biblio-isIconOnly='0']", function() {

                // Label de chargement
                var loadingLabel = $(this).data("biblioLabelLoading");  // Message de chargement
                var btnType      = $(this).data("notificationBtntype");       // Type de bouton (texte, icon, ...)

                // Uniquement sur un bouton inactif
                if($(this).children(".name").html() != loadingLabel) {
                    // Définition
                    btnLabelName    = $(this).data("biblioLabelToremove");
                    btnLabel        = "<span class=\"name\">"+btnLabelName+"</span>";
                    btnIcon         = "<span class=\"icon icon-biblio-remove\"></span> ";

                    // Définition du bouton
                    if(btnType == "icon") { btnName = ""; }
                    if(btnType == "shortText") { btnIcon = ""; }

                    // Modification du texte
                    $(this).html(btnIcon+btnLabel);
                }
            });

            // Retour à la normal
            $(document).on("mouseleave", "a[data-biblio-bool='true'][data-biblio-isIconOnly='0']", function() {

                // Label de chargement
                var loadingLabel = $(this).data("biblioLabelLoading");  // Message de chargement
                var btnType      = $(this).data("notificationBtntype");       // Type de bouton (texte, icon, ...)

                // Uniquement sur un bouton inactif
                if($(this).children(".name").html() != loadingLabel) {
                    // Définition du nouveau bouton
                    btnLabelName    = $(this).data("biblioLabelAdded");
                    btnLabel        = "<span class=\"name\">"+btnLabelName+"</span>";
                    btnIcon         = "<span class=\"icon icon-biblio-checked\"></span> ";

                    // Définition du bouton
                    if(btnType == "icon") { btnName = ""; }
                    if(btnType == "shortText") { btnIcon = ""; }

                    // Modification du texte
                    $(this).html(btnIcon+btnLabel);
                }
            });
        }
        // MOBILE
        else {
            // On affiche directement le message d'invitation à la suppression
            $("a[data-biblio-bool='true']").each(function( index ) {
                // Type de bouton (texte, icon, ...)
                btnType      = $(this).data("notificationBtntype");

                // Définition du nouveau bouton
                // btnLabelName = $(this).data("biblioLabelToremove");
                btnLabelName = "";
                btnLabel     = "<span class=\"name\">"+btnLabelName+"</span>";
                btnIcon      = "<span class=\"icon icon-biblio-remove\"></span> ";

                // Définition du bouton
                if(btnType == "icon") { btnName = ""; }
                if(btnType == "shortText") { btnIcon = ""; }

                // Modification du texte
                $(this).html(btnIcon+btnLabel);
            });
        }
    };

})(jQuery);