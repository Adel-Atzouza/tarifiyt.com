modals = {}

$(document).ready(function () {
    modals.triggerModalOnPageLoad()
});


// INJECTION DE MODALES
modals.loadModal = function (divId, resourceId) {
    modals.removeModal(divId)

    // Demande de la modale au controleur PHP
    modal = modals.getModal(divId, resourceId)

    // Injection dans le corps de la page
    $('#contenu').append(modal)

    //Affichage de la modale
    $("#" + divId).modal('show')

    //Action spécifiques au chargement de la modale
    modals.onLoadModal(divId)

}

//CHARGEMENT DE MODALES
modals.getModal = function (divId, resourceId) {
    var controler = ""
    if (divId.includes("reading-list")) {controler = "ListeLecture"}
    if (divId.includes("tap")) {controler = "Pages"}
    returnValue = false
    $.ajax({
        url: "./index.php?controleur=" + controler + "&action=get" + camelize(divId) + "Modal",
        data: {resourceId: resourceId},
        method: "POST",
        async: false
    }).done(function (response) {
        returnValue = response
    });
    return returnValue
}

//SUPPRESSION DE MODALES
modals.removeModal = function (divId) {
    // Suppression de la modale
    $("#" + divId).remove();
    return true
}

//APRES CHARGEMENT DE LA MODALE
modals.onLoadModal = function (modalId) {
    switch(modalId) {
        case "share-reading-list":
            new Clipboard('.btnCopyClipboard');
            break;
        case "upsert-reading-list":
            $('.privacy-option').niceSelect()
            $('#title').limitText({
                limit: 80,
                warningClass:'text-danger',
            })
            $('#description').limitText({
                limit: 250,
                warningClass:'text-danger',
            })
            $('#aliasAuthor').limitText({
                limit: 40,
                warningClass:'text-danger',
            })
            $('[data-toggle="tooltip"]').tooltip({container: '#upsert-reading-list'})
            break;
        default:
            break;
    }
}

modals.triggerModalOnPageLoad = function () {
    let queryString = window.location.search;
    let urlParams = new URLSearchParams(queryString);
    let tap = urlParams.get('tap')

    if (tap) {
        resource_id = tap
    } else {
        if (document.querySelector('meta[name="DCSext.pn_nID"]') !== null) {
            resource_id = document.querySelector('meta[name="DCSext.pn_nID"]').content
        } else {
            resource_id = null;
        }
    }

    if (resource_id !== null) {
        if (urlParams.has('modal') && document.title.indexOf("Connexion") === -1 ) {
            modals.loadModal(urlParams.get('modal'), resource_id )
        }
    }
}

function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '').replace(/[^\w\s]/gi, '')
}