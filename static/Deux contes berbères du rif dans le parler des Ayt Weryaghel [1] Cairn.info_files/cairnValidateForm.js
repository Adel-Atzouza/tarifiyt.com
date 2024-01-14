/*
 * Projet : CAIRN-PLUS
 * Date du projet : Mid. 2017
 *
 * Description :
 * Le plugin d'écoute des formulaires a été créé pour permettre de
 * valider les éléments des formulaires en direct et non pas uniquement
 * lors de la soumission du formulaire (bien qu'on puisse ajouter cette option).
 *
 * Certaines fonctions ont été placées dans un objet JS afin d'être directement
 * disponible depuis un fichier JS ou AJAX. C'est le cas pour les fonctions de gestion
 * des messages de feedback (removeFeedback, addFeedback, removeHasState, addHasState, ...)
 *
 * Si on souhaite exclure un formulaire de l'écoute, il suffit de lui ajouter
 * la classe .dontlistentome pour l'ignorer.
 *
 * /!\ Les formulaires et les champs DOIVENT AVOIR un ID pour être écouté.
 *
 */
(function($) {
    $.fn.listenToValidate = function() {

    	// Parcours des formulaires
		this.each(function() {

			// Récupération des valeurs
			var idForm 		= this.id;
			var nameForm 	= this.name;
			var classForm  	= this.className;

			//console.log(idForm);

			// Parcours des formulaires avec ID ou NAME (sans interdiction de suivi)
			if((nameForm != '' || idForm != '') && (classForm.indexOf("dontlistentome") == -1)) {

				// Définition des options
				var options = {"idForm":idForm}

				// Détection des événements
				// Sortie du focus
				$(document).on('blur', 'form#'+idForm+' input', options, validateFieldOnBlur);
				$(document).on('blur', 'form#'+idForm+' textarea', options, validateFieldOnBlur);
				$(document).on('blur', 'form#'+idForm+' select', options, validateFieldOnBlur);
				$(document).on('change', 'form#'+idForm+' select', options, validateFieldOnBlur);
				$(document).on('change', 'form#'+idForm+' input[type=checkbox]', options, validateFieldOnBlur);

				// Vérification de l'équivalence
				$(document).on('blur', 'form#'+idForm+' [data-be-equal-to]', options, checkIfEqual);

				// Control-Action
				$(document).on('focus', 'form#'+idForm+' .form-control-action', options, toggleActionBtn);
				$(document).on('blur', 'form#'+idForm+' .form-control-action', options, toggleActionBtn);

				// Bouton action
				$(document).on('click', 'form#'+idForm+' a[data-action=\'reset\']', options, resetValue);
				$(document).on('click', 'form#'+idForm+' a[data-action=\'viewpassword\']', options, toggleViewPassword);

				// Champ Auto-complete
				$(document).on('keydown', 'form#'+idForm+' .ui-autocomplete-input', options, goTopOfFieldOnMobile);

				// Soumission du formulaire
				$(document).on('click', 'form#'+idForm+' [type=submit], form#'+idForm+' [id=submit]', function(e) {

					// Parcours des champs required
					$('form#'+idForm).find('[required=required]').each(function() {

						// Données du champs
					    var idField   		= this.id;
					    var typeField 		= this.type;
					    var valueField		= this.value;
					    var idForm 			= idForm;

					    // Le champ fait-il partie d'un group "has-feedback" ?
			    		var hasFeedback = 0;
			    		var parentClass = $(this).closest(".form-group").prop('className');

			    		// Gestion des champs avec feedback
			    		if(parentClass.indexOf("has-feedback") >= 0) {
			    			var hasFeedback = 1;
			    		}

			    		// Validation du champ
    					frmAction.validationFieldForm(idField, typeField, valueField, hasFeedback);
					});

					// Parcours des champs requis par pair
					$('form#'+idForm).find('[data-required-check-type=bypair][data-required-by-pair=1]').each(function() {

						// Données du champs
					    var idField   		= this.id;
					    var targetField     = $('#'+idField).data('checkPair');
					    var idForm 			= idForm;

					    // Validation du champ
    					frmAction.validationFieldFormByPair(idField, targetField);
					});

					// Calcul du nombre de champ non-rempli
					var count = $('form#'+idForm+' [data-is-valid=0]').length;

					// Récupération de la valeur du data-is-valid pour l'affichage d'une modal d'erreur
					var mdpIsValid = $('#mdp, #newPwd').attr('data-is-valid');
					if(count != 0) {
						// Le formulaire n'est pas exécuté
						e.preventDefault();
						// On remonte jusqu'au premier champ qui pose problème
						$('body,html').animate({scrollTop: jQuery('form#'+idForm+' [data-is-valid=0]').first().offset().top},500);
						if(mdpIsValid == 0){
							$('#modal-erreur-pswd').modal('show');
						}
					}
				});
			}
    	});
    };



    // Validation des champs
    function validateFieldOnBlur(e) {

    	// Données du champs
	    var idField   		= this.id;
	    var nameField 		= this.name;
	    var typeField 		= this.type;
	    var requiredField 	= this.required;
	    var valueField		= this.value;
	    var idForm 			= e.data.idForm;

    	// Vérification des champs obligatoires uniquement
    	if(requiredField === true) {

    		// Le champ fait-il partie d'un group "has-feedback" ?
    		var hasFeedback = 0;
    		var parentClass = $(this).closest(".form-group").prop('className');

    		// Gestion des champs avec feedback
    		if(parentClass.indexOf("has-feedback") >= 0) {
    			var hasFeedback = 1;
    		}

    		// Validation du champ
    		frmAction.validationFieldForm(idField, typeField, valueField, hasFeedback);
	    }
    }

    // Afficher/Cache le bouton de contrôle d'un champ (reset, viewpassword, ...)
    function toggleActionBtn(e) {

    	// Données du champs
	    var idField	= this.id;
	    var input   = $("#"+idField);
	    var btn 	= $("#"+idField).next(".input-group-addon").children("a");

	    // Affichage du bouton
	    if (btn.css('visibility') == 'hidden' ) {
    		btn.css('visibility','visible');
	    }
	    // Suppression du bouton SSI le champ est toujours vide
  		else {
  			if(input.val() == "") {
    			btn.css('visibility','hidden');
    		}
    	}
    }

    // Suppression de la valeur du champ cible
    function resetValue() {
    	var idField = $(this).data('id');
		frmAction.resetFieldByBtn(idField);
    }

    // Afficher/Cacher le mot de passe
    function toggleViewPassword() {
    	var idField = $(this).data('id');
    	var input   = $("#"+idField);
    	var btn 	= $("#"+idField).next(".input-group-addon").children("a");

    	// On affiche la valeur
	    if (input.attr('type') == 'password' ) {
    		input.attr('type','text');
    		btn.html('visibility_off');
	    }
	    // On affiche la valeur
  		else {
  			input.attr('type','password');
  			btn.html('visibility');
    	}
    }

    // Vérifie si les données sont égales
    function checkIfEqual() {
    	// Valeur du champs cible
    	var idField 		= $(this).attr('id');
    	var valueField 		= $(this).val();
    	// Valeur du champ source
    	var idSrcField 		= $(this).data('beEqualTo');
    	var valueSrcField 	= $("#"+idSrcField).val();

    	// Comparaison des deux valeurs
    	if(valueField != valueSrcField && valueField != "") {
    		frmAction.removeFeedback(idField);
    		frmAction.addFeedback(idField, "has-error", "error", "La valeur ne correspond pas");
    	}
    }

    // Remonte l'écran au début du champ auto-complete ciblé sur mobile uniquement
    function goTopOfFieldOnMobile(e) {
    	// Données du champs
	    var idField	= this.id;

	    // Définition des valeurs
		var breakpoint 	= 544;
		var windowWidth = $(window).width();

		// Uniquement sur mobile
		if(windowWidth <= breakpoint) {
			$('body,html').animate({scrollTop: jQuery('#'+idField).offset().top},500);
		}
    }

})(jQuery);

