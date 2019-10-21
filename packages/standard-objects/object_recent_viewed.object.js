Creator.Objects.object_recent_viewed = {
  name: "object_recent_viewed",
  label: "最近查看",
  icon: "forecasts",
  fields: {
    record: {
      type: "lookup",
      label: "记录",
      omit: true,
      is_name: true,
      reference_to: function () {
        return _.keys(Creator.Objects);
      }
    },
    space: {
      type: "text",
      omit: true
    },
    count: {
      type: "number",
      defaultValue: 1
    }
  },
  permission_set: {
    user: {
      allowCreate: true,
      allowDelete: false,
      allowEdit: false,
      allowRead: true,
      modifyAllRecords: false,
      viewAllRecords: false
    },
    admin: {
      allowCreate: true,
      allowDelete: false,
      allowEdit: false,
      allowRead: true,
      modifyAllRecords: false,
      viewAllRecords: true
    },
    guest: {
      allowCreate: true,
      allowDelete: false,
      allowEdit: true,
      allowRead: true,
      modifyAllRecords: false,
      viewAllRecords: true
    }
  },
  list_views: {
    all: {
      columns: ["record", "space", "modified"]
    }
  },
  methods: {
    inc: function (req, res) {
      let {objectName, _id: record_id} = req.params
      let userSession = req.user;
      let {spaceId, userId} = userSession
      var collection_recent_viewed, current_recent_viewed, filters;
      collection_recent_viewed = Creator.getCollection(objectName);
      filters = {
        owner: userId,
        space: spaceId,
        'record.o': objectName,
        'record.ids': [record_id]
      };
      current_recent_viewed = collection_recent_viewed.findOne(filters);
      if (current_recent_viewed) {
        collection_recent_viewed.update(current_recent_viewed._id, {
          $inc: {
            count: 1
          },
          $set: {
            modified: new Date(),
            modified_by: userId
          }
        });
      } else {
        collection_recent_viewed.insert({
          _id: collection_recent_viewed._makeNewID(),
          owner: userId,
          space: spaceId,
          record: {
            o: objectName,
            ids: [record_id]
          },
          count: 1,
          created: new Date(),
          created_by: userId,
          modified: new Date(),
          modified_by: userId
        });
      }
      return true;
    }
  }
};

if (Meteor.isServer) {
  Meteor.publish("object_recent_viewed", function (object_name) {
    var collection;
    collection = Creator.Collections["object_recent_viewed"];
    return collection.find({
      object_name: object_name,
      created_by: this.userId
    }, {
        fields: {
          record_id: 1,
          object_name: 1
        },
        sort: {
          modified: -1
        },
        limit: 20
      });
  });
}