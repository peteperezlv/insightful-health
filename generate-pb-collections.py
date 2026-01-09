#!/usr/bin/env python3
"""
Generate PocketBase collections JSON in the correct format.
This script creates a properly formatted collections export file
that can be imported directly into PocketBase Admin UI.
"""

import json

collections = [
    # 1. USERS COLLECTION (Auth type)
    {
        "name": "users",
        "type": "auth",
        "system": False,
        "schema": [
            {
                "name": "username",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": 3,
                    "max": 30,
                    "pattern": "^[a-zA-Z0-9_]+$"
                }
            },
            {
                "name": "fullName",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": 255,
                    "pattern": ""
                }
            },
            {
                "name": "bio",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": 500,
                    "pattern": ""
                }
            },
            {
                "name": "profileImageUrl",
                "type": "url",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "exceptDomains": [],
                    "onlyDomains": []
                }
            },
            {
                "name": "twitterUrl",
                "type": "url",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "exceptDomains": [],
                    "onlyDomains": []
                }
            },
            {
                "name": "linkedinUrl",
                "type": "url",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "exceptDomains": [],
                    "onlyDomains": []
                }
            },
            {
                "name": "githubUrl",
                "type": "url",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "exceptDomains": [],
                    "onlyDomains": []
                }
            },
            {
                "name": "personalWebsite",
                "type": "url",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "exceptDomains": [],
                    "onlyDomains": []
                }
            },
            {
                "name": "role",
                "type": "select",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "maxSelect": 1,
                    "values": ["user", "author", "admin"]
                }
            },
            {
                "name": "isVerified",
                "type": "bool",
                "required": False,
                "presentable": False,
                "unique": False
            },
            {
                "name": "isBanned",
                "type": "bool",
                "required": False,
                "presentable": False,
                "unique": False
            },
            {
                "name": "banReason",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "bannedAt",
                "type": "date",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": "",
                    "max": ""
                }
            },
            {
                "name": "emailNotifications",
                "type": "bool",
                "required": False,
                "presentable": False,
                "unique": False
            },
            {
                "name": "newsletterSubscribed",
                "type": "bool",
                "required": False,
                "presentable": False,
                "unique": False
            },
            {
                "name": "lastLoginAt",
                "type": "date",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": "",
                    "max": ""
                }
            },
            {
                "name": "loginCount",
                "type": "number",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": 0,
                    "max": None,
                    "noDecimal": True
                }
            },
            {
                "name": "totalPostViews",
                "type": "number",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": 0,
                    "max": None,
                    "noDecimal": True
                }
            }
        ],
        "indexes": [
            "CREATE INDEX idx_users_role ON users(role)",
            "CREATE INDEX idx_users_isBanned ON users(isBanned)"
        ],
        "listRule": "",
        "viewRule": "id = @request.auth.id || @request.auth.verified = true",
        "createRule": "",
        "updateRule": "id = @request.auth.id || @request.auth.role = 'admin'",
        "deleteRule": "@request.auth.role = 'admin'",
        "options": {
            "allowEmailAuth": True,
            "allowOAuth2Auth": True,
            "allowUsernameAuth": False,
            "exceptEmailDomains": [],
            "manualVerification": False,
            "minPasswordLength": 8,
            "onlyEmailDomains": [],
            "requireEmail": True
        }
    },
    
    # 2. CATEGORIES COLLECTION
    {
        "name": "categories",
        "type": "base",
        "system": False,
        "schema": [
            {
                "name": "name",
                "type": "text",
                "required": True,
                "presentable": False,
                "unique": True,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "slug",
                "type": "text",
                "required": True,
                "presentable": False,
                "unique": True,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "description",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "icon",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "color",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": "^#[0-9A-F]{6}$"
                }
            },
            {
                "name": "displayOrder",
                "type": "number",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "noDecimal": True
                }
            }
        ],
        "indexes": [
            "CREATE UNIQUE INDEX idx_categories_name ON categories(name)",
            "CREATE UNIQUE INDEX idx_categories_slug ON categories(slug)",
            "CREATE INDEX idx_categories_displayOrder ON categories(displayOrder)"
        ],
        "listRule": "",
        "viewRule": "",
        "createRule": "@request.auth.role = 'admin'",
        "updateRule": "@request.auth.role = 'admin'",
        "deleteRule": "@request.auth.role = 'admin'"
    },
    
    # 3. TAGS COLLECTION
    {
        "name": "tags",
        "type": "base",
        "system": False,
        "schema": [
            {
                "name": "name",
                "type": "text",
                "required": True,
                "presentable": False,
                "unique": True,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "slug",
                "type": "text",
                "required": True,
                "presentable": False,
                "unique": True,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "description",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            }
        ],
        "indexes": [
            "CREATE UNIQUE INDEX idx_tags_name ON tags(name)",
            "CREATE UNIQUE INDEX idx_tags_slug ON tags(slug)"
        ],
        "listRule": "",
        "viewRule": "",
        "createRule": "@request.auth.role = 'admin' || @request.auth.role = 'author'",
        "updateRule": "@request.auth.role = 'admin'",
        "deleteRule": "@request.auth.role = 'admin'"
    },
    
    # 4. POSTS COLLECTION
    {
        "name": "posts",
        "type": "base",
        "system": False,
        "schema": [
            {
                "name": "title",
                "type": "text",
                "required": True,
                "presentable": True,
                "unique": False,
                "options": {
                    "min": 1,
                    "max": 200,
                    "pattern": ""
                }
            },
            {
                "name": "slug",
                "type": "text",
                "required": True,
                "presentable": False,
                "unique": True,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "excerpt",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": 300,
                    "pattern": ""
                }
            },
            {
                "name": "content",
                "type": "editor",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "convertUrls": False
                }
            },
            {
                "name": "featuredImageUrl",
                "type": "url",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "exceptDomains": [],
                    "onlyDomains": []
                }
            },
            {
                "name": "status",
                "type": "select",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "maxSelect": 1,
                    "values": ["draft", "published", "deleted"]
                }
            },
            {
                "name": "isFeatured",
                "type": "bool",
                "required": False,
                "presentable": False,
                "unique": False
            },
            {
                "name": "categoryId",
                "type": "relation",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "collectionId": "categories",
                    "cascadeDelete": False,
                    "minSelect": None,
                    "maxSelect": 1,
                    "displayFields": ["name"]
                }
            },
            {
                "name": "tags",
                "type": "relation",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "collectionId": "tags",
                    "cascadeDelete": False,
                    "minSelect": None,
                    "maxSelect": None,
                    "displayFields": ["name"]
                }
            },
            {
                "name": "seoTitle",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": 60,
                    "pattern": ""
                }
            },
            {
                "name": "seoDescription",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": 160,
                    "pattern": ""
                }
            },
            {
                "name": "seoKeywords",
                "type": "json",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "maxSize": 2000000
                }
            },
            {
                "name": "canonicalUrl",
                "type": "url",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "exceptDomains": [],
                    "onlyDomains": []
                }
            },
            {
                "name": "ogImageUrl",
                "type": "url",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "exceptDomains": [],
                    "onlyDomains": []
                }
            },
            {
                "name": "ogTitle",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "ogDescription",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "authorId",
                "type": "relation",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "collectionId": "users",
                    "cascadeDelete": False,
                    "minSelect": None,
                    "maxSelect": 1,
                    "displayFields": ["email"]
                }
            },
            {
                "name": "authorName",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "viewCount",
                "type": "number",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": 0,
                    "max": None,
                    "noDecimal": True
                }
            },
            {
                "name": "likeCount",
                "type": "number",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": 0,
                    "max": None,
                    "noDecimal": True
                }
            },
            {
                "name": "commentCount",
                "type": "number",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": 0,
                    "max": None,
                    "noDecimal": True
                }
            },
            {
                "name": "readingTimeMinutes",
                "type": "number",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": 0,
                    "max": None,
                    "noDecimal": True
                }
            },
            {
                "name": "wordCount",
                "type": "number",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": 0,
                    "max": None,
                    "noDecimal": True
                }
            },
            {
                "name": "publishedAt",
                "type": "date",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": "",
                    "max": ""
                }
            },
            {
                "name": "scheduledFor",
                "type": "date",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": "",
                    "max": ""
                }
            },
            {
                "name": "deletedAt",
                "type": "date",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": "",
                    "max": ""
                }
            },
            {
                "name": "isApproved",
                "type": "bool",
                "required": False,
                "presentable": False,
                "unique": False
            },
            {
                "name": "approvedBy",
                "type": "relation",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "collectionId": "users",
                    "cascadeDelete": False,
                    "minSelect": None,
                    "maxSelect": 1,
                    "displayFields": ["email"]
                }
            },
            {
                "name": "approvedAt",
                "type": "date",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": "",
                    "max": ""
                }
            }
        ],
        "indexes": [
            "CREATE INDEX idx_posts_authorId ON posts(authorId)",
            "CREATE UNIQUE INDEX idx_posts_slug ON posts(slug)",
            "CREATE INDEX idx_posts_status_publishedAt ON posts(status, publishedAt DESC)",
            "CREATE INDEX idx_posts_categoryId ON posts(categoryId)",
            "CREATE INDEX idx_posts_viewCount ON posts(viewCount DESC)",
            "CREATE INDEX idx_posts_isFeatured ON posts(isFeatured)",
            "CREATE INDEX idx_posts_created ON posts(created DESC)"
        ],
        "listRule": "status = 'published' || @request.auth.role = 'admin' || authorId = @request.auth.id",
        "viewRule": "status = 'published' || @request.auth.role = 'admin' || authorId = @request.auth.id",
        "createRule": "@request.auth.role = 'author' || @request.auth.role = 'admin'",
        "updateRule": "authorId = @request.auth.id || @request.auth.role = 'admin'",
        "deleteRule": "@request.auth.role = 'admin'"
    },
    
    # 5. COMMENTS COLLECTION
    {
        "name": "comments",
        "type": "base",
        "system": False,
        "schema": [
            {
                "name": "postId",
                "type": "relation",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "collectionId": "posts",
                    "cascadeDelete": True,
                    "minSelect": None,
                    "maxSelect": 1,
                    "displayFields": ["title"]
                }
            },
            {
                "name": "content",
                "type": "text",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": 1,
                    "max": 5000,
                    "pattern": ""
                }
            },
            {
                "name": "authorId",
                "type": "relation",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "collectionId": "users",
                    "cascadeDelete": False,
                    "minSelect": None,
                    "maxSelect": 1,
                    "displayFields": ["email"]
                }
            },
            {
                "name": "authorName",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "authorEmail",
                "type": "email",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "exceptDomains": [],
                    "onlyDomains": []
                }
            },
            {
                "name": "parentCommentId",
                "type": "relation",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "collectionId": "comments",
                    "cascadeDelete": False,
                    "minSelect": None,
                    "maxSelect": 1,
                    "displayFields": []
                }
            },
            {
                "name": "status",
                "type": "select",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "maxSelect": 1,
                    "values": ["pending", "approved", "rejected", "spam"]
                }
            },
            {
                "name": "approvedBy",
                "type": "relation",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "collectionId": "users",
                    "cascadeDelete": False,
                    "minSelect": None,
                    "maxSelect": 1,
                    "displayFields": ["email"]
                }
            },
            {
                "name": "approvedAt",
                "type": "date",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": "",
                    "max": ""
                }
            },
            {
                "name": "rejectionReason",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "isEdited",
                "type": "bool",
                "required": False,
                "presentable": False,
                "unique": False
            },
            {
                "name": "editedAt",
                "type": "date",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": "",
                    "max": ""
                }
            },
            {
                "name": "editHistory",
                "type": "json",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "maxSize": 2000000
                }
            },
            {
                "name": "ipAddress",
                "type": "text",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "userAgent",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "likeCount",
                "type": "number",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": 0,
                    "max": None,
                    "noDecimal": True
                }
            }
        ],
        "indexes": [
            "CREATE INDEX idx_comments_postId ON comments(postId)",
            "CREATE INDEX idx_comments_authorId ON comments(authorId)",
            "CREATE INDEX idx_comments_parentCommentId ON comments(parentCommentId)",
            "CREATE INDEX idx_comments_status ON comments(status)",
            "CREATE INDEX idx_comments_created ON comments(created DESC)",
            "CREATE INDEX idx_comments_postId_status ON comments(postId, status)"
        ],
        "listRule": "status = 'approved' || @request.auth.role = 'admin'",
        "viewRule": "status = 'approved' || @request.auth.role = 'admin' || authorId = @request.auth.id",
        "createRule": "@request.auth.id != ''",
        "updateRule": "authorId = @request.auth.id || @request.auth.role = 'admin'",
        "deleteRule": "authorId = @request.auth.id || @request.auth.role = 'admin'"
    },
    
    # 6. LIKES COLLECTION
    {
        "name": "likes",
        "type": "base",
        "system": False,
        "schema": [
            {
                "name": "postId",
                "type": "relation",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "collectionId": "posts",
                    "cascadeDelete": True,
                    "minSelect": None,
                    "maxSelect": 1,
                    "displayFields": ["title"]
                }
            },
            {
                "name": "userId",
                "type": "relation",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "collectionId": "users",
                    "cascadeDelete": False,
                    "minSelect": None,
                    "maxSelect": 1,
                    "displayFields": ["email"]
                }
            },
            {
                "name": "ipAddress",
                "type": "text",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "sessionId",
                "type": "text",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "userAgent",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "referer",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            }
        ],
        "indexes": [
            "CREATE INDEX idx_likes_postId ON likes(postId)",
            "CREATE INDEX idx_likes_userId ON likes(userId)",
            "CREATE UNIQUE INDEX idx_likes_postId_userId ON likes(postId, userId)",
            "CREATE UNIQUE INDEX idx_likes_postId_ipAddress ON likes(postId, ipAddress, sessionId)"
        ],
        "listRule": "",
        "viewRule": "",
        "createRule": "",
        "updateRule": None,
        "deleteRule": "@request.auth.role = 'admin' || userId = @request.auth.id"
    },
    
    # 7. POST_VERSIONS COLLECTION
    {
        "name": "post_versions",
        "type": "base",
        "system": False,
        "schema": [
            {
                "name": "postId",
                "type": "relation",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "collectionId": "posts",
                    "cascadeDelete": True,
                    "minSelect": None,
                    "maxSelect": 1,
                    "displayFields": ["title"]
                }
            },
            {
                "name": "versionNumber",
                "type": "number",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": 1,
                    "max": None,
                    "noDecimal": True
                }
            },
            {
                "name": "title",
                "type": "text",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "slug",
                "type": "text",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "content",
                "type": "editor",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "convertUrls": False
                }
            },
            {
                "name": "excerpt",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "status",
                "type": "select",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "maxSelect": 1,
                    "values": ["draft", "published", "deleted"]
                }
            },
            {
                "name": "editedBy",
                "type": "relation",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "collectionId": "users",
                    "cascadeDelete": False,
                    "minSelect": None,
                    "maxSelect": 1,
                    "displayFields": ["email"]
                }
            },
            {
                "name": "editReason",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "changesSummary",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            }
        ],
        "indexes": [
            "CREATE INDEX idx_post_versions_postId ON post_versions(postId)",
            "CREATE INDEX idx_post_versions_editedBy ON post_versions(editedBy)",
            "CREATE INDEX idx_post_versions_created ON post_versions(created DESC)"
        ],
        "listRule": "@request.auth.role = 'admin'",
        "viewRule": "@request.auth.role = 'admin'",
        "createRule": "@request.auth.role = 'admin'",
        "updateRule": None,
        "deleteRule": "@request.auth.role = 'admin'"
    },
    
    # 8. ANALYTICS COLLECTION
    {
        "name": "analytics",
        "type": "base",
        "system": False,
        "schema": [
            {
                "name": "postId",
                "type": "relation",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "collectionId": "posts",
                    "cascadeDelete": False,
                    "minSelect": None,
                    "maxSelect": 1,
                    "displayFields": ["title"]
                }
            },
            {
                "name": "userId",
                "type": "relation",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "collectionId": "users",
                    "cascadeDelete": False,
                    "minSelect": None,
                    "maxSelect": 1,
                    "displayFields": ["email"]
                }
            },
            {
                "name": "eventType",
                "type": "select",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "maxSelect": 1,
                    "values": ["view", "like", "comment", "share", "search"]
                }
            },
            {
                "name": "ipAddress",
                "type": "text",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "sessionId",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "referer",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "userAgent",
                "type": "text",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "deviceType",
                "type": "select",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "maxSelect": 1,
                    "values": ["desktop", "mobile", "tablet"]
                }
            },
            {
                "name": "pageUrl",
                "type": "text",
                "required": True,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": None,
                    "max": None,
                    "pattern": ""
                }
            },
            {
                "name": "timeOnPage",
                "type": "number",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": 0,
                    "max": None,
                    "noDecimal": True
                }
            },
            {
                "name": "scrollDepth",
                "type": "number",
                "required": False,
                "presentable": False,
                "unique": False,
                "options": {
                    "min": 0,
                    "max": 100,
                    "noDecimal": False
                }
            }
        ],
        "indexes": [
            "CREATE INDEX idx_analytics_postId ON analytics(postId)",
            "CREATE INDEX idx_analytics_userId ON analytics(userId)",
            "CREATE INDEX idx_analytics_eventType ON analytics(eventType)",
            "CREATE INDEX idx_analytics_created ON analytics(created DESC)",
            "CREATE INDEX idx_analytics_postId_created ON analytics(postId, created DESC)"
        ],
        "listRule": "@request.auth.role = 'admin'",
        "viewRule": "@request.auth.role = 'admin'",
        "createRule": "",
        "updateRule": None,
        "deleteRule": "@request.auth.role = 'admin'"
    }
]

# Write to file
with open('pocketbase-collections.json', 'w') as f:
    json.dump(collections, f, indent=2)

print("✅ Generated pocketbase-collections.json")
print(f"✅ Created {len(collections)} collections")
print("\nTo import:")
print("1. Open PocketBase Admin UI (http://localhost:8090/_/)")
print("2. Go to Settings → Import collections")
print("3. Select the file or paste its contents")
print("4. Click Import")
