CodeBlocks = new Mongo.Collection('codeblocks');

CodeBlocks.allow({
    insert: writeAccess,
    update: writeAccess
});

CodeBlocks.deny({
    update: function(userId, codeblock, fieldNames) {
    // may only edit the following fields:
    return (_.without(fieldNames, 'heading','value', 'lang', 'theme', 'allowed', 'published', 'modified', 'lastModBy', 'deleted').length > 0); }
});

//CodeBlocks.remove({});
// Router.configure({
//     layoutTemplate: 'layout',
//     loadingTemplate: 'loading',
//     notFoundTemplate: 'home',
//     subscriptions: function() {
//         return [ Meteor.subscribe('codeblocks'), Meteor.subscribe("directory") ];
//     },
//     onBeforeAction: function() {
//         document.documentElement.classList.add("shrink");
//         this.next();
//     },
//     onAfterAction: function() {
//         document.documentElement.classList.remove("shrink");
//     }
// });

// var codeBlocksAfterAction = function() {
//     var data = this;
//         //data = this.data();
//     if( !!this._rendered ){
//         setTimeout(function(){ //this seems to be required because shit happens. Apparently rendered does not mean part of the DOM.
//             var myTextArea = document.querySelector("#textEdit"),
//                 blockId = myTextArea.getAttribute('data-block-id'),
//                 hasClass = myTextArea.classList.contains('codeMirror-added');

//             var codeMirrorEle = myTextArea.nextElementSibling,
//                 blockId2 = !!codeMirrorEle ? codeMirrorEle.getAttribute('data-block-id') : null;

//             if( !!myTextArea && (!hasClass || blockId !== blockId2) ){
//                 var defaultEditor = window.addEditor(myTextArea, data.codeblock);
//             }
//             $('[data-toggle="tooltip"]').tooltip();

//             var themeSelect = document.querySelector("#themeChange1");
//             if(!!themeSelect){
//                 themeSelect.value = data.selectedTheme;
//             }
//         }, 0);
//     }
// };

// Router.onAfterAction(codeBlocksAfterAction, {
//   only: ['codeblocks']
//   //except: ['routeOne', 'routeTwo']
// });

// Router.route('/codeblocks/:_id', function () {
//     this.layout('layout', {
//         data: function () {
//             this.greeting = "Common Editor";
//             return this;
//         }
//     });
//     this.render('codeblocks', {
//         data: function() {
//             var data = {},
//                 ownsIt = null,
//                 published = null,
//                 blockId = this.params._id;

//             this.themes = [
//                 "default",
//                 "3024-day",
//                 "3024-night",
//                 "ambiance",
//                 "base16-dark",
//                 "base16-light",
//                 "blackboard",
//                 "cobalt",
//                 "eclipse",
//                 "elegant",
//                 "erlang-dark",
//                 "lesser-dark",
//                 "mbo",
//                 "mdn-like",
//                 "midnight",
//                 "monokai",
//                 "neat",
//                 "neo",
//                 "night",
//                 "paraiso-dark",
//                 "paraiso-light",
//                 "pastel-on-dark",
//                 "rubyblue",
//                 "solarized dark",
//                 "solarized light",
//                 "the-matrix",
//                 "tomorrow-night-eighties",
//                 "twilight",
//                 "vibrant-ink",
//                 "xq-dark",
//                 "xq-light"
//             ];

//             this.codeblock = CodeBlocks.findOne(blockId);
//             if (this.codeblock){
//                 this.selectedTheme = this.codeblock.theme;
//                 this.greeting = this.greeting;
//                 ownsIt = this.codeblock.owner === Meteor.userId();
//                 published = !!this.codeblock.published;

//                 this.needsPublish =  ownsIt && !published;
//                 this.sharable = ownsIt && published;

//                 return this;
//             }
//             return this;
//         },
//         onBeforeAction: function(){
//             var self = this,
//                 data = this.data(),
//                 codeblockData = data.codeblock,
//                 userId = Meteor.userId() || null;

//             if(!!codeblockData && codeblockData.owner !== userId){
//                 if(codeblockData.published === 0 || codeblockData.allowed.indexOf(userId) === -1 ){
//                     var loggedIn = AccountsEntry.signInRequired(this);
//                     if( userId !== codeblockData.owner ){
//                         //self.redirect('denied');
//                     }
//                 }
//             }
//             self.next();
//         },
//         onStop: function() {
//             if(!!window.myEditor){
//                 window.myEditor = null;
//             }
//         }
//     });
// }, {
//   name: 'codeblocks'
// });

