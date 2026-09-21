# StockVision - Initial Database Design

## 1. Introduction

The StockVision database will store information related to users, products, categories, suppliers, inventory, sales, discounts, and alerts.

The database will be designed to maintain data consistency, establish relationships between entities, and reduce unnecessary data duplication.

## 2. Planned Database Entities

### 2.1 Users

Stores information about users who access the system.

| Field      | Description            |
| ---------- | ---------------------- |
| user_id    | Unique user identifier |
| name       | User's name            |
| email      | User's email address   |
| password   | User password          |
| role       | User role              |
| created_at | Account creation date  |

Possible roles:

* ADMIN
* SHOPKEEPER

---

### 2.2 Categories

Stores product category information.

| Field         | Description                |
| ------------- | -------------------------- |
| category_id   | Unique category identifier |
| category_name | Name of the category       |
| description   | Category description       |

Examples:

* Dairy
* Bakery
* Beverages
* Fruits
* Vegetables
* Grocery

---

### 2.3 Products

Stores information about products available in the store.

| Field        | Description               |
| ------------ | ------------------------- |
| product_id   | Unique product identifier |
| product_name | Name of the product       |
| category_id  | Associated category       |
| supplier_id  | Associated supplier       |
| price        | Original product price    |
| quantity     | Available quantity        |
| expiry_date  | Product expiry date       |
| created_at   | Product creation date     |

---

### 2.4 Suppliers

Stores supplier information.

| Field         | Description                |
| ------------- | -------------------------- |
| supplier_id   | Unique supplier identifier |
| supplier_name | Supplier name              |
| phone         | Contact number             |
| email         | Email address              |
| address       | Supplier address           |

---

### 2.5 Inventory

Stores information about the current stock of products.

| Field        | Description                 |
| ------------ | --------------------------- |
| inventory_id | Unique inventory identifier |
| product_id   | Associated product          |
| quantity     | Current quantity            |
| last_updated | Last stock update           |

---

### 2.6 Sales

Stores information about product sales.

| Field         | Description            |
| ------------- | ---------------------- |
| sale_id       | Unique sale identifier |
| product_id    | Product sold           |
| quantity      | Quantity sold          |
| selling_price | Actual selling price   |
| sale_date     | Date and time of sale  |

---

### 2.7 Discounts

Stores discount recommendations and pricing information.

| Field               | Description                |
| ------------------- | -------------------------- |
| discount_id         | Unique discount identifier |
| product_id          | Associated product         |
| original_price      | Original product price     |
| discount_percentage | Recommended discount       |
| discounted_price    | Price after discount       |
| reason              | Reason for discount        |
| created_at          | Recommendation date        |

---

### 2.8 Alerts

Stores inventory-related alerts.

| Field      | Description             |
| ---------- | ----------------------- |
| alert_id   | Unique alert identifier |
| product_id | Associated product      |
| alert_type | Type of alert           |
| message    | Alert message           |
| status     | Alert status            |
| created_at | Alert creation date     |

Possible alert types:

* LOW_STOCK
* EXPIRING_SOON
* EXPIRED

## 3. Main Relationships

The planned relationships are:

```text
Categories
    │
    └── Products
          │
          ├── Inventory
          ├── Sales
          ├── Discounts
          └── Alerts

Suppliers
    │
    └── Products

Users
    │
    └── System Access
```

## 4. Important Relationships

* One category can contain many products.
* One supplier can supply many products.
* One product can have inventory information.
* One product can have multiple sales records.
* One product can have multiple discount recommendations.
* One product can generate multiple alerts.

## 5. Database Design Goals

The database will aim to:

* Avoid unnecessary data duplication.
* Maintain relationships between entities.
* Ensure data consistency.
* Support inventory tracking.
* Support sales tracking.
* Support expiry monitoring.
* Support dynamic pricing recommendations.
* Allow future expansion of the system.

## 6. Current Status

This document represents the initial planned database design.

The final database schema may be updated during development based on application requirements and implementation decisions.
