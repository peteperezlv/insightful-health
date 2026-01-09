/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("analytics_collection");

  return app.delete(collection);
}, (app) => {
  const collection = new Collection({
    "createRule": "",
    "deleteRule": "@request.auth.role = 'admin'",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "posts_collection",
        "hidden": false,
        "id": "postId_field",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "postId",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "users_collection",
        "hidden": false,
        "id": "userId_field",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "userId",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
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
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "ipAddress_field",
        "max": 0,
        "min": 0,
        "name": "ipAddress",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "sessionId_field",
        "max": 0,
        "min": 0,
        "name": "sessionId",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "referer_field",
        "max": 0,
        "min": 0,
        "name": "referer",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "userAgent_field",
        "max": 0,
        "min": 0,
        "name": "userAgent",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "deviceType_field",
        "maxSelect": 1,
        "name": "deviceType",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "desktop",
          "mobile",
          "tablet"
        ]
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "pageUrl_field",
        "max": 0,
        "min": 0,
        "name": "pageUrl",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "timeOnPage_field",
        "max": null,
        "min": null,
        "name": "timeOnPage",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "scrollDepth_field",
        "max": null,
        "min": null,
        "name": "scrollDepth",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      }
    ],
    "id": "analytics_collection",
    "indexes": [
      "CREATE INDEX idx_analytics_postId ON analytics(postId)",
      "CREATE INDEX idx_analytics_userId ON analytics(userId)",
      "CREATE INDEX idx_analytics_eventType ON analytics(eventType)"
    ],
    "listRule": "@request.auth.role = 'admin'",
    "name": "analytics",
    "system": false,
    "type": "base",
    "updateRule": "",
    "viewRule": "@request.auth.role = 'admin'"
  });

  return app.save(collection);
})
