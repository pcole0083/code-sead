/**
 * [description]
 * @param  {[type]} window    [description]
 * @param  {[type]} document  [description]
 * @param  {[type]} ace       [description]
 * @param  {[type]} undefined [description]
 * @return {[type]}           [description]
 */
//;(function(window, document, Meteor, undefined){
    if (Meteor.isClient) {

        Meteor.subscribe('codeblocks');
        Meteor.subscribe("directory");

        window.Object.defineProperty( Element.prototype, 'documentOffsetTop', {
            get: function () { 
                return this.offsetTop + ( this.offsetParent ? this.offsetParent.documentOffsetTop : 0 );
            }
        });

        Meteor.startup(function() {
            window.myEditors = {};
        });

    }

//})(this, this.document, Meteor);