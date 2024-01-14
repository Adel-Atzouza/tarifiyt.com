/*
 * Date   : Avril 2021
 * Projet : Panier simplifié
 *
 * Fonctions JS dynamique destinées au panier d"achat simplifié
 */

// ########### INITIALISATION ##########
panier = {}
debugPanier = false;


// ############ CONSTANTES #############
const CART_HAS_DELIVERY = ($("#cart-has-delivery").val() == 1) ? true : false;
const CART_HAS_INVOICE  = ($("#cart-has-invoice").val() == 1) ? true : false;

const DELIVERY_PREFIX   = $("#delivery-form-prefix").val();
const INVOICE_PREFIX    = $("#invoice-form-prefix").val();

const TOTAL_CART        = "[data-id='total-panier']";
const TOTAL_REDUCTION   = "[data-id='total-reduction']"
const TOTAL_FP          = "[data-id='total-fp']";
const TOTAL_HORS_REMISE = "[data-id='total-hors-remise']";
const TOTAL_PRICE       = "[data-id='total-price']";

const SAVE_IN_PROGRESS  = ".save-in-progress";
const CART_LOCKER       = "#cart-locked";

//const MOBILE_MAX_WIDTH  = 991;
const MOBILE_MAX_WIDTH  = 767;  // Taille à laquelle l'affichage passe en mode MOBILE
const MOBILE_CART_WIDTH = 991;  // Taille à laquelle le panier est caché pour le mode MOBILE

var btnPaiement         = $("a.btn-go-to-paiement");


// ############## OUTILS ###############
// Converti une chaine de caractère en nombre
function convertStringToNumber(string) {
    return Number(string.replace(",", "."));
}

// Converti un nombre en string
function convertNumberToString(number) {
    return (number.toString()).replace(".", ",");
}


// ########## EVENTS LISTENER ##########
// OUVERTURE ET FERMETURE DU DETAIL DU PANIER
// MOBILE
// Quand le détail du panier est CACHÉ, on affiche le texte adéquat
$(".liste-elements").on("hide.bs.collapse", function () {
    $(".toggle-text").toggleClass("hide");
});
// MOBILE
// Quand le détail du panier est AFFICHÉ, on affiche le texte adéquat
$(".liste-elements").on("show.bs.collapse", function () {
    $(".toggle-text").toggleClass("hide");
});


// OUVERTURE ET FERMETURE DES PANNEAUX
// ALL
// Quand on FERME le panel delivery...
$(".panel-address-delivery").on("hide.bs.collapse", function () {
    // ...on marque le panel comme fermé
    $(".toggle-address-delivery").toggleClass("open");
    // ...si la case est cochée, on valide l'adresse de
    //    facturation sur base de celle de livraison
    if($("#copy-delivery-address").is(":checked")) {
        panier.validateAddress("invoice");
    }
    // ...on vérifie le remplissage des données de livraison
    panier.validateAddress("delivery");

    // ...sauvegarde automatique
    panier.sauvegarde();

    // ...repositionnement de la barre des boutons
    panier.setBtnBarPosition();
});
// ALL
// Quand on OUVRE le panel delivery...
$(".panel-address-delivery").on("show.bs.collapse", function () {
    // ...on marque le panel comme ouvert
    $(".toggle-address-delivery").toggleClass("open");

    // ...repositionnement de la barre des boutons
    panier.setBtnBarPosition();
});

// ALL
// Quand on FERME le panel invoice...
$(".panel-address-invoice").on("hide.bs.collapse", function () {
    // ...on marque le panel comme fermé
    $(".toggle-address-invoice").toggleClass("open");
    // ...on vérifie le remplissage des données de facturation
    panier.validateAddress("invoice");

    // ...sauvegarde automatique
    panier.sauvegarde();

    // ...repositionnement de la barre des boutons
    panier.setBtnBarPosition();
});
// ALL
// Quand on OUVRE le panel invoice...
$(".panel-address-invoice").on("show.bs.collapse", function () {
    // ...on marque le panel comme ouvert
    $(".toggle-address-invoice").toggleClass("open");

    // ...repositionnement de la barre des boutons
    panier.setBtnBarPosition();
});


// MODIFICATION DU CONTENU DES FORMULAIRES
// ALL
// Quand on MODIFIE le formulaire d'adresse de livraison, on affiche de
// manière synthétique les valeurs entrées
$(".panel-address-delivery .form-control").on("keyup change", function () {
    // ...synthèse de l'adresse de livraison
    panier.synthetiseAddress("delivery");

    // ...si la case est cochée, on copie de l'adresse de
    //    livraison pour la facturation
    if($("#copy-delivery-address").is(":checked")) {
        panier.synthetiseAddress("invoice");
    }

    // ...on vérifie le remplissage des données de livraison
    panier.validateAddress("delivery");
});

// ALL
// Quand on MODIFIE le formulaire d'adresse de facturation, on affiche de
// manière synthétique les valeurs entrées
$(".panel-address-invoice .form-control").on("keyup change", function () {
    // ...synthèse de l'adresse de facturation
    panier.synthetiseAddress("invoice");

    // ...on vérifie le remplissage des données de facturation
    panier.validateAddress("invoice");
});

// ALL
// Quand on MODIFIE la valeur du pays par défaut...
$(".default-zone #default-pays").on("keyup change", function () {
    // ...sauvegarde automatique
    panier.sauvegarde();
});

// ALL
// 1) Recalcul des frais de livraison lors du changement du pays de livraison
// 2) Rendre le champ téléphone obligatoire (Hors-France) ou recommandé (France)
$(".panel-address-delivery #"+DELIVERY_PREFIX+"pays").on("change", function () {
    // Récupération du pays de livraison sélectionné
    var pays = $(this).val();

    // Recalcul des frais de livraison
    panier.refreshFp();

    // Vérification de délivrabilité
    panier.checkDeliverability();

    // Recalcul du montant total
    //panier.refreshTotalPrice();

    // Etat du champ téléphone
    // Livraison en France, le champ est recommandé
    if(pays == "France") {
        panier.deliveryPhoneRequired(false);
    }
    // Livraison Hors France, le champ est obligatoire
    else {
        panier.deliveryPhoneRequired(true);
    }
});


