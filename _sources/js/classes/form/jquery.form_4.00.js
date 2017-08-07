/**
*
*  @author Julien Trotoux <jtrotoux@regionsjob.com>
*  @maj desactivation selectboxit sur ie
*
*/

(function($) {

  // plugin jquery


  //@note plugin jquery
  $.fn.rjform = function(options)
  {
    return new $rjform(this);
  };


  // @constructeur
  function $rjform($form) {
    this.$form = $form;
    this._identifiant = this.$form.attr("id");
    this.$form.data("object", this);
    this._submited = false;
    this._indices = new Array();
    this._enablehistory = (history && history.pushState) ? true : false;

    this.controleTypes = {
      _tempsreel: "1",
      _sortiedechamp: "2",
      _submit: "3" // by default
    },
    //* @note default parameters
    this.options = {
      // debug
      _debug: false,
      _majurl: true,
      // timers
      _timers: {
        _error: 0
      },
      // errors
      _errors: {
        _destination: "" // void ou top ou precision
      },
      // messages d'erreur
      _messages: {
        _errors: {
          _require: "Ce champ est obligatoire",
          _lenght: "Le nombre de caractère n'est pas conforme",
          _remote: "Le champ n'est pas valide",
          _confirmation : "Les 2 champs ne correspondent pas"

        }
      },
      // valeur par defaut
      _range: {
        _step: 10,
        _min: 0,
        _max: 100
      },
      // classes
      _classes: {
        _default: "grise",
        _waiting: "wait",
        _error: "erreur",
        _information: "information",
        _confirmation: "confirmation"
      },
      // attributs html5
      _attributes: {
        // deja init
        _init: "data-init",
        // sur le form
        _ajax: "data-ajax", // submit en ajax ou pas

        // sur les elts du form
        _default: "data-val-default", // val par defaut
        _focus: "data-val-focus", // val par defaut

        _beforesubmit: "data-beforesubmit", // action beforesubmit
        _aftersubmit: "data-aftersubmit", // action aftersubmit
        _loading: "data-loading",
        _precision: "data-precision", // information message about element

        _formReference: "data-form-reference", // a.submit notamment

        _indice: "data-indice",
        _disabled: "data-disabled",
        _majurl: "data-majurl",
        _timers: {
          _error: "data-timer-error"
        },
        _href: "data-href",
        _errors: {
          _destination: "data-val-error-dest", // par défaut top , sinon "precision"
          _require: "data-val-required", // error message if empty
          _regex: "data-val-regex", // error message if regex
          _lenght: "data-val-length", // error message if length not correct
          _remote: "data-val-remote", // error message if syntax error (email)
          //_confirmation : "data-val-error-confirmation"
          _confirmation: "data-val-equalto"
        },
        _controles: {
          _enable: "data-val", // indique d'un controle doit se faire : pas utilisé à ce jour
          _type: "data-controle-type", // type de controle : tps reel, blur, submit
          _require: "data-val-required",
          _regex: "data-val-regex-pattern",
          _format: "data-controle-format", // string format (email)
          _max: "data-val-length-max", // max-length
          _min: "data-val-length-min", // min-length
          _start: "data-controle-start", // min length before control
          //_confirmation: "data-val-confirmation"
          _confirmation: "data-val-equalto-other"
        },
        _autocomplete: {
          _url: "data-autocomplete-url", // url autocomplete
          _enabled: true,
          _options: {
            _delay                  : "data-autocomplete-delay",
            _appendto               : "data-autocomplete-appendto",
            _minLength              : "data-autocomplete-minchars",
            _autoFill		: "data-autocomplete-autofill",
            _autoFillStyle		: "data-autocomplete-autofill-style",
            _autoFocus              : "data-autocomplete-autofocus"
          },
          _classname: "data-autocomplete-classname"
        },
        _range: {
          _step: "data-range-step", // incrementation
          _min: "data-range-min", // minimum
          _max: "data-range-max" // maximum
        }

      },
      // autocomplete
      _autocomplete: {
        _options: {
          _delay        : 0,
          _appendto     : "body",
          _minLength    : 1,
          _autoFocus	: true,
          _autoFill   	: false
        }
      }
    }

    // initalisation
    this.initialise();
  }

  // @methodes publiques
  $rjform.prototype = {

    // @note this function initialise all behaviors on all form elements
    initialise : function() {

      if(this.$form.attr(this.options._attributes._init)=="true")   {
        return false;
      }


      // parametre de l'objet
      if(this.$form.attr(this.options._attributes._timers._error)) this.options._timers._error = this.$form.attr(this.options._attributes._timers._error);
      if(this.$form.attr(this.options._attributes._errors._destination)) this.options._errors._destination = this.$form.attr(this.options._attributes._errors._destination);
      if(this.$form.attr(this.options._attributes._majurl)) this.options._majurl = this.$form.attr(this.options._attributes._majurl);

      //this.disableButton();

      // si data-precision
      if(this.$form.attr(this.options._attributes._precision)==true || this.options._errors._destination == "precision") this.setPrecision();

      this.setDefaultValue();
      this.setFocus();
      this.initSuccess();
      this.initActions();
      // this.initSubmit();
      this.setControles();
      //this.selectBox();
      this.initDate();
      //this.initSelect();
      this.initCheckList();
      this.initCheckContigue();
      this.initRange();
      this.initSelectCountry();
      this.setAutocomplete();

      // on set le init
      this.$form.attr(this.options._attributes._init,"true");

      // subscribe event upload start emitted by jquery.upload_2.00
      $.subscribe('UPLOAD_START', function() {
        // upload start
        if (this.$form.find("button.submit.valid-form").length > 0) {
          this.$form.find("button.submit.valid-form").attr("disabled", "true");
        }
      }.bind(this));

      // subscribe event upload end emitted by jquery.upload_2.00
      $.subscribe('UPLOAD_END', function() {
        // upload stop
        if (this.$form.find("button.submit.valid-form").length > 0) {
          this.$form.find("button.submit.valid-form").removeAttr("disabled");
        }
      }.bind(this));

    },

    // @note this function init actions
    initActions : function() {
      var refobjet = this;
      this.$form.find("a.fermer").on("click",function() {
        refobjet.$form.hide();
      });
    },

    // desactivation boutons
    disableButton:function() {
      this.$form.find("button[type='submit']").on("click",function() {
        return false;
      });
    },

    initCheckList:function() {
      // Test des listes checkbox (ex: dépot de CV étape 2)

      $('.check-list > li').each(function(){
        var liParent = $(this),
            pParent = liParent.find('> p'),
            checkParent = liParent.find('> input'),
            ulChild = liParent.find('ul'),
            checkChild = ulChild.find('input');

          // Coche de la catégorie parente
          checkParent.on('change', function(){
            if (checkParent.is(':checked')) {
              checkChild.attr('checked', true);
              //liParent.addClass('expanded');
            } else {
              checkChild.attr('checked', false);
              //liParent.removeClass('expanded');
            }
          });

          pParent.on('click', function(){
            liParent.toggleClass('expanded');
          });

          // Coche d'une catégorie enfant
          checkChild.on('change', function(){
            if(!(checkChild.is(':checked'))) {
              //ulChild.hide();
              //liParent.removeClass('expanded');
              checkParent.attr('checked', false);
            }
          });
        });
    },


    /************************************************************************************************************************************************************
    *                                             Gestion des checkbox contigües (Tranche salaire compte candidat)
    ************************************************************************************************************************************************************/
    initCheckContigue: function() {

        this.$form.each(function(){
            var $form1 = $(this),
                $list = $form1.find('.checkbox-contigue');

            $list.each(function(){
                var $list = $(this),
                    $check = $('input[type="checkbox"]', $list),
                    nbCheck = $check.length;

                $check.change(function(){
                    var $elt = $(this),
                        $prev = $elt.parent().prev().find('input'),
                        $next = $elt.parent().next().find('input'),
                        nbChecked = 0;

                    //Comptabilisation du nombre de cases cochées
                    for(i=0; i<nbCheck; i++) {
                        if ($check.eq(i).is(':checked')) {
                            nbChecked++;
                        }
                    }

                    if (nbChecked !== 0 && nbChecked !== 1) {
                        if (nbChecked > 1 && nbChecked < 3) {
                            if ($prev.is(':not(:checked)') && $next.is(':not(:checked)')) {
                                $check.attr('checked', false);
                                $prev.prop('checked', true);
                                $elt.prop('checked', true);
                            }
                        } else {
                            $check.attr('checked', false);
                            $elt.prop('checked', true);
                            $prev.prop('checked', true);
                        }
                    }
                });
            });

        });
    },


    // @note this function init submit action
    initSubmit : function() {

      var refobjet = this;

      this.$form.on("ajaxsubmit",function(e,_data) {
        refobjet.setIndice();

        // si _data alors on est en mode ajax history on ne test pas les champ
        if(_data) {
          refobjet.ajaxSubmit(_data);
        }

        // par defaut on valide les champ en amont
        else {
          refobjet.launchSubmit();
        }

      });

      this.$form.on("simplesubmit",function() {
        //refobjet.setIndice();
        //refobjet.launchSubmit();
        refobjet.$form.submit();
        return false;
      });

      this.$form.find("input[type=submit], a.submit["+this.options._attributes._formReference+"], button[type='submit']").on("click", function () {
        refobjet.setIndice();
        refobjet.launchSubmit();
        return false;
      });
    },

    // submitage du form
    launchSubmit:function() {

      // par defaut , on vide tous les messages d'erreur
      this.unsetAllErreur();
      var retour = true;

      // before submit s'il y a
      if(typeof(this.$form.on("beforesubmit"))) this.$form.trigger("beforesubmit");
      if(this.$form.attr(this.options._attributes._beforesubmit)) eval(this.$form.attr(this.options._attributes._beforesubmit));

      if(this.launchesControles()) {

        // mode ajax ...
        if(this.$form.attr(this.options._attributes._ajax)) {
          this.ajaxSubmit()
          retour = false;
        } else {
          this.$form.submit();
          retour = true;
        }

      } else {
        var _ancre = this.$form.attr("id");
        if(typeof(_ancre) != "undefined" && this.options._errors._destination=="top") window.location.href="#"+_ancre;
        retour = false;
      }

      return retour;
    },

    // @note this function init success action
    initSuccess : function() {
      var refobjet = this;
      this.$form.success = function(_message,_success) {

        var $_form = $(this);
        $_form.addClass("success").find("fieldset").fadeOut("normal",function() {

          if(refobjet.$form.attr(refobjet.options._attributes._loading) != "false") $_form.removeClass("loading");

          if(_message) {
            var _classe = (_success) ? refobjet.options._classes._confirmation : refobjet.options._classes._error;
            refobjet.setMessage("",_message,_classe,true) ;
          }

        });

      };
    },

    // @note this function init data selector
    initDate : function() {
      try {
        this.$form.find("["+this.options._attributes._controles._format+"='date']").datepicker();
      }
      catch(e) {

      }

    },

    // @note action sur les selects
    initSelect: function() {
      var refobjet = this;

      // redirection si data-href est preciser
      this.$form.on("change", "select["+this.options._attributes._href+"]", function(e) {

        var _href = $(this).attr(refobjet.options._attributes._href);
        var _value = $(this).val();
        _href += "?"+_value;
        window.location.href=_href;
      });
    },

    // @note this function inits input type range
    initRange: function() {

      var refobjet = this;
      this.$form.find("input.range").each(function() {

        var $elt = $(this);
        var $parent = $elt.parent().parent();

        $parent.slider({
          range: "min",
          value: parseInt($elt.val()),
          step: parseInt($elt.attr(refobjet.options._attributes._range._step) ? $elt.attr(refobjet.options._attributes._range._step) : refobjet.options._range._step),
          min: parseInt($elt.attr(refobjet.options._attributes._range._min) ? $elt.attr(refobjet.options._attributes._range._min): refobjet.options._range._min),
          max:parseInt($elt.attr(refobjet.options._attributes._range._max) ? $elt.attr(refobjet.options._attributes._range._max): refobjet.options._range._max),
          slide: function(e, ui ) {
            $elt.val(ui.value);
            $elt.trigger("change");
          }
        });
        $elt.val($parent.slider("value"));
        $elt.attr("data-init",true);
      });

    },

    getformatedvalue : function(_value) {

      if(!_value) return false;

      //_value = _value.replace(/\+/g, "%2B");
      //_value = _value.replace(/\&/g, "%26");
      //  _value = _value.replace("%26nbsp;", "&nbsp;");
      _value = _value.replace("<br/>", "");
      _value = _value.replace("<br>", "");
      _value = _value.replace("<BR>", "");
      _value = _value.replace("&nbsp;", "");
      _value = _value.replace('<BR checkedByCssHelper="true">','');
      //_value = _value.replace("#", "%23");

      return _value;
    },

    // @note this function validates the form in ajax
    ajaxSubmit : function(_params) {

      var refobjet = this;
      var $form = this.$form;

      // add loading


      if(this.$form.attr(this.options._attributes._loading) != "false")
        this.$form.addClass("loading");



      // vidage des champs par defaut
      this.$form.find("["+this.options._attributes._default+"]").each(function() {

        var $elt = $(this);
        if($elt.is("div")) {
          var _valeur = $elt.html();
          if(_valeur === false) _valeur = "";
        }
        else var _valeur = $elt.val();

        //_valeur = refobjet.getformatedvalue(_valeur);

        if(_valeur === $elt.attr(refobjet.options._attributes._default)) {
          if($elt.is("div")) {
            $elt.attr("disabled","disabled");
          }
          else {
            $elt.attr("disabled","disabled");
          }
        }
      });

      // desactvation es data-disabled
      this.$form.find("["+refobjet.options._attributes._disabled+"='true']").attr("disabled", true);



      // recuperation des datas si on en a pas en parametre de la methode
      if(!_params) {

        var _data = "";
        var _indice = 0;
        this.$form.find("input[type='text'], input[type='hidden'], input[type='checkbox']:checked, input[type='radio']:checked ,textarea,select").each(function() {

          var $elt = $(this);
          var _valeur = $elt.val();

          if(_valeur) {
            _valeur = refobjet.getformatedvalue(_valeur);
            _valeur = removeNbsps(_valeur);// suppression finale des &nbsp;
          }

          if($elt.is("input") && $elt.attr("type")=="text" && (_valeur=="false" || _valeur==false)) _valeur = "";

          if(_valeur != "" && _valeur != "undefined" && $elt.data("disabled") != true ) {
            if(_indice>0) _data += "&";
            _data +=  $elt.attr("name")+"="+encodeURIComponent(_valeur);//encodeURI(_valeur);//encodeURIComponent(_valeur);
            _indice++;
          }
        });

      }

      else {
        _data = _params;
      }

      // mise en history de la recherche
      if(refobjet.options._majurl == true) {
        if(!_params) {

          if(refobjet._enablehistory) {

            if(!ObjChaine.findInText(_data,"?",0) && !ObjChaine.findInText(refobjet.$form.attr("action"),"?",0)) {
              var _href = "?"+_data;
            }
            else {
              _href = "&"+_data;
            }

            _href = refobjet.$form.attr("action") + _href

            history.pushState({_data:_data,_url:_href,_action:"objform.ajaxsubmit"},"objform.ajaxsubmit",_href);
          }
          else window.location.href="#!?"+_data;
        }

      }

      if(this._debug) console.time('jquery.from : submit ajax');

      // abort eventuel
      if(this._submited) {
        this._submited.abort();
      }

      this._submited = $.ajax({
        type:this.$form.attr("method"),//"GET",
        dataType: "json",
        url: this.$form.attr("action"),
        data: _data,
        async: true,

        success: function (json) {

          if(refobjet._debug) console.timeEnd('jquery.from : submit ajax');
          var _success = json.success;
          var _classe = (_success) ? refobjet.options._classes._confirmation : refobjet.options._classes._error;
          var _message = json.message;
          var _html = json.html;
          var _action = json.action;

          if(refobjet._debug) console.time('jquery.from : submit ajax > maj dom');
          if(_html) {
            if(typeof(_html)=="object") {
              // boucle sur chaque objet hml pour maj du dom
              for (var k in _html){
                if (_html.hasOwnProperty(k)) {
                 var $destination = $("#"+k);
                 var _content = _html[k];
                     if($destination.size() && _content != "" && _content != null) {
                       $destination.empty().html(_content);
                     }

                }
              }
            }
          }
          if(refobjet._debug)  console.timeEnd('jquery.from : submit ajax > maj dom');

          if(_action) {
            try { eval(_action); } catch(e) {};
          }

          if(_message) {
            refobjet.setMessage("",_message,_classe,true) ;
          }


          refobjet.setDefaultValue();
          if(refobjet.$form.attr(refobjet.options._attributes._loading) != "false")  refobjet.$form.removeClass("loading");

          // aftersubmit
          if(refobjet.$form.attr(refobjet.options._attributes._aftersubmit)) eval(refobjet.$form.attr(refobjet.options._attributes._aftersubmit));

        },
        error:function (xhr, ajaxOptions, thrownError){
        }
      });

      return false;

    },

    // @note this function set precision span after each element
    setPrecision : function() {

      var refobjet = this;
      this.$form.find("input,select,button,textarea").each(function() {
        var $elt = $(this);
        var _precision = ($elt.attr(refobjet.options._attributes._precision))?$elt.attr(refobjet.options._attributes._precision):"";

      // cas du radio
      if($elt.is("input:radio")) {
        if(!$elt.parent().parent().find("span:last-child").is("span")) {
          $elt.parent().parent().append("<span class='precision'>"+_precision+"</span>");
        }
      }
      // default
      else {

        if(!$elt.parent().find("span:last-child").hasClass("precision")) {
          $elt.parent().append("<span class='precision' style='display:block;'>"+_precision+"</span>");
        }
        else {
          $elt.parent().find("span:last-child").html(_precision);
        }
      }

      });
    },

    // @note this function set default value to all element having data-default attribute
    setDefaultValue : function() {

      var refobjet = this;

      this.$form.find("input[type=text]["+this.options._attributes._default+"], div[data-type='input-like']["+this.options._attributes._default+"], input[type=password]["+this.options._attributes._default+"], textarea["+this.options._attributes._default+"], select["+this.options._attributes._default+"]").each(function(){ //,input[type=search]["+this.options._attributes._default+"]","input[type=email]["+this.options._attributes._default+"]
        var $elt = $(this);

        if($elt.is("div")) {

          var _valeur = $.trim($elt.html());
      // suppression br
      _valeur = $.trim(refobjet.getformatedvalue(_valeur));
      var _default = $elt.attr(refobjet.options._attributes._default);

      if(!_valeur && _default) {
        _valeur = _default;
        $elt.html(_valeur);
      }

      }

      else {

        var _valeur = $elt.val();
        var _default = $elt.attr(refobjet.options._attributes._default);
        if(!_valeur && _default) {
          _valeur = _default;
          $elt.val(_valeur);
        }
      }

      if(_valeur == _default) {
        $elt.addClass(refobjet.options._classes._default);
      }
      });


    },

    // @note this function set behaviors on focus
    setFocus : function() {

      var refobjet = this;


      var _selecteur = "input,textarea, div[data-type='input-like']"; //, textarea, select


      this.$form

      //mouseup
      .on("mouseup", _selecteur, function(evt) {
        var $elt = $(this);

        if($elt.is("div")) {


          var _valeur = $elt.html();
          _valeur = refobjet.getformatedvalue(_valeur);
          var _default = $elt.attr(refobjet.options._attributes._default);
          _valeur = $.trim(_valeur);
          if(_valeur === _default || !_valeur) {
            //if(isIE7()) $elt.html("").removeClass(refobjet.options._classes._waiting);
            //else {
              $elt.addClass(refobjet.options._classes._waiting).html("").focus();
            //}

            $elt.html("").setCursorPosition(0);

          }


        }

        else if($elt.is("input") &&  $elt.val() == $elt.attr(refobjet.options._attributes._default)) {
          //if(isIE7()) $elt.val("").removeClass(refobjet.options._classes._waiting);
          //else
            //$elt.addClass(refobjet.options._classes._waiting).setCursorPosition(0).val("");
      // $elt.val("").setCursorPosition(0);

      }

      $elt.removeClass(refobjet.options._classes._error);

      })

      // keydown
      .on("keydown keydown_rjform", _selecteur, function(evt) {


        var $elt = $(this);
        if($elt.hasClass(refobjet.options._classes._waiting)) $elt.removeClass(refobjet.options._classes._waiting);
        if($elt.hasClass(refobjet.options._classes._default)) $elt.removeClass(refobjet.options._classes._default);

        if($elt.is("div")) {

          var _valeur = $.trim($elt.html());
      // suppression br
      _valeur = refobjet.getformatedvalue(_valeur);
      var _default = $elt.attr(refobjet.options._attributes._default);

      if( _valeur === _default){

        $elt.html("");
      }
      }

      else {
        if($elt.val()== $elt.attr(refobjet.options._attributes._default)) $elt.val("");
      }



      })



      // blur
      .on("blur", _selecteur, function(evt) {
        //if(isIE7()) return true;
        var $elt = $(this);
        var _default = $elt.attr(refobjet.options._attributes._default);
        $elt.removeClass(refobjet.options._classes._waiting);
        refobjet.setDefaultValue($elt);

        if($elt.is("div")) {
          var _val = $elt.html();
          if(!$elt.html()) $elt.html($elt.attr(refobjet.options._attributes._default));
        }
        else {
          var _val = $elt.val();
          if(!$elt.val()) $elt.val($elt.attr(refobjet.options._attributes._default));
        }
      });

      // if(!isIE7()) {

      // // focus
      // this.$form.on("focus", _selecteur, function(e) {


      //   var $elt = $(this);

      // // positionnement au debut
      // if($elt.val() == $elt.attr(refobjet.options._attributes._default) && ($elt.is("input:text") || $elt.is("textarea"))) {

      //   var _focus = $elt.attr(refobjet.options._attributes._focus);
      //   if(_focus != undefined) {
      //     $elt.val(_focus);
      //   }
      //   else $elt.addClass(refobjet.options._classes._waiting).val("").setCursorPosition(0);
      // }

      // // cas du div text
      // else if( $elt.attr("data-type") == "input-like") {
      //   var _valeur = $elt.html();
      //   _valeur = refobjet.getformatedvalue(_valeur);
      //   var _default = $elt.attr(refobjet.options._attributes._default);
      //   _valeur = $.trim(_valeur);

      //   if(_valeur === _default) {

      //     var _focus = $elt.attr(refobjet.options._attributes._focus);
      //     if(_focus != undefined && _focus != "") {
      //       $elt.html(_focus);
      //     }
      //     else {
      //       $elt.empty();
      //       $elt.addClass(refobjet.options._classes._waiting).html("&nbsp;<br/>").setCursorPosition(0);
      //     }
      //   }
      // }

      // // cas du radio
      // if($elt.is("input:radio")) {
      //   var _parent = refobjet.$form.find("input:radio[name='"+$elt.attr("name")+"']").parent();
      //   _parent.removeClass(refobjet.options._classes._default);
      //   if($elt.attr(refobjet.options._attributes._controles._type)==refobjet.controleTypes._tempsreel) {
      //     _parent.removeClass(refobjet.options._classes._error);
      //   }
      // }

      // // cas par default
      // else {
      //   $elt.removeClass(refobjet.options._classes._default);
      //   if($elt.attr(refobjet.options._attributes._controles._type)==refobjet.controleTypes._tempsreel)	$elt.removeClass(refobjet.options._classes._error);
      // }


      // return false;

      // });
      // }

    },

    // @note this function inits selectbox
    selectBox : function() {

      // Disable for iOS devices (their native controls are more suitable for a touch device)
      if (isIE() || navigator.userAgent.match(/iPad|iPhone|Android|IEMobile|BlackBerry/i)) return false;

      // si ie & ie<8 on ne l'active pas
      if(ieVersion() < 8 ) return false;

      this.$form.find("select").selectBoxIt({
        copyClasses : "container",
        theme: "bootstrap",
        autoWidth : false
      });
      $("[rel='popover']").popover();//'show'
    },

    // @note this function init all controles on bind
    setControles : function() {
      // stockage de la référence de l'objet
      var refobjet = this;

      // controles temps réél : keyup change
      this.$form.find("["+this.options._attributes._controles._type+"="+this.controleTypes._tempsreel+"]").on("keyup change", function() {
        var $elt = $(this);

        var _value = $elt.val();

      // si start est défini on controle le length de la value (only on keyup)
      if(_start = $elt.attr(refobjet.options._attributes._controles._start)) {
        if(_value.length < _start) {
          refobjet.unsetErreur($elt);
          return true;
        }
      }

      // lancement des controles
      var _isvalide = refobjet.controleElement($elt);
      if(_isvalide) refobjet.unsetErreur($elt);
      });

      // controles sortie de champ :  blur
      this.$form.find("["+this.options._attributes._controles._type+"="+this.controleTypes._sortiedechamp+"]").on("blur", function() {
        var $elt = $(this);
        var _isvalide = refobjet.controleElement($elt);
        if(_isvalide) refobjet.unsetErreur($elt);
      });


    },

    // @note this function lanches all controles
    launchesControles : function() {

      // stockage de la référence de l'objet
      var refobjet = this;

      var _isvalide = true;

      this.$form.find("input[type=text],  input[type=radio], input[type=password], input[type=checkbox] ,select,textarea").each(function() { //input[type=email], input[type=search],
        var $elt = $(this);
        var _isvalideelt = true;
        _isvalideelt = refobjet.controleElement($elt);
        if(!_isvalideelt) {
          _isvalide = false;
        }
        else {
          refobjet.unsetErreur($elt);
        }
      });

      return _isvalide;
    },

    // @note this function lanches all controles on a unique element
    controleElement : function($elt) {

      //if(this.options._debug) console.log($elt);

      // stockage de la reference de l'objet
      var refobjet = this;

      if($elt.is("select")) var _value = $elt.attr("value");
      else var _value = $elt.val();

      // cas du select
      if($elt.is("select") && _value ==0) _value = "";

      // cas du radio
      if($elt.is("input:radio")) if(!$("input:radio[name='"+$elt.attr("name")+"']:checked").size()) _value = "";

      // empty if value = default value
      if($elt.attr(refobjet.options._attributes._default) == _value) {
        _value = "";
      }

      // initialisation du retour
      var _isvalide = true;

      // require
      var _isrequired = $elt.attr(this.options._attributes._controles._require);
      if(_isrequired && (_value == null || !_value)) {
        _isvalide = false;
        _message = ($elt.attr(this.options._attributes._errors._require))?$elt.attr(this.options._attributes._errors._require):this.options._messages._errors._require;
        refobjet.setErreur($elt,_message);
        return _isvalide;
      }

      // minlenght
      var _min = $elt.attr(this.options._attributes._controles._min)
      if(_value && _value.length < _min) {
        _isvalide = false;
        _message = ($elt.attr(this.options._attributes._errors._lenght))?$elt.attr(this.options._attributes._errors._lenght):this.options._messages._errors._lenght;
        refobjet.setErreur($elt,_message);
        if(this.options._debug) console.log("ctrl : min");
        return _isvalide;
      }

      // maxlenght
      var _max = $elt.attr(this.options._attributes._controles._max)
      if(_value && _value.length > _max) {
        _isvalide = false;
        _message = ($elt.attr(this.options._attributes._errors._lenght))?$elt.attr(this.options._attributes._errors._lenght):this.options._messages._errors._lenght;
        refobjet.setErreur($elt,_message);
        if(this.options._debug) console.log("ctrl : max");
        return _isvalide;
      }

      // regex
      var _regex = $elt.attr(this.options._attributes._controles._regex);

      if(_regex && _regex != "undefined") {

        try {
          var regex = new RegExp(eval(_regex));
          if (regex.test(_value)) {
            _isvalide = false;
            _message = ($elt.attr(this.options._attributes._errors._regex))?$elt.attr(this.options._attributes._errors._regex):this.options._messages._errors._remote;
            refobjet.setErreur($elt,_message);
            return _isvalide;
          }
        }
        catch (e) {}

      }

      // controle du format
      switch($elt.attr(this.options._attributes._controles._format)) {

      // liste d'emails
      case "emails":

      var _emails = $elt.val();
      var _tab = _emails.split(",");
      _isvalide = true;
      for(var x=0;x<_tab.length;x++){
        _email = _tab[x];
        if(!ObjChaine.verifMail(_email)) {
          _isvalide = false;
          _message = ($elt.attr(this.options._attributes._errors._require))?$elt.attr(this.options._attributes._errors._require):this.options._messages._errors._remote;
          refobjet.setErreur($elt,_message);
        }
      }
      return _isvalide;
      break;

      // email
      case "email" :
      _isvalide = refobjet.controleEmail($elt);
      if(!_isvalide) {
        _message = ($elt.attr(this.options._attributes._errors._remote))?$elt.attr(this.options._attributes._errors._remote):this.options._messages._errors._remote;
        refobjet.setErreur($elt,_message);
      }
      else {
        refobjet.unsetErreur($elt);
      }

      return _isvalide;
      break;

      // email
      case "date" :
      _isvalide = refobjet.controleDate($elt);
      if(!_isvalide) {
        _message = ($elt.attr(this.options._attributes._errors._remote))?$elt.attr(this.options._attributes._errors._remote):this.options._messages._errors._remote;
        refobjet.setErreur($elt,_message);
      }
      else {
        refobjet.unsetErreur($elt);
      }
      return _isvalide;
      break;

      }

      // confirmation
      var _confirmation = $elt.attr(this.options._attributes._controles._confirmation)

      if(_confirmation) {

        var _value2 = $("#"+_confirmation).val();

        if(_value != _value2) {
          _message = ($elt.attr(this.options._attributes._errors._confirmation))?$elt.attr(this.options._attributes._errors._confirmation):this.options._messages._errors._confirmation;
          refobjet.setErreur($elt,_message);
          _isvalide = false;
          return _isvalide;
        }
      }

      return true;

    },

    // @note this function controles an email
    controleEmail : function($elt) {

      // stockage de la référence de l'objet
      var refobjet = this;
      var _value = $elt.val();

      if(!ObjChaine.verifMail(_value)) {
        return false;
      }
      else {
        return true;
      }
    },

    // @note this function controles a date
    controleDate : function($elt) {
      // stockage de la référence de l'objet
      var refobjet = this;
      var _value = $elt.val();

      if(!ObjChaine.verifDate(_value)) return false;
      else return true;
    },

    // @note this function unset error on a form element
    unsetErreur : function($elt) {

      var _precision = ($elt.attr(this.options._attributes._precision))?$elt.attr(this.options._attributes._precision):"";
      var _name = $elt.attr("name");

      // cas du select
      if($elt.is("select") ) {
        $elt.next().removeClass(this.options._classes._error);
        $elt.parent().find("a.selectBox").removeClass(this.options._classes._error).parent().find("span.precision").html(_precision);
      }
      // cas du radio
      else if($elt.is("input:radio")) {
        $elt.parent().removeClass(this.options._classes._error).parent().find("span.precision").removeClass(this.options._classes._error).html(_precision);
      }
      // cas par defaut
      else $elt.removeClass(this.options._classes._error).parent().find("span.precision").removeClass(this.options._classes._error).html(_precision);

      // precision en top on supprime
      try { this.$form.find("div.precision li."+_name).remove(); }
      catch(e) { }

      if(!this.$form.find("div.precision li").size()) {
        this.$form.find("div.precision").remove();
      }

    },

    // @note this function unset error on all form element
    unsetAllErreur : function() {
      var refobjet = this;
      this.$form.find("div.precision").remove();
      this.$form.find("input,select,button,textarea").each(function() {
        refobjet.unsetErreur($(this));
      });
    },

    // @note this function set error on a form element
    setErreur : function($elt,_message) {
      if(this.options._debug) {
        console.info($elt);
        console.info("setErreur  : "+_message);
      }
      var refobjet = this;
      var _destination = this.options._errors._destination; // top ou precision

      var _precision = ($elt.attr(this.options._attributes._precision))?$elt.attr(this.options._attributes._precision):"";

      // cas du select
      if($elt.is("select")) {// && ($elt.hasClass("selectBox") || $elt.hasClass("selectboxit") )
        var $tmp = $elt.next();
      $tmp.addClass(this.options._classes._error);
      if(_destination == "precision") $elt.parent().find("span.precision").addClass(this.options._classes._error).html(_message);
      else this.setMessage($elt,_message,"erreur");
      }

      // cas du radio
      else if($elt.is("input:radio")) {
        var $tmp = $elt.parent();
        $tmp.addClass(this.options._classes._error);
        if(_destination == "precision") $tmp.find("span.precision").addClass(this.options._classes._error).html(_message);
        else this.setMessage($elt,_message,"erreur");
      }

      // cas par défaut
      else {
        $elt.addClass(this.options._classes._error);
        if(_destination == "precision") {
          $elt.parent().find("span.precision").addClass(this.options._classes._error).show().html(_message);
        }
        else this.setMessage($elt,_message,"erreur");
      }


      // settimeout before hide
      if(this.options._timers._error > 0) {
        _tmp = setTimeout(function() {
          if($elt.is("input:radio")) $elt.parent().parent().find("span.precision").removeClass(refobjet.options._classes._error).html(_precision);
          else $elt.parent().find("span.precision").removeClass(refobjet.options._classes._error).html(_precision);
        },this.options._timers._error);
      }

      // champ vide, mie en place de la val par defaut
      if(!$elt.val() && $elt.attr(this.options._attributes._default)) $elt.val($elt.attr(this.options._attributes._default));

    },

    // @note this function set message on a form element
    setMessage : function($elt, _message,_classe,_remove) {
      var refobjet = this;

      if(!$elt) _destination = "top";
      else {
        var _destination = this.options._errors._destination; // top ou precision
        var _name = $elt.attr("name");
      }

      if(_destination=="top") {

        // creation du div s'il n'existe pas
        if(!this.$form.find("div.precision").size())  this.$form.prepend("<div class='precision'><span class='ico ico-top'></span><ul></ul></div>");

        // si remove on vide le div
        if(_remove) this.$form.find("div.precision ul").html("");

        this.$form.find("div.precision").addClass(_classe);
        var $_li = refobjet.$form.find("div.precision li."+_name);
        var _class = ($elt)?$elt.attr("name"):"";
        if($_li.size()>0) $_li.html(_message);
        else {
          refobjet.$form.find("div.precision").find("ul").append("<li class='"+_class+"'>"+_message+"</li>");
        }
      }

    },

    initSelectCountry: function() {
      var refobjet = this,
          $selectCountry = refobjet.$form.find('#Country');

      $selectCountry.on('change', function(){
        if($(this).val() !== "FR") {
          refobjet.$form.find("["+refobjet.options._attributes._autocomplete._url+"]").each(function() {
            refobjet.desactiveautocomplete($(this));
          });
        } else {
          refobjet.$form.find("["+refobjet.options._attributes._autocomplete._url+"]").each(function() {
            refobjet.reactiveautocomplete($(this));
          });
        }
      });
    },






    // @note this function initialise autocomplete on a form element
    // @see http://jqueryui.com/demos/autocomplete/#multiple-remote
    setAutocomplete : function() {

      var refobjet = this;

      this.$form.find("["+this.options._attributes._autocomplete._url+"]").each(function() {
        refobjet.activeautocomplete($(this));
      });
    },

    desactiveautocomplete:function($elt) {
      $elt.autocomplete( "disable" );
    },

    reactiveautocomplete:function($elt) {
      $elt.autocomplete( "enable" );
    },

    // @note activeautocomplete
    activeautocomplete:function($elt) {
        var refobjet = this;

        if ( $elt.data("autocomplete") ) return false;

        var withTag = false,
            withStar = false;

        // Gestion de l'autocomplete en mode multi (avec tags)
        if ($elt.hasClass("autocomplete-tag")) {
            var $tagList = $elt.parents('.field').next('.list-etiquettes'),
                $tag = $tagList.find('> li'),
                $hiddenTags = $elt.parent().find('.autocomplete-tag-list'),
                nbMaxTag = $elt.data('nbmaxtag') || 30;

            withTag = true;

            /************************************************
             * DELETE ETIQUETTE
             ***********************************************/
            $tagList.on('click touchstart', '.etiquette-delete', function(){
                var $li = $(this).parent(),
                    $ul = $li.parent(),
                    $more = $ul.find('.link-more .more');

                $li.remove();

                if ($li.hasClass('latest')) {
                    var nbMoreLi = $ul.find('.latest').length;

                    if (nbMoreLi > 0) {
                        $more.text("+" + nbMoreLi);
                    } else {
                        $more.parent().hide();
                    }
                } else {
                    var nbFirstLi = $ul.find('> li:not(.latest):not(.link-more)').length,
                        $latestLi = $ul.find('.latest');

                    if (nbFirstLi < 1) {
                        $more.parent().remove();
                        $latestLi.removeClass('latest');
                    }
                }

                // Gestion du nombre maximum de tags
                if ($tagList.find('> li').length < nbMaxTag) $elt.prop('disabled', false);
                return false;
            });


            /*-----------------------------------------------
                Déplier les compétences restantes
            -----------------------------------------------*/
            $('.shown-list li.show-more').click(function(){
                var $item = $(this).parent().next('.hidden-list'),
                    $picto = $(this).find('.picto');

                $item.toggle();
                $picto.toggleClass('picto-check-list-up');
            });


            /************************************************
             * ETIQUETTE WITH LEVEL
             ***********************************************/
            if ($elt.hasClass("autocomplete-star")) {

                withStar = true;

                var nbEltStar = $tagList.find('> li').length || 0;

                $tagList.on('click touchstart', '.etiquette-level .level-menu li', function() {
                    var clickedStar = $(this).text(),
                        level = $(this).data('level'),
                        $selectedStar = $(this).parent().prev('span'),
                        $inputStar = $selectedStar.prev('input');

                    $selectedStar.removeClass().addClass('picto ' + clickedStar);
                    $inputStar.val(level);
                });
            }

            // Disable autocomplete au chargement de la page
            if ($tag.length >= nbMaxTag) $elt.prop('disabled', true);



            /************************************************
             * SHOW HIDDEN ETIQUETTES
             ***********************************************/
             $tagList.find('li.more').click(function(){
                $tagList.find('li.hidden').removeClass('hidden');
                $(this).hide();
             });

        };

        // ajout du champ hidden
        $("<input type='hidden' name='"+$elt.attr("name")+"_autocomplete' id='"+$elt.attr("name")+"_autocomplete' style='display:none; position:absolute; left:-5000px;' />").insertAfter($elt);


        // maj des options de l'autocomplete
        var _autocomplete_url = $elt.attr(this.options._attributes._autocomplete._url);
        var  _autocomplete_options_minLength 		= ($elt.attr(this.options._attributes._autocomplete._options._minLength)) 		? $elt.attr(this.options._attributes._autocomplete._options._minLength) 		: this.options._autocomplete._options._minLength;
        var  _autocomplete_options_autoFocus 		= ($elt.attr(this.options._attributes._autocomplete._options._autoFocus)) 		? $elt.attr(this.options._attributes._autocomplete._options._autoFocus) 		: this.options._autocomplete._options._autoFocus;
        var  _autocomplete_options_autoFill 		= ($elt.attr(this.options._attributes._autocomplete._options._autoFill)) 		? $elt.attr(this.options._attributes._autocomplete._options._autoFill)                  : false;
        var  _autocomplete_options_delay			= ($elt.attr(this.options._attributes._autocomplete._options._delay)) 			? $elt.attr(this.options._attributes._autocomplete._options._delay) 			: this.options._autocomplete._options._delay;
        var  autocomplete_options_appendto		= ($elt.attr(this.options._attributes._autocomplete._options._appendto)) 			? $elt.attr(this.options._attributes._autocomplete._options._appendto) 			: this.options._autocomplete._options._appendto;

        // recuperation de la class
        var _classname = $elt.attr(this.options._attributes._autocomplete._classname);

        //ajout du champ grisé si autofill
        if(_autocomplete_options_autoFill) {
            var _style = $elt.attr(this.options._attributes._autocomplete._options._autoFillStyle) ? $elt.attr(this.options._attributes._autocomplete._options._autoFillStyle) : "";
            $("<input type='text' name='"+$elt.attr("name")+"_autofill' id='"+_autocomplete_options_autoFill+"' style='position:absolute;"+_style+"' class='"+$elt.attr("class")+"' value='' />").insertBefore($elt);
        }


        // lauch autocomplete
        $elt.autocomplete({
            source    : _autocomplete_url,
            minLength	: _autocomplete_options_minLength,
            autoFocus : _autocomplete_options_autoFocus,
            delay     : _autocomplete_options_delay,
            appendTo  : autocomplete_options_appendto,

            response: function( event, ui ) {

                // on filtre la liste des éléments en retirant ceux qui sont déjà présents dans la liste des tags
                if ($tagList) {
                    var indexes = [];
                    var tags = $tagList.find('li');

                    if (ui.content.length > 0 && tags.length > 0) {
                        for (var j = 0 ; j < ui.content.length ; j ++) {

                            for (var i=0 ; i < tags.length ; i++) {
                                if ($(tags[i]).attr('data-uri') === ui.content[j].id) {
                                    indexes.push(j);
                                    break;
                                }
                            }
                        }
                        // on supprime les éléments du tableau en les parcourant par la fin (on aurait pu le faire dans la boucle de dessus)
                        indexes.sort(function(a, b){return b-a});
                        for (var i = 0 ; i < indexes.length ; i++) {
                            ui.content.splice(indexes[i], 1);
                        }
                    }
                }
            },

            open: function(event, ui) {
                // ajout de la classe
                if(_classname)  $(this).data("autocomplete").menu.element.addClass(_classname);
            },

            select: function(e, ui) {

                setTimeout(function() {

                    // maj champ hidden pour l'id
                    if($("[name='"+$elt.attr("name")+"_autocomplete']").size()) {
                        $("[name='"+$elt.attr("name")+"_autocomplete']").val(ui.item.id);
                    }

                    if(_autocomplete_options_autoFill) {
                        $("#"+_autocomplete_options_autoFill).val("");
                    }

                    // Gestion de l'autocomplete avec tag
                    if(withTag) {
                        refobjet.autocompleteAddTag($elt, ui.item.id, $tagList, nbMaxTag, withStar, nbEltStar);
                        if (withStar) nbEltStar++;
                    }

                },500); // END setTimeout
            }

        })
        .on("keydown",function(e) {
            // if(e.keyCode == 188 || e.keyCode == 190 || e.keyCode == 226) { // Disabel key ">" and "<"

            //     return false;

            // }
            if (e.keyCode == 13) { // key ENTER

                // Ajout d'un tag en saisie libre
                if (withStar) {
                    setTimeout(function() {
                        if ($("[name='"+$elt.attr("name")+"_autocomplete']").val() == "" && $elt.val() != "") {
                            refobjet.autocompleteAddTag($elt, $elt.val(), $tagList, nbMaxTag, withStar, nbEltStar);
                            nbEltStar++;
                        }
                    }, 500);
                }

                return false;

            } else if($("[name='"+$elt.attr("name")+"_autocomplete']").size()) $("[name='"+$elt.attr("name")+"_autocomplete']").val("");
        });



    },



    autocompleteAddTag:function($elt, tagLabel, $tagList, nbMaxTag, withStar, nbEltStar) {
        var eltName = $elt.data('autocomplete-hidden-name');
        var $tag = $('<li data-uri="'+ tagLabel +'"><span class="etiquette-label">'+ $elt.val() +'</span><span class="etiquette-delete"><span class="picto picto-close-white-big"></span></span><input type="hidden" value="'+ tagLabel +'" name="'+ eltName +'"/></li>');
        var tags = $tagList.find('> li');

        // Autocomplete with stars
        if (withStar) {
            $tag = $('<li data-uri="'+ tagLabel +'"><input type="hidden" name="Skills.Index" value="'+ nbEltStar +'" /><span class="etiquette-level"><input type="hidden" value="1" name="'+ eltName +'['+ nbEltStar +'].Score"><span class="picto picto-star-semi-blue"></span><ul class="level-menu"><li data-level="0"><span class="picto picto-star-border-blue">picto-star-border-blue</span></li><li data-level="1"><span class="picto picto-star-semi-blue">picto-star-semi-blue</span></li><li data-level="2"><span class="picto picto-star-blue">picto-star-blue</span></li></ul></span><span class="etiquette-label">'+ $elt.val() +'</span><span class="etiquette-delete"><span class="picto picto-close-white-big"></span></span><input type="hidden" value="'+ tagLabel +'" name="'+ eltName +'['+ nbEltStar +'].Label"/></li>');
        }

        // si l'élément est déjà présent on ne l'ajoute pas à nouveau
        var alreadyPresent = false;

        for (var i=0 ; i < tags.length ; i++) {
          if ($(tags[i]).attr('data-uri') === tagLabel) {
            alreadyPresent = true;
            break;
          }
        }

        if (!alreadyPresent) {
            $tag.prependTo($tagList);
        }

        $elt.val('');
        $elt.parent().find('.field-validation-error').text('');

        if ($tagList.find('> li').length >= nbMaxTag) {
            $elt.prop('disabled', true);
        }
    },



    // setindice (multi champ)
    setIndice:function() {
        var refobjet = this;
        this._indices = new Array();

        // calcul le nb d'indice par element
        this.$form.find("fieldset["+this.options._attributes._indice+"]").each(function() {
        var _indice = $(this).data("indice");
        if(typeof(refobjet._indices[_indice]) != "undefined") refobjet._indices[_indice] = refobjet._indices[_indice] + 1;
        else refobjet._indices[_indice] = 0;
        })

        // boucle sur chaque tableau d'indice pour mettre en place les indices

        for (var k in refobjet._indices){

        var _indice = 0;

        // boucle sur chaque fieldset ayant l'indice
        refobjet.$form.find("fieldset["+refobjet.options._attributes._indice+"]").each(function() {

          var $fieldset = $(this);

          $fieldset.find("[name*='[]']").each(function() {

            $fieldset.find("[name*='[]']").each(function() {
              var _name = $(this).attr("name");
              _name = _name.replace(/[\[\]]/, "["+_indice);
              $(this).attr("name",_name);

            });
          });

          // on incremente l'indice
          _indice++;

        });

        }
    }
  };


})(jQuery);

// Mise en gras dans la liste des résultats de l'autocomplete
$.ui.autocomplete.prototype._renderItem = function (ul, item) {

  var term = $.ui.autocomplete.escapeRegex(this.term);
  item.label = item.label.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");

  return $("<li></li>")
      .data("item.autocomplete", item)
      .append("<a>" + item.label + "</a>")
      .appendTo(ul);
};