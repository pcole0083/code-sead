if (Meteor.isServer) {

    Meteor.publish('codeblocks', function() {
        return CodeBlocks.find();
    });

    Meteor.publish("directory", function() {
        return Meteor.users.find({}, {
            fields: {
                emails: 1,
                profile: 1
            }
        });
    });

}