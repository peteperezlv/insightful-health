/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != '' && @request.auth.role = 'admin'",
    "deleteRule": null,
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
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation1234567890",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "userId",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "select2345678901",
        "maxSelect": 1,
        "name": "action",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "create",
          "update",
          "delete",
          "publish",
          "unpublish",
          "approve",
          "reject",
          "ban",
          "unban",
          "feature",
          "unfeature",
          "bulk_delete",
          "bulk_update",
          "role_change",
          "restore",
          "export"
        ]
      },
      {
        "hidden": false,
        "id": "select3456789012",
        "maxSelect": 1,
        "name": "resourceType",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "user",
          "post",
          "comment",
          "category",
          "tag",
          "settings"
        ]
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text4567890123",
        "max": 0,
        "min": 0,
        "name": "resourceId",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "json5678901234",
        "maxSize": 0,
        "name": "changes",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": false,
        "id": "json6789012345",
        "maxSize": 0,
        "name": "metadata",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text7890123456",
        "max": 45,
        "min": 0,
        "name": "ipAddress",
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
        "id": "text8901234567",
        "max": 500,
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
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_audit_logs_001",
    "indexes": [
      "CREATE INDEX idx_audit_userId ON audit_logs (userId)",
      "CREATE INDEX idx_audit_resourceType ON audit_logs (resourceType)",
      "CREATE INDEX idx_audit_action ON audit_logs (action)",
      "CREATE INDEX idx_audit_created ON audit_logs (created)"
    ],
    "listRule": "@request.auth.id != '' && @request.auth.role = 'admin'",
    "name": "audit_logs",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": "@request.auth.id != '' && @request.auth.role = 'admin'"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_audit_logs_001");

  return app.delete(collection);
});