// ZONE D'ENCODAGE
// ALL
// Quand on SOUHAITE UNE FACTURE, le formulaire d'encodage des coordonnées de
// facturation s'affiche, et le titre de la zone se modifie
$("#user-need-an-invoice").on("change", function () {
    // Récupération de l'état
    var userNeedAnInvoice = $(this).is(":checked");

    // ...appel de la fonction
    panier.userNeedAnInvoice(userNeedAnInvoice);

    // ...repositionnement de la barre des boutons
    panier.setBtnBarPosition();
});

// ALL
// Quand on SOUHAITE utiliser l'adresse de livraison pour la facturation
$("#copy-delivery-address").on("change", function () {

    // Récupération de l'état
    var copyDeliveryAddress = $(this).is(":checked");

    // Appel de la fonction
    panier.copyDeliveryAddress(copyDeliveryAddress);
});

// CHOIX DE LA METHODE DE PAIEMENT
panier.toggleMethodePaiement = function(value) {
    // Désactivation du bouton
    event.preventDefault();

    // Désactivation des boutons
    $("button.btn-methodepaiement").removeClass("active");

    // Activation du bouton correspondant
    $("button.btn-methodepaiement[data-id='methode-paiement-"+value+"']").addClass("active");

    // Changement de la méthode de paiement
    $("#methode-paiement").val(value);
}

// ######### CUSTOMS FUNCTIONS #########
// Force l"ouverture ou la fermeture d"un panel du formulaire
// type     : string. Valeurs possibles : open|close
// idPanel  : string. Valeurs possibles : delivery|invoice
panier.forceTo = function(type, idPanel) {
    // Ouverture
    if(type == "open") {
        $(".panel-address-"+idPanel).collapse("show")
    }
    // Fermeture
    if(type == "close") {
        // Validation du pannel avant fermeture
        statutAddress = panier.validateAddress(idPanel);
        // Si l'adresse est remplie correctement, on peut fermer le panneau
        if(statutAddress) {
            $(".panel-address-"+idPanel).collapse("hide");
        }
    }
}

// Rendre le champ "Téléphone" obligatoire ou uniquement recommandé
// Modifie l'attribut "required" et changer le texte
// isRequired : bool
panier.deliveryPhoneRequired = function(isRequired) {
    // Configuration
    var panel = $(".panel-address-delivery");

    // Required
    if(isRequired) {
        // Changement de l'attribut required
        panel.find("#"+DELIVERY_PREFIX+"telephone").attr("required", "required");
        // Affichage du champ comme obligatoire
        panel.find("#"+DELIVERY_PREFIX+"telephone").prev("label").find(".field-required").removeClass("hide");
        // Choix du texte
        $('.toggle-text-telephone-recommended').addClass("hide");
        $('.toggle-text-telephone-required').removeClass("hide");
    }
    // Recommandé uniquement
    else {
        // Changement de l'attribut required
        panel.find("#"+DELIVERY_PREFIX+"telephone").attr("required", false);
        // Affichage du champ comme recommandé
        panel.find("#"+DELIVERY_PREFIX+"telephone").prev("label").find(".field-required").addClass("hide");
        // Choix du texte
        $('.toggle-text-telephone-recommended').removeClass("hide");
        $('.toggle-text-telephone-required').addClass("hide");
    }
}

// Rendre le champ PAYS de livraison non-modifiable
// Pour numeric-first, le pays de livraison DOIT être exactement le même que pour la commande
// initiale, on supprime donc la possibilité de changer le pays avec un champ texte
panier.deliveryCountryLocked = function() {
    // Configuration
    var panel   = $(".panel-address-delivery");
    var target  = panel.find("#"+DELIVERY_PREFIX+"pays");

    // Récupération de la valeur de la liste déroulante
    var value = target.val();

    // Création d'un champ texte bloqué
    target.after('<input type="text" class="form-control" id="'+DELIVERY_PREFIX+'pays" name="'+DELIVERY_PREFIX+'pays" value="'+value+'" readonly="readonly" />');

    // Suppression de la liste
    target.remove();
}


// Rendre les champs du formulaire de facturation obligatoires
// isRequired : bool
panier.invoiceFieldsRequired = function(isRequired) {
    // Configuration
    var panel   = $(".panel-address-invoice");
    var fields  = ["prenom", "nom", "adresse", "cp", "ville", "pays"];

    // Required
    if(isRequired) {
        // Boucle
        $(fields).each(function(key, value) {
            // Changement de l'attribut required
            panel.find("#"+INVOICE_PREFIX+value).attr("required", "required");
            // Affichage du champ comme obligatoire
            panel.find("#"+INVOICE_PREFIX+value).prev("label").find(".field-required").removeClass("hide");
        });
    }
    // Libre
    else {
        // Boucle
        $(fields).each(function(key, value) {
            // Changement de l'attribut required
            panel.find("#"+INVOICE_PREFIX+value).attr("required", false);
            // Affichage du champ comme obligatoire
            panel.find("#"+INVOICE_PREFIX+value).prev("label").find(".field-required").addClass("hide");
        });
    }
}

