(function($) {
  "use strict";

  function prevalidateAuthentication(data) {
    $.post('index.php?controleur=User&action=prevalidateAuthentication', data)
    .done(function(response) {
      window.location = response['auth-url'];
    }).fail(function(response) {
      let idModal = "#modal-erreur-connexion-unknown";
      if (response.responseJSON) {
        if (response.responseJSON.type === 'AuthenticationBadIdentifierException') {
          idModal = "#modal-erreur-connexion-identifier";
        } else if (response.responseJSON.type === 'AuthenticationBadPasswordException') {
          idModal = "#modal-erreur-connexion-password";
        }
      }
      cairn.close_loading_message();
      $(idModal).modal('show');
    });
  }

  $.fn.cairnAuthenticate = function(emailInputId, passwordInputId, rememberInputId, redirectOnSuccessId) {
    emailInputId = emailInputId || 'email_input';
    passwordInputId = passwordInputId || 'password_input';
    rememberInputId = rememberInputId || 'remember';
    redirectOnSuccessId = redirectOnSuccessId || 'redirectOnSuccess';

    return $.fn.cairnDirectAuthenticate(
      document.getElementById(emailInputId).value || null,
      document.getElementById(passwordInputId).value || null,
      document.getElementById(rememberInputId).checked || false,
      document.getElementById(redirectOnSuccessId) || null,
    );
  }

  $.fn.cairnDirectAuthenticate = function(email, password, remember, redirectOnSuccess) {
    let urlParams = new URLSearchParams(window.location.search);
    // Récupération depuis le DOM
    if (redirectOnSuccess instanceof HTMLElement) redirectOnSuccess = redirectOnSuccess.value;
    // Récupération depuis un paramètre de l'url
    if (!redirectOnSuccess) redirectOnSuccess = urlParams.get('redirectOnSuccess') || null;
    // Rien n'existe, prise en compte de toute l'url
    if (!redirectOnSuccess) redirectOnSuccess = '/' + window.location.href.substring(SETTINGS.baseUrl.length);

    let params = {
      email: email || null,
      password: password || null,
      remember: remember || false,
      redirectOnSuccess: redirectOnSuccess,
    }
    if (SETTINGS.isProxy) {
      params.proxyBaseUrl = SETTINGS.baseUrl;
    }

    cairn.show_loading_message();
    prevalidateAuthentication(params);
  }
})(jQuery);
