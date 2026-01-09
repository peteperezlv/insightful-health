/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("comments_collection")

  // remove field
  collection.fields.removeById("date2990389176")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("comments_collection")

  // add field
  collection.fields.addAt(17, new Field({
    "hidden": false,
    "id": "date2990389176",
    "max": "",
    "min": "",
    "name": "created",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
})