// Affichage du formulaire d'encodage des coordonnées de facturation et
// modification du titre de la zone d'encodage (coordonnées <=> données complémentaires)
// isRequired : bool
panier.userNeedAnInvoice = function(isRequired) {
    // Afficher la zone d'encode de la facturation
    if(isRequired) {
        // TOGGLE ZONE D'ENCODAGE
        // Afficher la zone de facturation
        $(".invoice-zone").fadeIn().removeClass("hide");
        // Cacher la zone par défaut
        $(".default-zone").addClass("hide");

        // TOGGLE REQUIRED FIELDS
        // Rendre les champs du formulaire de facturation obligatoires
        panier.invoiceFieldsRequired(true);

        // TOGGLE CHECKBOX
        // La checkbox est cochée
        $("#user-need-an-invoice").attr("checked", "checked");
    }
    // Cacher la zone d'encode de la facturation
    else {
        // TOGGLE ZONE D'ENCODAGE
        // Afficher la zone de facturation
        $(".invoice-zone").addClass("hide");
        // Afficher la zone par défaut
        $(".default-zone").removeClass("hide");

        // TOGGLE REQUIRED FIELDS
        // Rendre les champs du formulaire de facturation libres
        panier.invoiceFieldsRequired(false);

        // TOGGLE CHECKBOX
        // La checkbox est décochée
        $("#user-need-an-invoice").attr("checked", false);
    }
}

// Utiliser l'adresse de livraison pour la facturation
// isRequired : bool
panier.copyDeliveryAddress = function(isRequired) {
    // Utilisation de l'adresse de livraison
    if(isRequired) {
        // Désactivation du formulaire
        $(".panel-address-invoice input.form-control").attr("disabled", "disabled");
        $(".panel-address-invoice select").attr("disabled", "disabled");
        // Rendre les champs du formulaire de facturation libres
        panier.invoiceFieldsRequired(false);
        // Synthèse de l'adresse de facturation
        panier.synthetiseAddress("invoice");

        // TOGGLE CHECKBOX
        // La checkbox est décochée
        $("#copy-delivery-address").attr("checked", "checked");
    }
    // Adresse de facturation
    else {
        // Activation du formulaire
        $(".panel-address-invoice input.form-control").attr("disabled", false);
        $(".panel-address-invoice select").attr("disabled", false);
        // Rendre les champs du formulaire de facturation obligatoires
        panier.invoiceFieldsRequired(true);
        // Synthèse de l'adresse de facturation
        panier.synthetiseAddress("invoice");

        // TOGGLE CHECKBOX
        // La checkbox est décochée
        $("#copy-delivery-address").attr("checked", false);
    }

    // Afficher/Cacher le formulaire
    // http://redmine.cairn.info/issues/153176#note-204
    // Je n'ai pas envie de tout refaire, je laisse ça au suivant, donc ici, je ne fais que cacher le formulaire
    if(isRequired) {
        $(".panel-address-invoice [data-id=\"form-delivery\"]").hide();
        panier.setBtnBarPosition()
    }
    else {
        $(".panel-address-invoice [data-id=\"form-delivery\"]").show();
        panier.setBtnBarPosition()
    }
}


// Synthèse des données encodées et création d"une
// valeur affichée en direct à l'utilisateur
// idPanel  : string. Défini le panneau depuis lequel on récupère les valeurs. Valeurs possibles : delivery|invoice
//
// EXPLICATIONS
// ------------
// isCopy : Défini si l'adresse de facturation est égale à l'adresse de livraison.
// panel  : Défini le [panneau de] formulaire D'OÙ l'on récupère les données. Valeurs possibles : delivery|invoice
// target : Défini la balise address cible. Valeurs possibles : delivery|invoice
panier.synthetiseAddress = function(idPanel) {

    // Définition des valeurs
    var formattedName   = "";
    var formattedAddress= "";
    var formattedType   = (idPanel == "delivery") ? "livraison" : "facturation";
    var isCopy          = $("#copy-delivery-address").is(":checked");
    var panel           = (isCopy) ? $(".panel-address-delivery") : $(".panel-address-"+idPanel);
    var target          = $(".toggle-address-"+idPanel);

    // Récupération des valeurs, si elles existent
    var nom             = (panel.find("[data-synthese='nom']").length > 0 && panel.find("[data-synthese='nom']").val() != "") ? panel.find("[data-synthese='nom']").val() : "";
    var prenom          = (panel.find("[data-synthese='prenom']").length > 0 && panel.find("[data-synthese='prenom']").val() != "") ? panel.find("[data-synthese='prenom']").val() : "";
    var societe         = (panel.find("[data-synthese='societe']").length > 0 && panel.find("[data-synthese='societe']").val() != "") ? panel.find("[data-synthese='societe']").val() : "";

    var adresse         = (panel.find("[data-synthese='adresse']").length > 0 && panel.find("[data-synthese='adresse']").val() != "") ? panel.find("[data-synthese='adresse']").val() : "";
    var cp              = (panel.find("[data-synthese='cp']").length > 0 && panel.find("[data-synthese='cp']").val() != "") ? panel.find("[data-synthese='cp']").val() : "";
    var ville           = (panel.find("[data-synthese='ville']").length > 0 && panel.find("[data-synthese='ville']").val() != "") ? panel.find("[data-synthese='ville']").val() : "";
    var pays            = (panel.find("[data-synthese='pays']").length > 0 && panel.find("[data-synthese='pays']").val() != "") ? panel.find("[data-synthese='pays']").val() : "";

    // Formatage du nom : [<entreprise>], [<prenom> <nom>]
    var nameGroupe1    = [];
    var nameGroupe2    = [];

    if(societe != "")  { nameGroupe1.push(societe); }
    if(prenom != "")   { nameGroupe2.push(prenom); }
    if(nom != "")      { nameGroupe2.push(nom); }

    // Groupement des groupes
    (nameGroupe2.length > 0) ? nameGroupe1.push(nameGroupe2.join(" ")) : "";
    // Concaténation
    var formattedName = nameGroupe1.join(", ");


    // Formatage de l'adresse : [<adresse>], [<cp> <ville>], [<pays>]
    var addressGroupe1    = [];
    var addressGroupe2    = [];
    var addressGroupe3    = [];

    if(adresse != "")     { addressGroupe1.push(adresse); }
    if(cp != "")          { addressGroupe2.push(cp); }
    if(ville != "")       { addressGroupe2.push(ville); }
    if(pays != "")        { addressGroupe3.push(pays); }

    // Groupement des groupes
    (addressGroupe2.length > 0) ? addressGroupe1.push(addressGroupe2.join(" ")) : "";
    (addressGroupe3.length > 0) ? addressGroupe1.push(addressGroupe3) : "";
    //(addressGroupe1.length > 0) ? addressGroupe1.join(", ") : "";
    // Concaténation
    var formattedAddress = addressGroupe1.join(", ");


    // Adresse vide
    // Affichage du message "Encodez une nouvelle adresse"
    if(formattedName == "" && formattedAddress == "") {
        target.find(".address-synthese").addClass("hide");
        target.find(".address-toggle-synthese").removeClass("hide");
    }
    // Suppression du message et affichage de l'adresse synthétisée
    else {
        target.find(".address-synthese").removeClass("hide");
        target.find(".address-toggle-synthese").addClass("hide");
    }

    // Assignation live de l'adresse
    target.find(".name").html(formattedName);
    target.find(".address.address-synthese").html(formattedAddress);
}

