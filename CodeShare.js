CodeBlocks = new Meteor.Collection('codeblocks');

CodeBlocks.allow({
    insert: writeAccess,
    update: writeAccess
});

CodeBlocks.deny({
    update: function(userId, codeblock, fieldNames) {
    // may only edit the following fields:
    return (_.without(fieldNames, 'heading','value', 'lang', 'theme', 'allowed', 'published', 'modified', 'deleted').length > 0); }
});

//CodeBlocks.remove({});
Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'home',
    waitOn: function() {
        return [ Meteor.subscribe('codeblocks'), Meteor.subscribe("directory") ];
    },
    onBeforeAction: function() {
        document.documentElement.classList.add("shrink");
    },
    onAfterAction: function() {
        document.documentElement.classList.remove("shrink");
    }
});

Router.map(function() {
    this.route('home', {
        path: '/',
        data: function() {
            var limit = 20;
            this.greeting = "CodeShare";
            this.showIcon = true;
            this.codeblocks = CodeBlocks.find({}, {sort: {created: -1}, limit: limit});
            return this;
        }
    });

    this.route('codeblocks', {
        path: '/codeblocks/:_id',
        waitOn: function() {
            return [ Meteor.subscribe('codeblocks'), Meteor.subscribe("directory") ];
        },
        data: function() {
            var data = {},
                ownsIt = null,
                published = null,
                blockId = this.params._id;

            this.greeting = "Common Editor";

            data.themes = [
                "default",
                "3024-day",
                "3024-night",
                "ambiance",
                "base16-dark",
                "base16-light",
                "blackboard",
                "cobalt",
                "eclipse",
                "elegant",
                "erlang-dark",
                "lesser-dark",
                "mbo",
                "mdn-like",
                "midnight",
                "monokai",
                "neat",
                "neo",
                "night",
                "paraiso-dark",
                "paraiso-light",
                "pastel-on-dark",
                "rubyblue",
                "solarized dark",
                "solarized light",
                "the-matrix",
                "tomorrow-night-eighties",
                "twilight",
                "vibrant-ink",
                "xq-dark",
                "xq-light"
            ];

            data.codeblock = CodeBlocks.findOne(blockId);
            if (data.codeblock){
                data.greeting = this.greeting;
                ownsIt = data.codeblock.owner === Meteor.userId();
                published = !!data.codeblock.published;

                data.needsPublish =  ownsIt && !published;
                data.sharable = ownsIt && published;

                return data;
            }
            return this;
        },
        action: function () {
            if ( this.data() )
                this.render();
            else
                this.render('loading');
        },
        onAfterAction: function () {
            var self = this,
                data = this.data();
            setTimeout(function(){
                var myTextArea = document.querySelector("#textEdit");
                console.log(myTextArea);
                if(!!myTextArea){
                    var defaultEditor = window.addEditor(myTextArea, data.codeblock);
                }
                $('[data-toggle="tooltip"]').tooltip();
            }, 0);
            
        },
        onStop: function() {
            if(!!window.myEditor){
                window.myEditor = null;
            }
        }
    });

    this.route('about', {
        path: 'about',
        data: function() {
            this.greeting = "About";
            this.message = "In the future, this will explain all about CodeShare. For now just create and share!";
            return this;
        }
    });
});

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

                myCodeMirror.off("changes");
                myCodeMirror.on("changes", function(instance, changes){
                    var currentValue = instance.getValue(),
                        textArea = instance.getTextArea();
                    if(!!textArea)
                        textArea.value = currentValue;
                    $(textArea).trigger("change");
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
                modified: new Date().toLocaleDateString()
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
    window.updateEditors = function(myEditor, value) {
        if(!!myEditor){
            var doc = myEditor.getDoc(),
                editorVal = doc.getValue();

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
            updateEditors(window.myEditor, codeblock.value);
        }
    });

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
                        return ( this.deleted !== 1 ) && ( this.owner === id || this.allowed.indexOf(id) > -1 );
                    }
                },
                {
                    sort: {created: -1}
                }
            );
        }
    };
    Template.registerHelper('writeAccessOnly', function() {
        var id = Meteor.userId(),
            writeOnly = this.allowed.indexOf(id) > -1 && this._id !== id;
        return !!writeOnly ? Template.writeOnly : null;
    });
    /**
     * HELPERS
     */
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

    var codeBlockHelpers = {
        selectedTheme: function() {
            var isSelectedTheme = this === codeblock.theme;
        }
    };

    Template.codeblocks.helpers(codeBlockHelpers);

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
                codeblock = CodeBlocks.findOne(pageId),
                allowedIds = codeblock.allowed.push(shareWith);

            return CodeBlocks.update(pageId, {
                $set: {allowed: allowedIds}
            });
        }
    });

    var updateFields = function(codeblock, feildsObj){
        var userId = Meteor.userId(),
            updatedObj = {},
            returnValue;

        if ( !!userId && !!codeblock && (codeblock.owner === userId || codeblock.allowed.indexOf(userId) > -1) ){
            feildsObj.modified = new Date().toLocaleDateString();
            
            //update old objects
            if(!feildsObj.lang && !codeblock.lang)
                feildsObj.lang = 'javascript';
            if(!feildsObj.deleted && !codeblock.deleted)
                feildsObj.deleted = 0;
            if(!feildsObj.theme && !codeblock.theme)
                feildsObj.theme = "monokai";

            //end predefined updates
            
            returnValue = CodeBlocks.update(codeblock._id, {
                $set: feildsObj
            });
        }
        return returnValue;
    };

    Template.codeblocks.events({
        'change #textEdit': function() {
            var toUpdate = this.codeblock,
                textArea = document.querySelector('#textEdit'),
                currentValue = textArea.value,
                headingValue = document.querySelector('#headingText').value,
                updatedObj = {
                    'heading':  headingValue,
                    'value':    currentValue
                };
            return updateFields(toUpdate, updatedObj);
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