// Router.route('/', function () {
//     this.layout('layout', {
//         data: function () {
//             this.greeting = "CodeShare";
//             this.showIcon = true;
//             return this;
//         }
//     });
//     this.render('home', {
//         data: function() {
//             var limit = 20;
//             var id = Meteor.userId();
//             this.greeting = "CodeShare";
//             this.showIcon = true;
//             this.codeblocks = CodeBlocks.find(
//                 {
//                     $and:[
//                         { owner: {$ne: id} },
//                         { deleted: {$ne: 1} },
//                         { published: 1 }
//                     ]
//                 },
//                 {
//                     sort: {created: -1}
//                 }
//             );
//             this.mycodeblocks = CodeBlocks.find(
//                 {
//                     $where: function(){
//                         return ( this.deleted !== 1 ) && ( this.owner === id ); //|| this.allowed.indexOf(id) > -1
//                     }
//                 },
//                 {
//                     sort: {created: -1}
//                 }
//             );
//             return this;
//         }
//     });
// }, {
//     name: 'home'
// });

// Router.route('/not-found', function(){
//     this.layout('layout', {
//         data: function () {
//             this.greeting = "How did you get here?";
//             this.message = "Write code. Publish. Collaborate. Share knowledge.";
//             this.showIcon = true;
//             return this;
//         }
//     });
//     this.render('denied');
// });

// Router.route('about', function(){
//     this.layout('layout', {
//         data: function () {
//             this.greeting = "About CodeSead";
//             this.message = "Write code. Publish. Collaborate. Share knowledge.";
//             this.showIcon = true;
//             return this;
//         }
//     });
//     this.render('about');
// },{
//     name: "about"
// });