// Parcours les données du formulaire d'adresse et vérifie que l'adresse est valide
// Ceci permet de marquer le bloc "<address>" cible comme invalide ou non, quand
// le panneau est fermé et que le formulaire n'est plus visible.
//
// EXPLICATIONS
// ------------
// isCopy : Défini si l'adresse de facturation est égale à l'adresse de livraison.
// panel  : Défini le [panneau de] formulaire D'OÙ l'on récupère les données. Valeurs possibles : delivery|invoice
// target : Défini la balise address cible. Valeurs possibles : delivery|invoice
panier.validateAddress = function(idPanel) {
    // Configuration
    var fields  = ["prenom", "nom", "adresse", "cp", "ville", "pays"];
    var isCopy  = $("#copy-delivery-address").is(":checked");
    var panel   = (isCopy) ? $(".panel-address-delivery") : $(".panel-address-"+idPanel);
    var target  = $(".toggle-address-"+idPanel);
    var prefix  = (isCopy) ? DELIVERY_PREFIX : (idPanel == "delivery") ? DELIVERY_PREFIX : INVOICE_PREFIX;

    // Initialisation
    var status  = true;

    // Vérification du téléphone si livraison hors de la France
    if(idPanel == "delivery" && $(".panel-address-delivery #"+DELIVERY_PREFIX+"pays").val() != "France") { fields.push("telephone"); }

    // Parcours des éléments du formulaire
    $(fields).each(function(key, value) {
        // Changement de l'attribut required
        if(panel.find("#"+prefix+value).val() == "") {
            status = false;
        }
    });

    // Affichage du statut
    // Le formulaire est valide, on marque l'adresse comme valide
    if(status) {
        target.removeClass('has-error');
    }
    // L'adresse est incomplète
    else {
        target.addClass('has-error');
    }

    return status;
}

// Récupération du montant de frais de port suivant le pays sélectionné
// Si aucun pays n'est sélectionné, on affiche un message incitant la sélection
panier.refreshFp = function() {

    // Livraison disponible
    if(CART_HAS_DELIVERY) {
        // Récupération du pays de livraison sélectionné
        var pays = $(".panel-address-delivery #"+DELIVERY_PREFIX+"pays").val();

        // Recalcul des frais de livraison
        $.get("./index.php?controleur=User&action=panierRefreshFP", { 'pays': pays })
            .done(function (response) {
                // Récupération des valeurs du callback
                var response = JSON.parse(response);

                // Montant total des frais de port
                if (response.statut == "success") {
                    // Assignation du montant
                    $(TOTAL_FP).html(response.fp);
                    // Affichage du texte
                    $(".toggle-pays-selected").removeClass("hide");
                    $(".toggle-pays-undefined").addClass("hide");
                }
                // Erreur ou données incomplètes
                else {
                    // Assignation du montant
                    $(TOTAL_FP).html(response.fp);
                    // Affichage du texte
                    $(".toggle-pays-selected").addClass("hide");
                    $(".toggle-pays-undefined").removeClass("hide");
                }

                // Rafraichissement du prix total
                panier.refreshTotalPrice();
            }
        );
    }
    // Pas de livraison, pas de calcul de frais de port
    else {
        // Rafraichissement du prix total uniquement
        panier.refreshTotalPrice();
    }
}

// Recalcul du montant total suivant les différents montants disponibles
// /!\ Le montant du panier est affiché AVEC le remise déjà calculée, il ne
//     faut donc pas la prendre en compte dans le calcul du total du panier
panier.refreshTotalPrice = function() {

    // Récupération des valeurs
    total_cart          = ($(TOTAL_CART).length)                    ? convertStringToNumber($(TOTAL_CART).html())        : 0;   // Montant du panier avec REMISE (ne peut pas ne pas exister)
    total_fp            = (CART_HAS_DELIVERY && $(TOTAL_FP).length) ? convertStringToNumber($(TOTAL_FP).html())          : 0;   // Montant du frais de port
    total_reduction     = ($(TOTAL_REDUCTION).length)               ? convertStringToNumber($(TOTAL_REDUCTION).html())   : 0;   // Montant de la réduction (informatif)
    total_horsremise    = ($(TOTAL_HORS_REMISE).length)             ? convertStringToNumber($(TOTAL_HORS_REMISE).html()) : 0;   // Montant du panier SANS le remise (informatif)


    // CALCUL DU PRIX A PAYER
    // Addition des valeurs (seulement le montant du panier + les frais de port)
    total_to_pay = total_cart + total_fp;
    // Assignation
    $(TOTAL_PRICE).html(convertNumberToString(total_to_pay.toFixed(2)));


    // CALCUL DU MONTANT HORS-REDUCTION (si existe)
    if($(TOTAL_REDUCTION).length && $(TOTAL_HORS_REMISE).length) {
        // Addition des valeurs (montant du panier + réduction)
        total_horsremise = total_cart + total_reduction;
        // Assignation
        $(TOTAL_HORS_REMISE).html(convertNumberToString(total_horsremise.toFixed(2)));
    }


    // Debug
    if(debugPanier === true) {
        console.log("Total Cart : " + total_cart);
        console.log("Total FP : " + total_fp);
        console.log("Total Reduction : " + total_reduction);
        console.log("Total à payer : " + convertNumberToString(total_to_pay.toFixed(2)));
    }
}

