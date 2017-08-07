/*-----------------------------------------
*       EVENTS AU DOM READY
-----------------------------------------*/

/*-----------------------------------------------
    Initialisation des formulaires
-----------------------------------------------*/

$('form').each(function(){
    $(this).rjform();
});





/*--------------------------------------
    Initiliasation custom validator jquery
--------------------------------------*/

// Les éléments qui ont l'attribut "booleanmustbetrue" sont requis pour la validation du formulaire
$.validator.unobtrusive.adapters.addBool('enforcetrue', 'required');





/*-----------------------------------------------
    Gestion des onglets
-----------------------------------------------*/

$('ul.menu-onglets').each(function(){
    var $ul = $(this),
        $contOnglets = $ul.next('.contenu-onglets').find('.onglet'),
        $onglet = $ul.find('li a');

        $onglet.bind("click touchstart", function(){

            var $li = $(this).parent(),
                index = $li.index();

            if($(this).hasClass('selected')) {
                return false;
            } else {
                $contOnglets.hide().removeClass('current');
                $onglet.removeClass('selected');
                $contOnglets.eq(index).show();
                $(this).addClass('selected');
                return false;
            }
        });
});






/*-----------------------------------------------
    Patch pour gestion placeholder iE8
-----------------------------------------------*/

$('.lt-ie8 [placeholder], .ie9 [placeholder]').focus(function() {
  var input = $(this);
  if (input.val() === input.attr('placeholder')) {
    input.val('');
    input.removeClass('placeholder');
  }
}).blur(function() {
  var input = $(this);
  if (input.val() === '' || input.val() === input.attr('placeholder')) {
    input.addClass('placeholder');
    input.val(input.attr('placeholder'));
  }
}).blur();


$('.lt-ie8 form, .ie9 form').submit(function() {

    var $form = $(this),
        $input = $form.find('input');

    $input.each(function(){
        var placeholder = $(this).attr('placeholder');

        if ($(this).val() === placeholder) {
            $(this).val("");
        }
    });

});






/*-----------------------------------------------
    Gestion des cookies en JS
-----------------------------------------------*/

$(function() {
    var cnil = $.cookie('cnil');
    if (!cnil) { // Cookie non présent
        $.cookie('cnil', 1, { expires:365, path:'/' });
        $(".cookies").show();
        return;
    }
    if(cnil < 1) { // Bandeau affiché sur moins de trois pages
        cnil = $.cookie('cnil') + 1;
        $.cookie('cnil', cnil , {expires:365, path:'/'});
        $(".cookies").show();
        return;
    }
    // Sinon on peut dégager du dom
    $(".cookies").remove();
    // On repousse l'expiration
    if($.cookie('cnil') !== null)
    {
        $.removeCookie('cnil', { path: '/' });
    }
    $.cookie('cnil', 4, { expires:365, path:'/' });
});


$('.cookies .picto-lightbox-close-white').click(function(){
    // Si l'utilisateur clique on dégage
    // et on ajoute les visus direct
    $('.cookies').remove();
    // On repousse l'expiration
    if($.cookie('cnil') !== null)
    {
        $.removeCookie('cnil', { path: '/' });
    }
    $.cookie('cnil', 4, { expires:365, path:'/' });
});