var readingListId = $("#readingListId").text()
var openAddPublicationAfterSubmit = false
var checkOnOpen = false

readingLists = {}

$(document).ready(function () {
    $('.sort-option').niceSelect();
    $('.content-full').sortable({
            onUpdate: readingLists.dragAndDropReorder,
            handle: ".swap-icon"
        }
    );
    // Chargement et application du style d'affichage d'une liste de lecture
    let display = localStorage.getItem('reading-list-display-' + readingListId);
    if (display === "list") {
        readingLists.toggleListView();
    } else {
        readingLists.toggleTileView();
    }
});

readingLists.addPublicationToReadingLists = function () {
    readingListsIds = {}
    publicationId = $('.modal-publication-id').html()
    $(".modal-body-line").each(function () {
        input = $(this).find('input')
        if (input.is(':checked') && input.attr('data-exists') === undefined) {
            readingListsIds[input.attr('id')] = true
        }
        if (!input.is(':checked') && input.attr('data-exists') !== undefined) {
            readingListsIds[input.attr('id')] = false
        }
    });

    if ($(".form-group input:checkbox:checked").length > 0) {
        $("#biblio-button-" + publicationId).addClass('icon-biblio-checked').removeClass('icon-biblio-add');
    } else {
        $("#biblio-button-" + publicationId).addClass('icon-biblio-add').removeClass('icon-biblio-checked');
    }

    $.post("./index.php?controleur=ListeLecture&action=addPublicationToReadingLists", {
        readingListsIds: JSON.stringify(readingListsIds),
        publicationId: publicationId
    }, function (response) {
        if (response) {
            $("#add-to-reading-list").modal('hide')
        }
    });
}

readingLists.deletePublicationFromReadingList = function (publicationId) {
    $.post("./index.php?controleur=ListeLecture&action=deletePublicationFromReadingList", {
        readingListId: readingListId,
        publicationId: publicationId
    }, function (response) {
        if (response) {
            location.reload();
        }
    });
}

readingLists.upsertReadingList = function () {

    let readingList = {}
    $("#upsert-reading-list .form-group :input").each(function(){
        readingList[$(this).attr('id')] = $(this).val()
    });

    $('#add-to-reading-list').on('shown.bs.modal', function () {
        openAddPublicationAfterSubmit = false
    })

    $.post("./index.php?controleur=ListeLecture&action=upsertReadingList", {
        readingList: JSON.stringify(readingList)
    }, function (response) {
        if (response) {
            if (openAddPublicationAfterSubmit) {
                checkOnOpen = response
                $("#upsert-reading-list").modal('hide')
                $('#upsert-reading-list').on('hidden.bs.modal', function () {
                    $("#upsert-reading-list").remove();
                    modals.loadModal("add-to-reading-list", openAddPublicationAfterSubmit)
                    $('#add-to-reading-list').on('shown.bs.modal', function () {
                        $('#' + checkOnOpen).attr("checked", "")
                        $('#' + checkOnOpen).prop('checked', true)
                        checkOnOpen = false
                    })
                })
            } else {
                location.reload();
            }
        }
    });
}

readingLists.updatePrivacy = function (privacy) {
    $.post("./index.php?controleur=ListeLecture&action=updateReadingListPrivacy", {
        readingListId : readingListId,
        privacy : privacy
    }, function (response) {
        if (response) {
            location.reload();
        }
    });
}

readingLists.follow = function (readingListId) {
    $.post("./index.php?controleur=ListeLecture&action=followReadingList", {
        readingListId : readingListId
    }, function (response) {
        if (response) {
            location.reload();
        }
    });
}

readingLists.unfollow = function (readingListId) {
    $.post("./index.php?controleur=ListeLecture&action=unfollowReadingList", {
        readingListId : readingListId
    }, function (response) {
        if (response) {
            location.reload();
        }
    });
}

readingLists.delete = function () {
    $.post("./index.php?controleur=ListeLecture&action=deleteReadingList", {
        readingListId : readingListId
    }, function (response) {
        if (response) {
            window.location.href= './mes-listes.php;'
        }
    });
}

readingLists.addToCart = function () {
    const params = new URLSearchParams(window.location.search)
    $.post("./index.php?controleur=ListeLecture&action=addReadingListToCart", {
        readingListId : readingListId
    }, function (response) {
        if (response) {
            window.location.href= './panier.php?' + params.toString()
        }
    });
}

readingLists.duplicate = function (readingListId, mode) {
    $.post("./index.php?controleur=ListeLecture&action=duplicateReadingList", {
        readingListId : readingListId,
        mode : mode
    }, function (response) {
        if (response) {
            window.location.href = './liste-' + response
        }
    });
}

readingLists.createListBeforeAdding = function (publicationId) {

    $("#add-to-reading-list").modal('hide')
    $('#add-to-reading-list').on('hidden.bs.modal', function () {
        $("#add-to-reading-list").remove();
        modals.loadModal("upsert-reading-list")
    })
    openAddPublicationAfterSubmit = publicationId
    return true
}

readingLists.toggleTileView = function() {
    if (readingListId) {
        let contentSelector = $(".content-full");
        if (contentSelector.hasClass("list-view")) {
            contentSelector.removeClass("list-view");
            $(".toggle-tile-icon").addClass("active");
            $(".toggle-list-icon").removeClass("active");
        }
        localStorage.setItem('reading-list-display-' + readingListId, 'tile');
        $('.article-list-item').matchHeight();
    }
}

readingLists.toggleListView = function () {
    if (readingListId) {
        let contentSelector = $(".content-full");
        if (!contentSelector.hasClass("list-view")) {
            contentSelector.addClass("list-view");
            $(".toggle-list-icon").addClass("active");
            $(".toggle-tile-icon").removeClass("active");
        }
        localStorage.setItem('reading-list-display-' + readingListId, 'list');
    }
}

readingLists.dragAndDropReorder = function() {
    reorderDatas = {}

    $( ".article-list-item" ).each(function( index ) {
        reorderDatas[index] = $(this).attr("data-id-article") ||  $(this).attr("data-id-numero")
    });

    $.post("./index.php?controleur=ListeLecture&action=reorderReadingList", {
        readingListId: readingListId,
        reorderDatas: JSON.stringify(reorderDatas)
    }, function (response) {
        if (response) {
            if ($( ".sort-option option:selected" ).val() !== 'ordre')
            $(".sort-option").val('ordre').change();
        }
    });
}


$(".my-lists-menu li").each(function () {
    if (this.firstElementChild.href === window.location.href) {
        $(this).addClass("active")
    }
});