// Vérification de la délivrabilité du panier pour le pays mentionné
// Cette vérification sert principalement pour PUF et BEL
panier.checkDeliverability = function() {
    // Livraison disponible
    if(CART_HAS_DELIVERY) {
        // Récupération du pays de livraison sélectionné
        var pays = $(".panel-address-delivery #"+DELIVERY_PREFIX+"pays").val();

        // Vérification de la délivrabilité des numéros papier HORS France
        $.get("./index.php?controleur=User&action=panierCheckDeliverability", { 'pays': pays })
            .done(function (response) {
                // Récupération des valeurs du callback
                var response = JSON.parse(response);

                // Livraison impossible dans le pays sélectionné
                if (response.statut != "success") {
                    // Ajouter une alerte ici
                    panier.showError("panier", "error-delivrability");
                    // On remonte en haut du panier pour montrer le message
                    $('body,html').animate({scrollTop: jQuery('#contenu').offset().top}, 500);

                    // Ouverture du panel
                    panier.forceTo("open", "delivery");

                    // Blocage du pays de livraison
                    $(".panel-address-delivery #"+DELIVERY_PREFIX+"pays").val("France");
                    // Marquage du champ téléphone non-obligatoire puisque France
                    panier.deliveryPhoneRequired(false);
                    // Rafraichissement des frais de port
                    panier.refreshFp();
                    // Rafrachissement de l'adresse de livraison
                    panier.synthetiseAddress("delivery");
                    // Rafraichissement de l'adresse de facturation si nécessaire
                    if($("#copy-delivery-address").is(":checked")) {
                        panier.synthetiseAddress("invoice");
                    }
                }
                // Tout est ok
                else {

                }
            }
        );
    }
}

// Validation des données avant le checkout
panier.validateBeforeCheckout = function() {

    // Initialisation
    statut = true;
    type   = "success";

    // Vérification de l'état du formulaire
    var isConnected             = ($("#email").length)                        ? false : true;                                               // Vérifie si l'utilisateur est connecté ou non (suivant la présence d'un champ e-mail ou non)
    var statutAddressDelivery   = (CART_HAS_DELIVERY)                         ? panier.validateAddress("delivery") : true;                  // Vérification que l'adresse de livraison est bien rempli SSI il y a une livraison nécessaire
    var statutAddressInvoice    = ($("#user-need-an-invoice").is(":checked")) ? panier.validateAddress("invoice")  : true;                  // Vérification que l'adresse de facturation est bien rempli SSI il y a une demande de facture
    var statutPaysDefault       = (!CART_HAS_DELIVERY && $("#default-pays").val() == "") ? (($("#user-need-an-invoice").is(":checked")) ? true : false) : true ; // Vérification que le pays par est bien rempli SSI il n'y a pas de livraison ET qu'on ne demande pas de facture
    var statutUser              = (isConnected)                               ? true : (ajax.checkEmail($("#email").val()) ? true : false); // Vérifie si l'adresse e-mail est valide
    var statutCgv               = $('#checkout-cgv-acceptation-status').prop('checked');                                                    // Vérification des modalités obligatoires

    var statutDefaultNom        = (!isConnected && !CART_HAS_DELIVERY && ($("#default-nom").val() == "" || $("#default-prenom").val() == "")) ? (($("#user-need-an-invoice").is(":checked")) ? true : false) : true ; // Vérification du remplissage du nom et prénom si nécessaire (non-connecté et sans livraison)

    // Validation
    if(!statutCgv)             { statut = false; type = "cgv-required"; }
    if(!statutAddressInvoice)  { statut = false; type = "invoice-address-uncomplete"; }
    if(!statutAddressDelivery) { statut = false; type = "delivery-address-uncomplete"; }
    if(!statutPaysDefault)     { statut = false; type = "default-country-undefined"; }
    if(!statutDefaultNom)      { statut = false; type = "default-name-undefined"; }
    if(!statutUser)            { statut = false; type = "email-address-undefined"; }

    // Debug
    if(debugPanier) {
        console.log("statutAddressDelivery : "+statutAddressDelivery);
        console.log("statutAddressInvoice : "+statutAddressInvoice);
        console.log("statutPaysDefault : "+statutPaysDefault);
        console.log("statutDefaultNom : "+statutDefaultNom);
        console.log("isConnected : "+isConnected);
        console.log("statutUser : "+statutUser);
        console.log("statutCgv : "+statutCgv);
        console.log("check e-mail : "+ajax.checkEmail($("#email").val()));
    }

    return {"statut": statut, "type": type};
}