/*
 * Remarque :
 * Les fonctions feedback ont été sortie du plugin listenToValidate afin
 * d'être disponible depuis un script JS externe
 */

// Objet JS traitant les actions effectuées sur les formulaires
frmAction = {}
// Mode debug (1)
frmAction.debug = 0;
// Définition de la langue de la page
frmAction.lang = $('html').attr('lang');
// Chargement des messages d'erreur
frmAction.msg;
$.ajax({url: "./static/js/lang-"+frmAction.lang+".json", async: false, dataType: 'json', success: function (json) {frmAction.msg = json;}});

// Vérification de la valeur du champ cible
// @param {string} idField 		- ID du champ cible
// @param {string} typeField 	- Type du champ cible (ex.: text, email, password, ...)
// @param {string} valueField 	- Valeur courante du champ cible
// @param {int}    hasFeedback 	- 0 = Non, 1 = Oui
frmAction.validationFieldForm = function(idField, typeField, valueField, hasFeedback) {

	// Initialisation des états
	var state  		= null;
	var stateMsg 	= null;
	var stateIcon 	= null;

	//  Initialisation des tableaux de valeurs
	var statesList 	= {
		"success" : [{"icon":"check", "class":"has-success"}],
		"warning" : [{"icon":"warning", "class":"has-warning"}],
		"error"   : [{"icon":"error", "class":"has-error"}]
	}
	var statesMsg   = frmAction.msg;

	// Remise à zéro du champ (suppression de l'état et du feedback)
	frmAction.removeFeedback(idField);
	frmAction.removeHasState(idField);

	// Traitement des données
	// Le champ n'est pas vide ou s'il s'agit d'un numéro de téléphone, ou s'il faut vérifier le nombre de caractères on contrôle les données
	if(valueField != "" || typeField == "tel") {

		// ---- Valeurs par défaut ----
		// Pour les champs avec Feedback, il faut définir un ICON, un MSG et une CLASS
		if(hasFeedback == 1) {
			var state 		= "success";
			var stateClass  = statesList[state][0].class;
			var stateIcon 	= statesList[state][0].icon;
			var stateMsg 	= statesMsg[state+"-"+typeField];
		}
		// Pour les champs sans Feedback, seule les erreurs sont notifiées,
		// il n'y a donc aucun ICON, aucun MSG, ni aucune CLASS
		else {
			var state 		= "success";
			var stateClass  = null;
			var stateIcon 	= null;
			var stateMsg 	= null;
		}

		// ---- Contrôle des données reçues ----
		// Password
		if(typeField == "password") {
			/* Règles des mots de passe sur cairn
			 * - 8 caractères minimums
			 * - peut contenir des caractères non-accentués en minuscule ou majuscule (a-Z et A-Z)
			 * - peut contenir des chiffres (0-9)
			 * - peut contenir des caractères spéciaux spécifiés : !$%@#
			 *
			 * Le calcul de la "force" d'un mot de passe se fait selon le calcul de N (nombre de caractères possibles)
			 * suivant le mot de passe encodé et exposant L (longueur du mot de passe).
			 * Source : https://www.ssi.gouv.fr/administration/precautions-elementaires/calculer-la-force-dun-mot-de-passe/
			 *
			 * Ex.:
			 *    AAA = Alphabétique minuscule uniquement = 26 caractères possibles = 4.7 bits x 3 donne un indice de 14
			 *    MonMonDePasse = Alphabétique minuscule et majuscule = 52 caractères possibles = 5.7 bits x 13 donne un indice de 74
			 *    MonMonDePasse123 = Alphabétique minuscule et majuscule ET numérique = 61 caractères possibles = 5.95 bits x 16 donne un indice de 95
			 *    ....
			 * Lors de la validation du mot de passe, on vérifie :
			 * - Si il contient des lettres en minuscules => N+26
			 * - Si il contient des lettres en majuscules => N+26
			 * - Si il contient des chiffres => N+10
			 * - Si il contient des caractères spéciaux spécifiés => N+5
			 *
			 * Et on additionne pour avoir le nombre total de caractères possibles. Ce nombre est ensuite transformé en valeur en bits (Math.log2(LeNombre)) et
			 * ensuite multiplié par le nombre de caractères présents dans le mot de passe.
			 *
			 * Les indices de force :
			 * de 0 à 63 	= Très faibles
			 * de 64 à 79 	= Faible
			 * de 80 à 99 	= Moyen
			 * àpd 100 		= Fort
			 */

			// Définition du type de contrôle
			/* Dans certain cas (la connexion, par exemple), il peut être obligatoire d'assouplir la règle de validation du mot de passe (notamment pour
			 * les anciens utilisateurs qui n'ont pas encore un mot de passe 'valide'). On peut ainsi valider le champ mais les avertirs que leur mot de passe
			 * n'est pas suffisemment sécurisé.
			 */
			var typeControl 		= "full";
			var fieldTypeControl 	= $("#"+idField).data("control");
			if(fieldTypeControl && fieldTypeControl != "") { typeControl = fieldTypeControl; }

			// Test de la force du mot de passe
			// Préparation des regex de contrôle (#98231)
			var regexHasMinuscule 	= /([a-z]+)/;
			var regexHasMajuscule 	= /([A-Z]+)/;
			var regexHasNumber    	= /([0-9]+)/;
			var regexHasSpecial		= /([!$%@#*?§:/;^&€£°,=+-_]+)/;
			var regexHasNotOthers 	= /^([a-zA-Z0-9!$%@#*?§:/;^&€£°,=+-_]+)$/;

			// Contrôle
			var hasMinuscule 		= regexHasMinuscule.test(valueField);
			var hasMajuscule 		= regexHasMajuscule.test(valueField);
			var hasNumber 			= regexHasNumber.test(valueField);
			var hasSpecial 			= regexHasSpecial.test(valueField);
			var hasNotOthers		= regexHasNotOthers.test(valueField); // /!\ Logique inversée - Vérifie si il n'y a pas d'autres caractères que ceux permis

			// Définition des paramètres de calcul de la force du mot de passe
			var password_valide 	= 0; // Si la valeur reste à zéro, le mot de passe ne répond pas aux critères
			var password_N			= 0;

			if(hasMinuscule === true) {var password_N = parseInt(password_N) + parseInt(26); var password_valide = 1;}
			if(hasMajuscule === true) {var password_N = parseInt(password_N) + parseInt(26); var password_valide = 1;}
			if(hasNumber === true) 	  {var password_N = parseInt(password_N) + parseInt(10); var password_valide = 1;}
			if(hasSpecial === true)   {var password_N = parseInt(password_N) + parseInt(5);  var password_valide = 1;}
			if(hasNotOthers === false){var password_valide = 0;} // Cette vérification prime sur les autres

			// Calcul de la force
			var cfpswd_N = Math.log2(password_N);
			var cfpswd_L = valueField.length;
			var cfpswd_S = Math.round( parseFloat(cfpswd_N) * cfpswd_L);

			// Affichage de la force du mot de passe UNIQUEMENT pour le mot de passe définissant
			var hasNotToBeEqualAttr = $("#"+idField).data("beEqualTo");	// Le champ ne doit pas avoir d'attribut data-be-equal-to
			var hasShowForceAttr 	= $("#"+idField).data("showForce"); // Le champ ne doit pas avoir d'attribut data-show-force OU au pire la valeur doit être true
			if((typeof hasNotToBeEqualAttr === "undefined") && (typeof hasShowForceAttr === "undefined") || hasShowForceAttr === true) {

				// Définition du niveau du mot de passe
				if(cfpswd_S <= 63) 					{ mdpLevel = "verylow"; mdpIndiceLevel = 1; }
				if(cfpswd_S > 63 && cfpswd_S <= 79) { mdpLevel = "low"; mdpIndiceLevel = 2; 	}
				if(cfpswd_S > 79 && cfpswd_S <= 99) { mdpLevel = "medium"; mdpIndiceLevel = 3; 	}
				if(cfpswd_S >= 100) 				{ mdpLevel = "high"; mdpIndiceLevel = 4; 	}

				// Définition du message
				mdpLevelMessage = statesMsg["mdp-level-"+mdpLevel];

				// Définition du nombre de bloc
				var mdpIndice 		= ""; 	// Bloc de réception
				var mdpNombreIndice = 4; 	// Total de bloc à afficher
				for(i = 0; i < mdpIndiceLevel; i++) { mdpIndice += "<span class=\"mdp-indice mdp-indice-"+mdpLevel+"\"></span>"; }
				for(i = 0; i < (mdpNombreIndice-mdpIndiceLevel); i++) { mdpIndice += "<span class=\"mdp-indice mdp-indice-default\"></span>"; }

				// En détail (indice + message)
				mdpIndiceDetails = "<span class=\"mdp-indice-details\">"+mdpIndice+" <span class=\"mdp-indice-message\">"+mdpLevelMessage+"</span></span>";

				// Remise à zéro
				$("#"+idField).closest(".form-group").children(".mdp-indice-details").remove();

				// Affichage de l'indice
				$("#"+idField).closest(".form-group").append(mdpIndiceDetails);
			}

			// Vérification du mot de passe
			// Validation stricte
			if(typeControl == "full") {
				// Mot de passe valide mais trop court
				if(password_valide == 1 && valueField.length < 8) {
					var state 		= "error";
					var stateClass  = statesList[state][0].class;
					var stateIcon 	= statesList[state][0].icon;
					var stateMsg 	= statesMsg[state+"-"+typeField+"-longueur"];
				}
				// Format du mot de passe non-valide
				else if (password_valide == 0) {
					var state 		= "error";
					var stateClass  = statesList[state][0].class;
					var stateIcon 	= statesList[state][0].icon;
					var stateMsg 	= statesMsg[state+"-"+typeField+"-format"];
				}
			}
			// Validation légère
			else if(typeControl == "light") {
				// Mot de passe valide mais trop court
				if(password_valide == 1 && valueField.length < 8) {
					var state 		= "warning";
					var stateClass  = statesList[state][0].class;
					var stateIcon 	= statesList[state][0].icon;
					var stateMsg 	= statesMsg[state+"-"+typeField+"-longueur"];
				}
				// Format du mot de passe non-valide
				else if (password_valide == 0) {
					var state 		= "warning";
					var stateClass  = statesList[state][0].class;
					var stateIcon 	= statesList[state][0].icon;
					var stateMsg 	= statesMsg[state+"-"+typeField+"-format"];
				}
			}
			// Valide
			else  {
				//console.log("VALIDE");
			}
		}
		// Validation de l'adresse e-mail
		if(typeField == "email") {
			// Test de l'adresse e-mail selon le Regex
			var regexValidationEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			var isEmailValid = regexValidationEmail.test(valueField);

			// L'e-mail n'est pas valide
			if(isEmailValid === false) {
				var state 		= "error";
				var stateClass  = statesList[state][0].class;
				var stateIcon 	= statesList[state][0].icon;
				var stateMsg 	= statesMsg[state+"-"+typeField];
			}
		}
		// Validation du numéro téléphone
		if(typeField == "tel") {
			// Test du numéro de téléphone selon le Regex
			var regexValidationTel = /^[+]*[-\s\./0-9()]*$/;
			var isTelValid = regexValidationTel.test(valueField);

			// En plus du Regex, on vérifie la longueur du numéro de téléphone
			valueField.length < 7 ? isTelValid = false : "";

			// Si le champ est vide et optionnel, on valide
			if (idField === "telephone-opt" && valueField.length === 0) {
				isTelValid = true
			}

			// Le téléphone n'est pas valide
			if(isTelValid === false) {
				var state 		= "error";
				var stateClass  = statesList[state][0].class;
				var stateIcon 	= statesList[state][0].icon;
				var stateMsg 	= statesMsg[state+"-"+typeField];
			}
		}
		// Validation des checkbox
		if(typeField == "checkbox") {
			// Vérification du statut du champ
			var isChecked = $('#'+idField).prop( "checked" );

			// Le champ n'est pas coché
			if(isChecked === false) {
				var state 		= "error";
				var stateClass  = statesList[state][0].class;
				var stateIcon 	= statesList[state][0].icon;
				var stateMsg 	= statesMsg[state+"-"+typeField];
			}
		}
	}
	// Le champ est vide => Erreur
	else {
		var state 		= "error";
		var stateClass  = statesList[state][0].class;
		var stateIcon 	= statesList[state][0].icon;
		var stateMsg 	= statesMsg[state+"-"+typeField];
	}

	// Assignation du feedback et de l'état (icon + message + bordure)
	if(hasFeedback == 1) {
		frmAction.addFeedback(idField, stateClass, stateIcon, stateMsg);
	}
	// Assignation de l'état (bordure uniquement)
	else {
		frmAction.addHasState(idField, stateClass);
	}

	// Assignation d'un statut de validation
	frmAction.updateFieldStatut(idField, state);

	// ----- Débug
	if(frmAction.debug == 1) {
		console.log("State: "+state);
		console.log("Class: "+stateClass);
		console.log("Icon: "+stateIcon);
		console.log("Msg: "+stateMsg);
	}
}

// Vérification des champs requis par pair
// Si l'un des deux champs est rempli, le formulaire est bien valide.
// @param {string} idField 		- ID du champ cible
// @param {string} targetField 	- ID du champ pair
// /!\ Les champs DOIVENT avoir une class has-feedback !
frmAction.validationFieldFormByPair = function(idField, targetField) {

	// Initialisation des états
	var state  		= "success"; // Par défaut
	var stateMsg 	= null;
	var stateIcon 	= null;

	//  Initialisation des tableaux de valeurs
	var statesList 	= {
		"success" : [{"icon":"check", "class":"has-success"}],
		"warning" : [{"icon":"warning", "class":"has-warning"}],
		"error"   : [{"icon":"error", "class":"has-error"}]
	}
	var statesMsg   = frmAction.msg;

	// Vérification des valeurs
	var srcFieldValue 		= $('#'+idField).val();
	var cblFieldValue 		= $('#'+targetField).val();
	var msg 				= $('#'+idField).data("checkMsg");

	// Remise à zéro des champs (suppression de l'état et du feedback)
	frmAction.removeFeedback(idField);
	frmAction.removeHasState(idField);

	frmAction.removeFeedback(targetField);
	frmAction.removeHasState(targetField);

	// Aucun des deux champs n'est rempli
	if(srcFieldValue == "" && cblFieldValue == "") {
		var state 		= "error";
		var stateClass  = "has-warning";
		var stateIcon 	= "warning";
		var stateMsg 	= statesMsg[state+"-bypair-"+msg];

		// Assignation du feedback et de l'état (icon + message + bordure)
		frmAction.addFeedback(idField, stateClass, stateIcon, stateMsg);
		frmAction.addFeedback(targetField, stateClass, stateIcon, stateMsg);
	}

	// Assignation d'un statut de validation
	frmAction.updateFieldStatut(idField, state);
	frmAction.updateFieldStatut(targetField, state);

	// ----- Débug
	if(frmAction.debug == 1) {
		console.log("State: "+state);
		console.log("Class: "+stateClass);
		console.log("Icon: "+stateIcon);
		console.log("Msg: "+stateMsg);
	}
}

// Supprime les informations de feedback sur un champ
// @param {string} idField 		- ID du champ cible
frmAction.removeFeedback = function(idField) {
	// Remise à zéro
	$("#"+idField).closest(".form-group").removeClass('has-success has-warning has-error'); // Parent
	$("#"+idField).closest(".form-group").children(".form-control-feedback").html(''); // Icon
	$("#"+idField).closest(".form-group").children(".form-control-feedback-tooltips").html(''); // Message
}

// Ajoute les informations de feedback sur un champ
// @param {string} idField 		- ID du champ cible
// @param {string} stateClass 	- Nom de la class à ajouter (ex.: has-success, has-warning, has-error)
// @param {string} stateIcon 	- Valeur de l'ICON (Material Icon uniquement : https://material.io/icons/)
// @param {string} stateMsg 	- Message a afficher lors du survol de l'icon
frmAction.addFeedback = function(idField, stateClass, stateIcon, stateMsg) {
	// Assignation du feedback
	$("#"+idField).closest(".form-group").addClass(stateClass); // Parent
	$("#"+idField).closest(".form-group").children(".form-control-feedback").html(stateIcon); // Icon
	$("#"+idField).closest(".form-group").children(".form-control-feedback-tooltips").html(stateMsg); // Message
}

// Supprime les informations d'état du champ parent
// @param {string} idField 		- ID du champ cible
frmAction.removeHasState = function(idField) {
	// Assignation du feedback
	$("#"+idField).closest(".form-group").removeClass('has-success has-warning has-error'); // Parent
}

// Ajoute les informations d'état du champ parent
// @param {string} idField 		- ID du champ cible
// @param {string} stateClass 	- Nom de la class à ajouter (ex.: has-success, has-warning, has-error)
frmAction.addHasState = function(idField, stateClass) {
	// Assignation du feedback
	$("#"+idField).closest(".form-group").addClass(stateClass); // Parent
}

// Supprime les valeurs d'un champ texte
// @param {string} idField 		- ID du champ cible
frmAction.resetFieldByBtn = function(idField) {
	$("#"+idField).val('');
	$("#"+idField).next(".input-group-addon").children("a").css('visibility', 'hidden'); // On cache le bouton
}

// Marque le champ comme valide ou invalide
frmAction.updateFieldStatut = function(idField, state) {
	// Définition du statut
	if(state == "success" || state == "warning") { fieldValideState = "1"; }
	else { fieldValideState = "0"; }

	// Marquage du champ
	$("#"+idField).attr("data-is-valid", fieldValideState);
}

// Affichage du niveau de sécurité du mot de passe
frmAction.updatePasswordSecurityLevel = function(level) {

}


















