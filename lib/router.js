;(function(Meteor, Router){
    "use strict";

    var subscribeFn = function() {
        return [ Meteor.subscribe('codeblocks'), Meteor.subscribe("directory") ];
    };
    var ironConfigOptions = {
        layoutTemplate: 'layout',
        loadingTemplate: 'loading',
        notFoundTemplate: 'denied',
        subscriptions: subscribeFn,
        onBeforeAction: function() {
            document.documentElement.classList.add("shrink");
            this.next();
        },
        onAfterAction: function() {
            document.documentElement.classList.remove("shrink");
        }
    };
    Router.configure(ironConfigOptions);

    var routeMap = [
        {
            name: "home",
            path: '/',
            layout: {
                data: function () {
                    this.greeting = "CodeShare";
                    this.showIcon = true;
                    return this;
                }
            },
            render: {
                data: function() {
                    var limit = 20;
                    var id = Meteor.userId();
                    this.greeting = "CodeShare";
                    this.showIcon = true;
                    this.codeblocks = CodeBlocks.find(
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
                    this.mycodeblocks = CodeBlocks.find(
                        {
                            $where: function(){
                                return ( this.deleted !== 1 ) && ( this.owner === id ); //|| this.allowed.indexOf(id) > -1
                            }
                        },
                        {
                            sort: {created: -1}
                        }
                    );
                    return this;
                },
                onBeforeAction: function(){
                    this.next();
                    return this;
                }
            }
        },
        {
            name: "about",
            path: '/about',
            layout: {
                data: function () {
                    this.greeting = "About CodeSead";
                    this.message = "Write code. Publish. Collaborate. Share knowledge.";
                    this.showIcon = true;
                    return this;
                }
            },
            render: {
                data: function(){
                    return this;
                },
                onBeforeAction: function(){
                    this.next();
                    return this;
                }
            }
        },
        {
            name: "denied",
            path: '/not-found',
            layout: {
                data: function () {
                    this.greeting = "How did you get here?";
                    this.message = "Write code. Publish. Collaborate. Share knowledge.";
                    this.showIcon = true;
                    return this;
                }
            },
            render: {
                data: function(){
                    return this;
                },
                onBeforeAction: function(){
                    this.next();
                    return this;
                }
            }
        },
        {
            name: "codeblocks",
            path: '/codeblocks/:_id',
            layout: {
                data: function () {
                    this.greeting = "Common Editor";
                    return this;
                }
            },
            render: {
                data: function() {
                    var data = {},
                        ownsIt = null,
                        published = null,
                        blockId = this.params._id;

                    this.themes = [
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

                    this.codeblock = CodeBlocks.findOne(blockId);
                    if (this.codeblock){
                        this.selectedTheme = this.codeblock.theme;
                        this.greeting = this.greeting;
                        ownsIt = this.codeblock.owner === Meteor.userId();
                        published = !!this.codeblock.published;

                        this.needsPublish =  ownsIt && !published;
                        this.sharable = ownsIt && published;

                        return this;
                    }
                    return this;
                },
                onBeforeAction: function(){
                    var self = this,
                        data = this.data(),
                        codeblockData = data.codeblock,
                        userId = Meteor.userId() || null;

                    if(!!codeblockData && codeblockData.owner !== userId){
                        if(codeblockData.published === 0 || codeblockData.allowed.indexOf(userId) === -1 ){
                            var loggedIn = AccountsEntry.signInRequired(this);
                            if( userId !== codeblockData.owner ){
                                //self.redirect('denied');
                            }
                        }
                    }
                    self.next();
                },
                onStop: function() {
                    if(!!window.myEditor){
                        window.myEditor = null;
                    }
                }
            }
        }
    ];
    var applyRoutes = function(array){
        var inner = function(router){
            Router.route(router.path, function () {
                this.layout('layout', router.layout);
                this.render(router.name, {
                    data: router.render.data,
                    onBeforeAction: router.render.onBeforeAction,
                    onStop: router.render.onStop
                });
            }, {
              name: router.name
            });
        };
        for (var i = 0; i < array.length; i++) {
            inner(array[i]);
        }
        return array;
    }(routeMap);

    var codeBlocksAfterAction = function() {
        var data = this;
            //data = this.data();
        if( Meteor.isClient && !!data._rendered ){
            var onRendered = function(){
                var myTextArea = document.querySelector("#textEdit");

                if(!!myTextArea){
                    var blockId = myTextArea.getAttribute('data-block-id'),
                        hasClass = myTextArea.classList.contains('codeMirror-added');

                    var codeMirrorEle = myTextArea.nextElementSibling,
                        blockId2 = !!codeMirrorEle ? codeMirrorEle.getAttribute('data-block-id') : null;

                    if( !!myTextArea && (!hasClass || blockId !== blockId2) ){
                        var defaultEditor = window.addEditor(myTextArea, data.codeblock);
                    }
                    $('[data-toggle="tooltip"]').tooltip();

                    var themeSelect = document.querySelector("#themeChange1");
                    if(!!themeSelect){
                        themeSelect.value = data.selectedTheme;
                    }
                }
                else{
                    setTimeout(function(){ //this seems to be required because shit happens. Apparently rendered does not mean part of the DOM.
                        onRendered();
                    }, 100); 
                }
            };
            onRendered();
        }
        return data;
    };

    Router.onAfterAction(codeBlocksAfterAction, {
      only: ['codeblocks']
      //except: ['routeOne', 'routeTwo']
    });

})(Meteor, Router);