// Enregistrement du panier
// reloadAfterSave : bool. Comme son nom l'indique, la page sera rechargée après le sauvegarde. Default : false
// isCheckout      : bool. Si true, la procédure de checkout sera lancée après la sauvegarde
panier.sauvegarde = function(reloadAfterSave, isCheckout) {
    // IE ne permet pas de définir un paramètre à false dans la fonction
    // Ces lignes sont obligatoires pour ne pas que le javascript bug
    if (reloadAfterSave == undefined) { reloadAfterSave = false; }
    if (isCheckout == undefined) { isCheckout = false; }

    // Récupération des données
    var data    = $('#form-panier').serialize();

    // Ajout du paramètre
    if(isCheckout) { data += "&isCheckout=1"; }

    // Sauvegarde du panier
    // Le panier s'enregistre automatique toutes les X secondes, il faut donc empêcher que
    // cette sauvegarde automatique ne croise un autre enregistrement.
    var locked  = $(CART_LOCKER).val(); // Défini si le panier est bloqué ou non.

    // Panier ouvert, on sauvegarde
    // SAUF lors du checkout où on sauvegarde quoi qu'il arrive
    if(locked == "0" || isCheckout) {
        // Affichage de l'indicateur
        $(SAVE_IN_PROGRESS).css("display", "block").show();

        // Blocage du panier
        $(CART_LOCKER).val("1");

        // Sauvegarde
        $.ajax({
            url : 'index.php?controleur=User&action=panierSauvegarde',
            type : 'POST',
            data: data,
            dataType: 'json',
            success : function(response) {
                // Reset des erreurs éventuelles
                panier.resetError("panier");

                // Enregistrement de la commnade
                if(response.statut == "success" && response.tmpCmdId != "") {
                    // Récupération des valeurs
                    var tmpCmdId = response.tmpCmdId;

                    // Assignation de la valeur
                    $("#tmpCmdId").val(tmpCmdId);

                    // Rechargement de la page
                    if(reloadAfterSave && !isCheckout) {
                        document.location.reload();
                    }

                    // Après sauvegarde, on lance le checkout
                    if(isCheckout) {
                        // Utilisateur non-reconnu
                        if(response.user == "guest") {
                            console.log("Identification de l'utilisateur impossible");
                            panier.showError("checkout", "error-auth-user");
                        }
                        // Utilisateur reconnu
                        else {
                            // BY PASS MODE avec INGENICO
                            if(response.checkoutprovider === 'ingenico' && response.checkoutmode === "bypass") {
                                // En dev, on ajoute un timeout pour terminer les requêtes
                                // qui sont normalement exécutée dans le webhook
                                setTimeout(function() {
                                    panier.checkout('ingenico');
                                }, 1000);
                            }
                            // PROVIDER
                            else {
                                panier.checkout(response.checkoutprovider);
                            }
                        }
                    }
                }
                // Erreur de l'enregistrement de la commande
                else {
                    // Erreur de sauvegarde
                    if(response.statut == "error-save") {
                        console.log("Erreur lors de la sauvegarde du panier");
                        panier.showError("panier", response.statut);
                    }
                    // Erreur avant checkout
                    else {
                        console.log("Erreur lors de la sauvegarde d'avant checkout");
                        panier.showError("checkout", response.statut);
                    }

                    // Ré-activation du bouton de paiement
                    btnPaiement.button('reset');
                }

                // Masque de l'indicateur
                $(SAVE_IN_PROGRESS).hide();

                // Ré-ouverture du panier
                $(CART_LOCKER).val("0");
            },
            // Erreur de connexion
            error: function(xhr, status) {

            },
            // Débug de la requête
            complete: function() {
                if(debugPanier === true) {
                    console.log("AJAX URL: \n"+this.url);
                    console.log("AJAX DEBUG: \n"+this.url+"&"+this.data);
                    console.log("DATA SENT: \n");
                    // Affichage des paramètres
                    values = this.data.split("&");
                    values.forEach(function(value) {
                        console.log(value.replace("=", " : "));
                    })
                }
            }
        });
    }
    // Panier fermé
    else {
        console.log("Le panier est fermé, il ne peut être sauvegardé");
    }
}

// Preparation du Checkout
panier.prepareToCheckout = function() {

    // Désactivation du bouton de paiement lors de l'activation
    btnPaiement.button('loading');

    // On remonte en haut du panier
    $('body,html').animate({scrollTop: jQuery('#contenu').offset().top}, 500);

    // Vérification de l'état du formulaire
    var validation = panier.validateBeforeCheckout();

    // Messages de validation des données (données manquantes, champs requis, ...)
    if(!validation.statut) {
        // Affichage de l'erreur
        panier.showError("checkout", validation.type);
        // Ré-activation du bouton de paiement
        btnPaiement.button('reset');
    }

    // Sauvegarde du panier
    reloadAfterSave = false;
    isCheckout      = (validation.statut) ? true : false;
    panier.sauvegarde(reloadAfterSave, isCheckout);
}

// Passage au paiement
panier.checkout = function (provider) {

    console.log('CHECKOUT : ' + provider);

    // Vérification de l'état du formulaire
    var validation      = panier.validateBeforeCheckout();

    // Récupération des données
    var tmpCmdId        = $("#tmpCmdId").val();
    var methodePaiement = $("#methode-paiement").val();

    // Démarrage du checkout
    if(validation.statut) {
        // Acceptation des conditions générales
        var cgvStatut = $('#checkout-cgv-acceptation-status').prop('checked');

        // Envoie des données...
        if(cgvStatut) {
            // LYRA
            if(provider === 'lyra') {
                // ...pour récupération d'une URL partielle générée par Ingenico
                $.get("./index.php?controleur=User&action=panierGetLyraCheckoutUrl", { orderId: tmpCmdId, methodePaiement: methodePaiement })
                    .done(function (data) {
                        // Redirection validée
                        if (data.statut) {
                            // Chargement
                            modalMsg = "Redirection vers le paiement";
                            cairn.show_loading_message(modalMsg);

                            // Redirection
                            document.location.href = data.url;
                        }
                        // Erreur
                        else {
                            // Chargement
                            modalMsg = (!window.IS_CAIRN_INT) ? "Annulation de la commande" : "Order cancel";
                            cairn.show_loading_message(modalMsg);

                            // Message
                            panier.showError("checkout", "error-undefined");

                            // Arret du chargement
                            cairn.close_loading_message();

                            // Ré-activation du bouton de paiement
                            btnPaiement.button('reset');
                        }
                    }
                );
            }
            // OGONE
            if(provider === 'ingenico') {
                // ...pour récupération d'une URL partielle générée par Ingenico
                $.get("./index.php?controleur=User&action=panierGetHostedCheckoutsUrl", { orderId: tmpCmdId, methodePaiement: methodePaiement })
                    .done(function (data) {
                        // Récupération des valeurs du callback
                        var data = JSON.parse(data); // Transformation du string en tableau JSON

                        // Redirection validée
                        if (data.statut) {
                            // Chargement
                            modalMsg = (!window.IS_CAIRN_INT) ? "Redirection vers Ingenico" : "Redirecting to Ingenico";
                            cairn.show_loading_message();

                            // Redirection
                            document.location.href = data.url;
                        }
                        // Erreur
                        else {
                            // Chargement
                            modalMsg = (!window.IS_CAIRN_INT) ? "Annulation de la commande" : "Order cancel";
                            cairn.show_loading_message(modalMsg);

                            // Message
                            panier.showError("checkout", "error-undefined");

                            // Arret du chargement
                            cairn.close_loading_message();

                            // Ré-activation du bouton de paiement
                            btnPaiement.button('reset');
                        }
                    }
                );
            }
        }
        // Les CGV doivent être acceptées
        else {
            panier.showError("checkout", "cgv-required");

            // Ré-activation du bouton de paiement
            btnPaiement.button('reset');
        }
    }
    // Erreur : Une donnée est possiblement manquante (adresse de livraison ou adresse de facturation ou tmpCmdId)
    else {
        panier.showError("checkout", "error-undefined");

        // Ré-activation du bouton de paiement
        btnPaiement.button('reset');
    }
}
// ######### CUSTOMS FUNCTIONS #########



