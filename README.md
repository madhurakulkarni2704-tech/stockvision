&#x20;StockVision



Smart Inventory Management \& Dynamic Pricing System for Perishable Products



StockVision is a web-based inventory management system designed to help small retailers manage their inventory efficiently, monitor product expiry, reduce product wastage, and make informed pricing decisions.



The system focuses on perishable products such as dairy products, bakery items, fruits, vegetables, beverages, and groceries that have a limited shelf life.







Problem Statement



Small retailers often manage their inventory manually using notebooks, spreadsheets, or basic billing systems. These methods may make it difficult to:



\* Track the exact quantity of products in stock

\* Monitor product expiry dates

\* Identify products that are nearing expiry

\* Detect low-stock products on time

\* Decide appropriate discounts for products nearing expiry

\* Analyze sales and inventory patterns



As a result, products may expire before they are sold, causing product wastage and financial losses.



StockVision aims to provide a centralized system that helps retailers monitor inventory, identify products requiring immediate attention, and make better inventory and pricing decisions.



&#x20;Objectives



The main objectives of StockVision are:



\* To digitize inventory management for small retailers.

\* To maintain accurate product and stock information.

\* To monitor product expiry dates.

\* To identify products that are nearing expiry.

\* To provide low-stock and expiry alerts.

\* To recommend suitable discounts for products nearing expiry.

\* To record and monitor sales.

\* To provide dashboards and reports for inventory analysis.

\* To help reduce product wastage and unnecessary inventory losses.



&#x20;Key Features



&#x20;User Authentication



\* User registration and login

\* Secure authentication

\* Role-based access

\* Logout functionality



&#x20;Product Management



\* Add new products

\* View product details

\* Update product information

\* Delete products

\* Manage product categories

\* Store product expiry dates



Inventory Management



\* Monitor current stock

\* Track available quantities

\* Identify low-stock products

\* Identify out-of-stock products

\* Update inventory based on sales



&#x20;Expiry Monitoring



StockVision monitors product expiry dates and categorizes products based on their remaining shelf life.



&#x20;Smart Alerts



The system can generate alerts for:



\* Low-stock products

\* Products nearing expiry

\* Expired products



&#x20;Dynamic Discount Recommendations



StockVision provides discount recommendations for selected products based on factors such as:



\* Days remaining until expiry

\* Current stock quantity

\* Product information



&#x20;Sales Management



\* Record product sales

\* Track sold quantities

\* Maintain sales history

\* Automatically update inventory after sales



&#x20;Dashboard \& Analytics



The dashboard will provide useful information such as:



\* Total products

\* Total inventory

\* Low-stock products

\* Products nearing expiry

\* Expired products

\* Sales information

\* Discount recommendations



&#x20;Reports



The system will support reports related to:



\* Inventory

\* Sales

\* Expiring products

\* Expired products

\* Discount recommendations

\* Product wastage



&#x20;Target Users



&#x20;Shopkeeper / Retailer



The primary user of StockVision.



The retailer can:



\* Manage products

\* Monitor inventory

\* Record sales

\* Monitor expiry dates

\* View alerts

\* View discount recommendations

\* Analyze reports



&#x20;Administrator



The administrator can:



\* Manage users

\* Manage product categories

\* Monitor overall system information

\* Manage system-level data



&#x20;Technology Stack



&#x20;Frontend



\* React.js

\* JavaScript

\* HTML5

\* CSS3



&#x20;Backend



\* Python

\* Django

\* Django REST Framework



&#x20;Database



\* MySQL



Tools \& Platforms



\* Visual Studio Code

\* Git

\* GitHub

\* Postman



&#x20;System Architecture



StockVision follows a client-server architecture.





&#x20;               ┌──────────────────────┐

&#x20;               │      React.js        │

&#x20;               │   Frontend / UI      │

&#x20;               └──────────┬───────────┘

&#x20;                          │

&#x20;                          │ REST API

&#x20;                          ▼

&#x20;               ┌──────────────────────┐

&#x20;               │       Django         │

&#x20;               │       Backend        │

&#x20;               └──────────┬───────────┘

&#x20;                          │

&#x20;                          ▼

&#x20;               ┌──────────────────────┐

&#x20;               │        MySQL         │

&#x20;               │       Database       │

&#x20;               └──────────────────────┘

&#x20;Application Flow



User

&#x20; ↓

React Frontend

&#x20; ↓

Django REST API

&#x20; ↓

Business Logic

&#x20; ↓

MySQL Database

&#x20; ↓

Response

&#x20; ↓

React Dashboard



&#x20;Planned Project Structure



StockVision/

│

├── frontend/

│   └── React Application

│

├── backend/

│   └── Django Application

│

├── docs/

│   ├── PROJECT\_SCOPE.md

│   └── DATABASE\_DESIGN.md

│

├── README.md

│

└── .gitignore





&#x20;Planned Database Entities



The initial database design will include entities such as:



\* Users

\* Categories

\* Products

\* Suppliers

\* Inventory

\* Sales

\* Discounts

\* Alerts



The database structure may be modified during development according to application requirements.



Add Product

&#x20;    ↓

Store Product \& Expiry Information

&#x20;    ↓

Monitor Inventory

&#x20;    ↓

Check Stock \& Expiry Status

&#x20;    ↓

Generate Alerts

&#x20;    ↓

Identify Products Nearing Expiry

&#x20;    ↓

Generate Discount Recommendation

&#x20;    ↓

Record Sales

&#x20;    ↓

Update Inventory

&#x20;    ↓

Generate Reports \& Analytics



&#x20;Future Enhancements



The following features may be considered for future versions:



\* AI-based demand forecasting

\* Sales prediction

\* Barcode / QR code integration

\* Mobile application

\* Automated notifications

\* Advanced inventory analytics

\* Supplier management

\* Product wastage analysis

\* Intelligent stock replenishment suggestions



&#x20;Project Status



&#x20;Currently in Development



The project is being developed as part of an MCA academic project using React.js, Django, and MySQL.



&#x20;Team



StockVision is developed as a collaborative MCA team project by three members.



&#x20;Team Contributions



\* Frontend Development — React.js and UI

\* Backend Development — Django and REST APIs

\* Database \& Smart Inventory Logic — MySQL, expiry monitoring, alerts, and dynamic pricing



&#x20;License



This project is developed for academic and educational purposes.