if (Meteor.isClient) {
    window.addEditor = function(textArea, codeblock){
        codeblock = codeblock || {};
        var myCodeMirror = null,
            savedValue,
            blockId,
            writeAccess,
            existingMirrors = document.querySelector('.CodeMirror'),
            mirrorOptions = {
                lineNumbers: true,
                mode: codeblock.lang || "javascript",
                keyMap: "sublime",
                autoCloseBrackets: true,
                matchBrackets: true,
                showCursorWhenSelecting: true,
                theme: codeblock.theme || "monokai",
                placeholder: "/* Add your code here */",
                value: savedValue || textArea.value,
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
            };

        if(!!existingMirrors){
            existingMirrors.parentNode.removeChild(existingMirrors);
        }

        return requiredTimeout = setTimeout(function(){ //while the data may change fast, when switching between codeblocks, the old data is not yet registered with the client or DOM without this.
            if(!!CodeMirror && !!textArea ){
                var userId = Meteor.userId();
                blockId = textArea.getAttribute("data-block-id");
                savedValue = CodeBlocks.findOne(blockId);

                if(!savedValue){
                    return window.addEditor(textArea);
                }

                writeAccess = !!userId && ( savedValue.owner === userId || savedValue.allowed.indexOf(userId) > -1 );
                if(!writeAccess){
                    mirrorOptions.readOnly = true;
                }

                var map = CodeMirror.keyMap.sublime,
                    mapK = CodeMirror.keyMap["sublime-Ctrl-K"];

                myCodeMirror = CodeMirror.fromTextArea(textArea, mirrorOptions);
                textArea.classList.add('codeMirror-added');
                textArea.nextElementSibling.setAttribute("data-block-id", blockId);

                myCodeMirror.off("changes");
                myCodeMirror.on("changes", function(instance, changes){
                    var currentValue = instance.getValue(),
                        textArea = instance.getTextArea(),
                        userId = Meteor.userId(),
                        timestamp = Date.now();
                    codeblock = CodeBlocks.findOne(codeblock._id);
                    if(!!textArea)
                        textArea.value = currentValue;
                    //only trigger if current user is editing, not when pushed from server
                    if(codeblock.lastModBy === userId || ( codeblock.lastModBy !== userId && (timestamp - codeblock.modified > 3000) ) ){
                        $(textArea).trigger("change");
                    }
                });
                //this is probably not what the parent function gets in return.
                window.myEditor = myCodeMirror;
                return myCodeMirror;
            }
        }, 0);
    };
    /**
     * [insertNewCodeBlock description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    var insertNewCodeBlock = function(data) {
        var id = Meteor.userId(),
            allowIds = [],
            returnValue = null,
            lang = data.lang || "javascript",
            theme = data.theme || "monokai";

        if (!!id) {
            allowIds.push(id);

            returnValue = CodeBlocks.insert({
                heading: data.heading,
                value: data.value,
                owner: id,
                allowed: allowIds,
                published: 0,
                deleted: 0,
                lang: lang,
                theme: theme,
                created: new Date().toLocaleDateString(),
                modified: Date.now(),
                lastModBy: id
            });
        }
        return returnValue;
    };

    /**
     * [updateEditors description]
     * @param  {Object} myEditor
     * @param  {String} value
     * @return {Object} myEditor with their new values
     */
    window.updateEditors = function(myEditor, codeblock) {
        if(!!myEditor){
            var value       = codeblock.value,
                doc         = myEditor.getDoc(),
                editorVal   = doc.getValue(),
                textArea    = myEditor.getTextArea();

            if (editorVal !== value) {
                doc.setValue(value);
            }
        }
        return myEditor;
    };

    /**
     * [setOption set/update editor option]
     * @param {[type]} editor      [description]
     * @param {[type]} optionName  [description]
     * @param {[type]} optionValue [description]
     */
    window.setOption = function(editor, optionName, optionValue){
        if(!!editor){
            return editor.setOption(optionName, optionValue);
        }
        return null; //if there is no editor
    };

    /**
     * [Observer: Codeblocks]
     * Required to update users that are viewing a code editor someone is typing in.
     */
    CodeBlocks.find().observe({
        changed: function(codeblock) {
            updateEditors(window.myEditor, codeblock);
        }
    });

    /**
     * HELPERS
     */
    
         /**
     * [sharedHelpers: used in mutliple templates]
     * @type {Object}
     *       @codeblocks returns cursor of objects that the user does not own.
     *       @mycodeblocks returns cursor of objects that the user does own or has edit access to.
     */
    var sharedHelpers = {
        codeblocks: function() {
            var id = Meteor.userId();
            return CodeBlocks.find(
                {
                    $and:[
                        { owner: {$ne: id} },
                        { deleted: {$ne: 1} },
                        { published: 1 }
                    ]
                },
                {
                    sort: {created: -1}
                }
            );
        },
        mycodeblocks: function() {
            var id = Meteor.userId();
            return CodeBlocks.find(
                {
                    $where: function(){
                        return ( this.deleted !== 1 ) && ( this.owner === id ); //|| this.allowed.indexOf(id) > -1
                    }
                },
                {
                    sort: {created: -1}
                }
            );
        }
    };


    Template.registerHelper('debugObj', function(obj) {
        var str = '',
            arry = [],
            loopOver = function(ob){
                for(var prop in ob){
                    var value = obj[prop];
                    if( ob.hasOwnProperty(prop) ){
                        if(value instanceof Object){
                            loopOver(value);
                        }
                        else{
                           arry.push(prop+":"+value); 
                        }
                    }
                }
            };
            loopOver(obj);
            str = arry.join("\n\r");
        return str;
    });
    
    Template.registerHelper('writeAccessOnly', function() {
        var id = Meteor.userId(),
            writeOnly = this.allowed.indexOf(id) > -1 && this._id !== id;
        return !!writeOnly ? Template.writeOnly : null;
    });

    Template.registerHelper('selectedOption', function(set, value) {
        return set == value ? ' selected="selected"' : '';
    });

    Template.registerHelper('dateString', function(ms){
        return new Date(ms).toLocaleDateString();
    });

    Template.home.helpers(sharedHelpers);
    Template.blocksList.helpers(sharedHelpers);

    var userListHelper = {
        directory: function() {
            var users = Meteor.users.find({
                $and: [{
                    _id: { //filter the cursor by this property
                        $nin: [Meteor.userId()] //$nin expects an array, in this case an array of IDs. But we only want to filter out the current user, cause we have that already!
                    } //we don't want the current user to show up in this list.
                }]
            });
            return users;
        }
    };

    Template.userList.helpers(userListHelper);

    /**
     * END HELPERS
     */

    /**
     * UX Events
     */

    Template.userList.events({
        'click .user-item': function(e) {
            var self = this,
                shareWith = self._id,
                pageId = Router.current(true).params._id,
                codeblock = CodeBlocks.findOne(pageId);
            if(!codeblock.allowed.push){
                codeblock.allowed = [Meteor.userId()];
            }
            codeblock.allowed.push(shareWith);

            return CodeBlocks.update(pageId, {
                $set: {allowed: codeblock.allowed}
            });
        }
    });

    var updateFields = function(codeblock, feildsObj){
        var userId = Meteor.userId(),
            updatedObj = {},
            returnValue;

        if ( !!userId && !!codeblock && (codeblock.owner === userId || codeblock.allowed.indexOf(userId) > -1) ){
            var lastModified = codeblock.modified,
                modBy = codeblock.lastModBy;

            if(!feildsObj.modified)
                feildsObj.modified = Date.now();

            //if(userId === modBy || (feildsObj.modified - lastModified < 3000) ){
                //update old objects
                if(!feildsObj.lang && !codeblock.lang)
                    feildsObj.lang = 'javascript';
                if(!feildsObj.deleted && !codeblock.deleted)
                    feildsObj.deleted = 0;
                if(!feildsObj.theme && !codeblock.theme)
                    feildsObj.theme = "monokai";

                codeblock.lastModBy = feildsObj.lastModBy;
                //end predefined updates
                
                returnValue = CodeBlocks.update(codeblock._id, {
                    $set: feildsObj
                });
            //}
        }
        return returnValue;
    };

    Template.codeblocks.events({
        'change #textEdit': function() {
            var userId = Meteor.userId(),
                toUpdate = this.codeblock,
                textArea = document.querySelector('#textEdit'),
                currentValue = textArea.value,
                headingValue = document.querySelector('#headingText').value,
                updatedObj = {
                    'heading':  headingValue,
                    'value':    currentValue,
                    'modified': Date.now(),
                    'lastModBy': userId
                },
                isCurrentUser = function(u1, u2){
                    return u1 === u2;
                }(toUpdate.lastModBy, userId),
                timeDifference = function(t1, t2){
                    return t1-t2;
                }(updatedObj.modified, toUpdate.modified);

            if(isCurrentUser || ( !isCurrentUser && (timeDifference > 3000) ) ){
                return updateFields(toUpdate, updatedObj);
            }
            else if(!isCurrentUser && (timeDifference <= 3000)){
                console.log("Another user is currently typing. Please wait.");
            }
        },
        'change .selectTheme': function(e) {
            //change codemirror theme
            var toUpdate = this.codeblock,
                selectBox = e.currentTarget,
                value = selectBox.value,
                feilds = {
                    'theme': value
                };
            window.setOption(window.myEditor, "theme", value);
            return updateFields(toUpdate, feilds);
        },
        'change .langSelect': function(e) {
            //change programming language
            var toUpdate = this.codeblock,
                selectBox = e.currentTarget,
                value = selectBox.value,
                feilds = {
                    'lang': value
                };
            return updateFields(toUpdate, feilds);
        },
        'click #publishBtn': function(){
            var toUpdate = this.codeblock,
                feilds = {
                    'published': 1
                };
            if( Meteor.userId() === toUpdate.owner ){ //only the owner can publish
                return updateFields(toUpdate, feilds);
            }
        },
        'click .flip-gears': function(e) {
            var flipWrap = document.querySelector(".flip-wrapper");
            if(!!flipWrap){
                flipWrap.classList.toggle("flip-it-good");
                e.currentTarget.classList.toggle("inverse");
            }
        },
        'click .h-collapse-open': function(e) {
            //TODO: auto generate modal and will with confirming message that includes codeblock name.
            e.currentTarget.nextElementSibling.classList.toggle('open');
        },
        'click .delete-confirm': function(e){
            updateFields(this.codeblock, {deleted: 1});
            return Router.go('/');
        }
    });

    Template.topNav.events({
        'click .menu-icon': function(e){
            var menuIcon = e.currentTarget,
                menu = menuIcon.parentNode;
            menu.classList.toggle("open-nav-menu");
        },
        'click .btn': function(e){
            var burger = document.querySelector(".amm-burger");
            burger.classList.remove("open-nav-menu");
        },
        'click #newCodeBlock': function() {
            var data = {
                heading: "New Codeblock",
                value: ""
            };

            var newCodeBlock = insertNewCodeBlock(data);
            return newCodeBlock;
        }
    });

    /**
     * END UX EVENTS
     */
}