// ######### ACTIONS FUNCTIONS #########
// Suppression d'un élément du panier
panier.remove = function(type, id, extra) {
    // Suppression de l'élément du panier
    if (type != "" && id != "") {
        // Identification du bouton
        var btn = $("a[data-id-panier='" + type + "-" + id + "']");

        // Suppression de l'élément du panier
        $.get("./index.php?controleur=User&action=panierRemove", { type: type, id: id, extra: extra })
            .done(function (response) {
                // La suppression de l'élément est OK
                if(response) {
                    // Récupération des valeurs du callback
                    var response = JSON.parse(response);

                    // Vérification du montant
                    if(response.total_panier) {

                        // Assignation du nouveau montant
                        $(TOTAL_CART).html(convertNumberToString(response.total_panier));

                        // Rafraichissement des montants
                        panier.refreshFp();
                        //panier.refreshTotalPrice(); // Déjà présent dans refreshFp

                        // Sauvegarde du panier
                        panier.sauvegarde();

                        // Suppression de la tuile
                        btn.closest(".article-list-item").animate({
                            opacity: 0,
                            left: "+=150",
                            height: "toggle"
                        }, 400, function() {
                            // Suppression de l'élément
                            this.remove();

                            // Repositionnement des warnings
                            panier.setWarningPosition();

                            // Mise à jour du compteur d'élément
                            count = $('.tuiles .media').length;
                            $("[data-id='cart-counter']").html(count);
                        });

                        // Repositionnement de la barre des boutons
                        panier.setBtnBarPosition();

                        // Si le panier change son mode de livraison OU si c'est spécifié, on recharge la page
                        if(response.hasLivraison != CART_HAS_DELIVERY || response.reloadCart || response.nbre_element == 0) {
                            //document.location.reload();
                            // Redirection plutôt que reload
                            if (window.IS_CAIRN_INT) {
                                document.location.href = "./cart.php";       
                            } else if (window.IS_CAIRN_MUNDO) {
                                document.location.href = "./cesta.php";        
                            } else {
                                document.location.href = "./panier.php";    
                            }

                        }
                    }
                    else {
                        console.log("Erreur lors du recalcul des montants suite à la suppression d'un élément du panier");
                        panier.showError("remove", "error-refresh");
                    }
                }
                // Erreur lors de la suppression
                else {
                    console.log("Erreur lors de la suppression de l'élément du panier");
                    panier.showError("remove", "error-remove");
                }

                // Debug
                if(debugPanier === true) { console.log(response); }
            }
        );
    }
}

// Application d'un code promo
panier.applyCodepromo = function() {
    // Récupération des données
    var data = $('#form-panier-code-promo').serialize();

    // Call
    $.ajax({
        url : 'index.php?controleur=User&action=panierApplycodepromo',
        type : 'POST',
        data: data,
        dataType: 'json',
        success : function(response) {
            // Reset des erreurs éventuelles
            panier.resetError("codepromo");

            // Application du code promo
            if(response.statut == "success") {
                // Sauvegarde et reload
                reloadAfterSave = true;
                panier.sauvegarde(reloadAfterSave);
            }
            // Erreur lors de l'utilisation d'un code promo
            else {
                console.log("Erreur lors de l'application d'un code");
                panier.showError("codepromo", "erreur-" + response.statut, false);
            }
        },
        // Erreur de connexion
        error: function(xhr, status) {

        },
        // Débug de la requête
        complete: function() {
            if(debugPanier === true) {
                console.log("AJAX URL: \n"+this.url);
                console.log("AJAX DEBUG: \n"+this.url+"&"+this.data);
                console.log("DATA SENT: \n");
                // Affichage des paramètres
                values = this.data.split("&");
                values.forEach(function(value) {
                    console.log(value.replace("=", " : "));
                })
            }
        }
    });
}

// Supprime un code promo du panier
panier.removeCodepromo = function(codePromo) {
    // Call
    $.ajax({
        url : 'index.php?controleur=User&action=panierRemoveCodepromo',
        type : 'POST',
        data: {'code-promo':codePromo},
        success : function(response) {
            // Sauvegarde et reload
            reloadAfterSave = true;
            panier.sauvegarde(reloadAfterSave);
        },
        // Erreur de connexion
        error: function(xhr, status) {

        },
        // Débug de la requête
        complete: function() {
            if(debugPanier === true) {
                console.log("AJAX URL: \n"+this.url);
                console.log("AJAX DEBUG: \n"+this.url+"&"+this.data);
                console.log("DATA SENT: \n");
                // Affichage des paramètres
                values = this.data.split("&");
                values.forEach(function(value) {
                    console.log(value.replace("=", " : "));
                })
            }
        }
    });
}
// ######### ACTIONS FUNCTIONS #########




