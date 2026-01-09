/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const dao = app.dao()
  const collection = dao.findCollectionByNameOrId("analytics")

  // Find and update the eventType field
  const eventTypeField = collection.schema.find(f => f.name === "eventType")
  if (eventTypeField) {
    eventTypeField.options = {
      "maxSelect": 1,
      "values": [
        "view",
        "like",
        "comment",
        "share",
        "search",
        "login",
        "signup"
      ]
    }
  }

  return dao.saveCollection(collection)
}, (app) => {
  const dao = app.dao()
  const collection = dao.findCollectionByNameOrId("analytics")

  // Revert the eventType field values
  const eventTypeField = collection.schema.find(f => f.name === "eventType")
  if (eventTypeField) {
    eventTypeField.options = {
      "maxSelect": 1,
      "values": [
        "view",
        "like",
        "comment",
        "share",
        "search"
      ]
    }
  }

  return dao.saveCollection(collection)
})
