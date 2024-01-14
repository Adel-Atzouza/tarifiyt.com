// Lorsque l'on sélectionne le moyen de paiement "Crédit d'article",
// on affiche un message de validation et on désactive si nécessaire le
// bouton de finalisation de la commande.
// (voir Vue/User/panierPaiement.php)
var paiementBtnOnclick = ''; // Permet de conserver la valeur du onClick du bouton de paiement

function getCreditArticleStatut() {
    // Cache le statut
    $('.credit-statut').hide();
    $('.btn-basket').css('opacity', '1');

    // Remise à zéro
    if(paiementBtnOnclick != '') {
        $('.btn-basket').attr('onclick', paiementBtnOnclick);
    }

    // Affichage du statut
    if($("[data-id='paiement-par-credit']").prop('checked')) {
        // Message
        $('.credit-statut').show();

        // Statut
        var isValid = $('.credit-statut').data('creditValide');

        // Si le crédit n'est pas valide, on empêche la soumission du formulaire
        if(isValid == 0) {
            // Sauvegarde du onClick
            if(paiementBtnOnclick == '') {
                paiementBtnOnclick = $('.btn-basket').attr('onclick');
            }
            // Attenuation du bouton
            $('.btn-basket').css('opacity', '0.5');
            // Désactivation du bouton
            $('.btn-basket').attr('onclick', '');
        }
    }
}
