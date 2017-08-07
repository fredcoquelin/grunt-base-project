// constructeur de l'objet
var ObjBouton = function() {
    this._timer = null;
    this.$current = null;
    this.initialisation();
}

// methodes publiques de l'objet
ObjBouton.prototype = {
    // initialisation complete
    initialisation: function() {

        // gestion des box
        this.initbox();
    },
    // initialise un bouton
    initbox: function() {
        var refobjet = this;

        $(document).on("click", "[data-action='box'][data-evt!='mouseover']", function(e) {

            var $elt = $(this);
            if ($(e.target).hasClass("ico-close")) {

                $(e.target).parent().remove();

                if ($elt.data("after-remove")) {
                    eval($elt.data("after-remove"));
                }

                return false;
            }

            refobjet.box($(this), "click");

            return false;
        });

        $(document).on("mouseover", "[data-action='box'][data-evt='mouseover']", function(e) {
            refobjet.box($(this), "mouseover")
        });
    },
    // affichage d'une box (pour les cas multiples suivants les evts
    box: function($elt, _evt) {
        var refobjet = this;

        // reference
        $reference = $("#" + $elt.data("reference"));
        $destination = $("#" + $elt.data("destination"));
        var $async = $elt.data("asynchronous") ? $elt.data("asynchronous") : false;

        // si data-ajax on gère le loading
        if ((!$reference.size() && $elt.attr("data-ajax") && !$elt.attr("data-init")) || ($destination.size())) {

            var _url = $elt.attr("data-ajax");

            if ($reference.size() && !$destination.size())
                $reference.remove();

            $.ajax({
                url: _url,
                method: "post",
                dataType: "html",
                async: $async,
                success: function(_html) {

                    if ($destination.size()) {
                        $destination.html(_html);
                        $reference = $destination;
                    }
                    else {
                        $("body").append(_html);
                        $reference = $("#" + $elt.data("reference"));
                    }

                },
                error: function() {
                }
            });

            $elt.attr("data-init", true);

        }

        // positionne la box
        //refobjet.setboxposition($elt);

        // desactive le clic sur le body
        $('body').off(_evt);

        // si une box est deja ouvert on ferme
        if (refobjet.$current != null && refobjet.$current.size()) {
            //refobjet.$current.hide();
            //refobjet.$current = null;
        }

        if (refobjet.$current != null && refobjet.$current.size() && refobjet.$current[0] == $reference[0]) {
            refobjet.$current = null;
            return false;
        }

        // supp le timer
        clearTimeout(refobjet._timer);

        // affichage de la reference
        //$reference.show();
        $reference.toggle();

        // maj de la box courante
        refobjet.$current = $reference;

        // lancer le timer pour le blur de fermeture
        refobjet._timer = setTimeout(function() {

            // blur action
            $('body').one(_evt, function() {
                refobjet.$current.hide();
            });

        }, 500);


    },
    // positionne la boite
    setboxposition: function($elt) {
        var $reference = $("#" + $elt.attr("data-reference"));
        var _offset = $elt.offset();
        var _top = _offset.top + parseInt($elt.css("height"));
        var _left = _offset.left;
        if ($elt.attr("data-reference-position-x") == "right")
            _left = _left + parseInt($elt.css("width")) - parseInt($reference.css("width"));
        $reference.css({"top": _top, "left": _left});
    }
}


// Initialisation
objBouton = new ObjBouton();