// ######## INTERFACE FUNCTIONS ########
// Cache l'ensemble des erreurs du panier (adresse, ...)
panier.resetError = function(type) {
    $("[id^='"+type+"--']").fadeOut(500, function() {
        // On cache le message
        $(this).addClass("hide");
        // Repositionnement des boutons
        panier.setBtnBarPosition();
    }).fadeIn();
}
// Afficher l'erreur du panier (adresse, ...)
panier.showError = function(type, id, autoReset) {
    // IE ne permet pas de définir un paramètre à false dans la fonction
    // Ces lignes sont obligatoires pour ne pas que le javascript bug
    if (autoReset == undefined) { autoReset = true; }

    // Reset
    panier.resetError();
    // Affichage de l'erreur
    $("#"+type+"--"+id).removeClass("hide");

    // Suppression du message automatiquement
    if(autoReset) {
        setTimeout(function() {
            panier.resetError(type);
         }, 3000);
    }

    // Repositionnement des boutons
    panier.setBtnBarPosition();
}

// Repositionnement de la barre des boutons (Retour / Checkout)
// Exécution : Lorsqu'on ouvre/ferme un des panneaux de formulaire ET lorsque l'on supprime un élément du panier
maxResizeRepetition   = 5;
resizeCount           = 0; // Compteur d'exécution de la fonction pour éviter qu'elle ne tourne en rond
panier.setBtnBarPosition = function() {
    // Définition des points de repères
    markLeft        = $("#form-end-content").position().top;        // Position vertical du repère coté formulaire
    markRight       = $("#aside-end-content").position().top;       // Position vertical du repère coté tuiles
    btnsBar         = $("#panier-btn-bar");                         // Barre des boutons

    leftContent     = $(".panier-wrapper .details-utilisateur");
    rightContent    = $(".panier-wrapper .liste-elements");

    // Exécution demandée
    if(resizeCount < maxResizeRepetition) {
        // Récupération de la taille de l'écran
        var viewportWidth   = $(window).width();
        var viewportHeight  = $(window).height();

        var contentWidth    = $(document).width();
        var contentHeight   = $(document).height();

        // Reset
        btnsBar.removeClass("fixed");
        btnsBar.removeAttr("style");
        leftContent.removeAttr("style");
        rightContent.removeAttr("style");

        // Desktop
        if(viewportWidth > MOBILE_CART_WIDTH) {
            // Définition du positionnement idéal des boutons
            // La barre des boutons est affichée de façon fixed (sticky) ...
            // ...Si les repères sont sous la ligne du viewport
            if(markLeft > viewportHeight || markRight > viewportHeight) {
                // Assignation de la hauteur
                btnsBar.addClass("fixed");
                // Ajout d'un padding en bas de page
                leftContent.css("padding-bottom", "60px");
                rightContent.css("padding-bottom", "60px");
            }
            // Position variable
            else {
                // Définition de la hauteur la plus grande
                var nTop = (markLeft > markRight) ? markLeft : markRight;
                // Assignation de la hauteur
                btnsBar.css("top", nTop);
            }
        }
        // Mobile
        else {
            // Assignation de la hauteur
            //btnsBar.addClass("fixed");
        }

        // Affichage de la barre
        btnsBar.removeClass("hide");

        // Conservation des données
        storeMaktLeftPosition = markLeft;
        storeMaktRightPosition = markRight;

        // Reset du compteur
        resizeCount++;
    }

    // Relance automatique
    if(resizeCount < maxResizeRepetition) {
        setTimeout(panier.setBtnBarPosition, 100);
    }
    // Arrêt et réinitialisation
    else {
        resizeCount = 0;
    }
}
// ######## INTERFACE FUNCTIONS ########


// ########### CART WARNING ############
// Repositionnement des warnings
panier.setWarningPosition = function() {
    // Récupération de la taille de l'écran
    var viewportWidth   = $(window).width();
    var viewportHeight  = $(window).height();

    // Parcours des warnings
    $(".cart-warning").each(function(index) {

        // Desktop
        if(viewportWidth > MOBILE_CART_WIDTH) {
            // Récupération des données pour identification
            var idRevue     = $(this).data("idRevue");
            var idNumero    = $(this).data("idNumero");
            var idArticle   = $(this).data("idArticle");

            // Taille du warning
            var warningSize = $(this).innerWidth();
            var gutterSize  = 5;

            // Récupération du positionnement de la cible
            var target      = $(".article-list-item[data-id-revue='"+idRevue+"'][data-id-numero='"+idNumero+"'][data-id-article='"+idArticle+"']");
            var targetPos   = target.offset();

            // Repositionnement du warning
            $(this).css("position", "absolute").css("top", targetPos.top).css("left", targetPos.left - warningSize - gutterSize).removeClass("hide");
        }
        // Mobile
        else {
            // Remise à zéro des styles => responsive
            $(this).attr("style", false);
        }
    });
}

// Marquer un warning comme vu
panier.warningMarkAsRead = function(idWarning) {
    // Récupération des valeurs
    var total = $(".cart-warning").length;
    var nbre  = total - 1;

    // Masquage du warning
    $("#"+idWarning).remove();

    // Suppression du block de Warning
    if(nbre == 0) { $("#panier-warnings").remove(); }

    // Enregistrement
    $.post("./index.php?controleur=User&action=markCartWarningAsRead", { idWarning: idWarning });

    // Repositionnement
    panier.setWarningPosition();
}

// Suppression d'un élément via Warning
panier.warningRemove = function(idWarning, type, id, extra) {
    // Marquage
    panier.warningMarkAsRead(idWarning);

    // Retirer du panier
    panier.remove(type, id, extra);
}
// ########### CART WARNING ############