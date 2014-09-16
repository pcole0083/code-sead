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

        Meteor.startup(function() {
            window.myEditors = {};
        });

        // Template.codeblocks.rendered = function(){
        //     var myTextArea = document.querySelector("#textEdit"),
        //         dataBlockId = myTextArea.getAttribute("data-block-id");
        //     window.addEditor(myTextArea, this.data.codeblock);
        // };
    }

//})(this, this.document, Meteor);