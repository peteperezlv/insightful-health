/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("analytics_collection")

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "eventType_field",
    "maxSelect": 1,
    "name": "eventType",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "view",
      "like",
      "comment",
      "share",
      "search",
      "login",
      "signup"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("analytics_collection")

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "eventType_field",
    "maxSelect": 1,
    "name": "eventType",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "select",
    "values": [
      "view",
      "like",
      "comment",
      "share",
      "search"
    ]
  }))

  return app.save(collection)
})
