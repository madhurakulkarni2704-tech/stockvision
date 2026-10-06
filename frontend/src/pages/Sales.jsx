import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createSale,
  getInventory,
  getProducts,
  getSale,
  getSales,
} from "../services/api";
import "./Sales.css";

function Sales() {
  const navigate = useNavigate();

  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedSale, setSelectedSale] = useState(null);

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");

  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadSalesData() {
      try {
        setLoading(true);
        setError("");

        const [salesData, productsData, inventoryData] =
          await Promise.all([
            getSales(),
            getProducts(),
            getInventory(),
          ]);

        setSales(salesData);
        setProducts(productsData);
        setInventory(inventoryData);
      } catch (err) {
        setError(err.message || "Failed to load sales data.");
      } finally {
        setLoading(false);
      }
    }

    loadSalesData();
  }, []);

  const productOptions = useMemo(() => {
    return products.map((product) => {
      const stockItem = inventory.find(
        (item) =>
          String(item.product) === String(product.id) ||
          String(item.product_id) === String(product.id)
      );

      return {
        ...product,
        stock: stockItem?.quantity ?? 0,
      };
    });
  }, [products, inventory]);

  const selectedProduct = useMemo(() => {
    return productOptions.find(
      (product) => String(product.id) === String(productId)
    );
  }, [productOptions, productId]);

  const totalAmount =
    Number(quantity || 0) * Number(sellingPrice || 0);

  const filteredSales = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) {
      return sales;
    }

    return sales.filter(
      (sale) =>
        sale.product_name?.toLowerCase().includes(searchText) ||
        sale.sku?.toLowerCase().includes(searchText)
    );
  }, [sales, search]);

  const totalSalesAmount = useMemo(() => {
    return sales.reduce(
      (total, sale) => total + Number(sale.total_amount || 0),
      0
    );
  }, [sales]);

  const totalUnitsSold = useMemo(() => {
    return sales.reduce(
      (total, sale) => total + Number(sale.quantity || 0),
      0
    );
  }, [sales]);

  function handleProductChange(event) {
    const value = event.target.value;

    setProductId(value);
    setError("");
    setSuccess("");

    const product = productOptions.find(
      (item) => String(item.id) === String(value)
    );

    if (product) {
      setSellingPrice(
        product.price !== undefined && product.price !== null
          ? product.price
          : ""
      );
    } else {
      setSellingPrice("");
    }
  }

  async function handleCreateSale(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!productId) {
      setError("Please select a product.");
      return;
    }

    const saleQuantity = Number(quantity);
    const price = Number(sellingPrice);

    if (!Number.isInteger(saleQuantity) || saleQuantity <= 0) {
      setError("Quantity must be a positive whole number.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Selling price must be greater than 0.");
      return;
    }

    if (
      selectedProduct &&
      saleQuantity > Number(selectedProduct.stock || 0)
    ) {
      setError(
        `Insufficient stock. Available stock: ${selectedProduct.stock}.`
      );
      return;
    }

    try {
      setSubmitting(true);

      const sale = await createSale({
        product: Number(productId),
        quantity: saleQuantity,
        selling_price: price.toFixed(2),
      });

      setSales((currentSales) => [sale, ...currentSales]);

      setQuantity("");
      setSellingPrice("");
      setProductId("");

      setSuccess(
        `Sale created successfully. ${sale.product_name} × ${sale.quantity} sold for ₹${sale.total_amount}.`
      );

      const inventoryData = await getInventory();
      setInventory(inventoryData);
    } catch (err) {
      setError(err.message || "Failed to create sale.");
    } finally {
      setSubmitting(false);
    }
  }

  async function openSale(sale) {
    setError("");
    setSuccess("");

    try {
      const data = await getSale(sale.id);
      setSelectedSale(data);
    } catch (err) {
      setError(err.message || "Failed to load sale details.");
    }
  }

  function closeSaleDetails() {
    setSelectedSale(null);
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleString();
  }

  return (
    <div className="sales-page">
      {/* SIDEBAR */}
      <aside className="sales-sidebar">
        <div className="sales-brand">
          <div className="sales-logo">SV</div>

          <div>
            <h2>StockVision</h2>
            <span>Inventory Management</span>
          </div>
        </div>

        <nav className="sales-nav">
          <button onClick={() => navigate("/dashboard")}>
            <span>⌂</span>
            Dashboard
          </button>

          <button onClick={() => navigate("/products")}>
            <span>▣</span>
            Products
          </button>

          <button onClick={() => navigate("/inventory")}>
            <span>▤</span>
            Inventory
          </button>

          <button className="active">
            <span>₹</span>
            Sales
          </button>

          <button onClick={() => navigate("/profile")}>
            <span>♙</span>
            Profile
          </button>
        </nav>

        <div className="sales-sidebar-divider"></div>

        <div className="sales-sidebar-promo">
          <div className="sales-promo-illustration">
            <div className="sales-promo-box box-one"></div>
            <div className="sales-promo-box box-two"></div>
            <div className="sales-promo-box box-three"></div>

            <div className="sales-promo-chart">
              ▂▅▇
            </div>
          </div>

          <h3>
            Sell Smarter
            <br />
            Grow Faster
          </h3>

          <p>
            Record sales, track revenue and keep
            your inventory up to date.
          </p>

          <div className="sales-promo-dots">
            <span className="active"></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="sales-main">
        {/* HEADER */}
        <header className="sales-header">
          <div className="sales-header-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search sales..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <button
            className="sales-logout"
            onClick={() => {
              localStorage.removeItem("access");
              localStorage.removeItem("refresh");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </header>

        {/* CONTENT */}
        <main className="sales-content">
          {/* TITLE */}
          <div className="sales-title-row">
            <div>
              <span className="sales-label">
                SALES MANAGEMENT
              </span>

              <h1>Sales</h1>

              <p>
                Record product sales and automatically update inventory.
              </p>
            </div>
          </div>

          {/* MESSAGES */}
          {error && (
            <div className="sales-error">
              {error}
            </div>
          )}

          {success && (
            <div className="sales-success">
              {success}
            </div>
          )}

          {/* STAT CARDS */}
          <section className="sales-stats">
            <div className="sales-stat-card">
              <div className="sales-stat-icon purple">
                ₹
              </div>

              <div>
                <p>Total Sales</p>
                <h2>₹{totalSalesAmount.toFixed(2)}</h2>
                <span>Recorded sales value</span>
              </div>
            </div>

            <div className="sales-stat-card">
              <div className="sales-stat-icon blue">
                #
              </div>

              <div>
                <p>Sales Count</p>
                <h2>{sales.length}</h2>
                <span>Total transactions</span>
              </div>
            </div>

            <div className="sales-stat-card">
              <div className="sales-stat-icon orange">
                📦
              </div>

              <div>
                <p>Units Sold</p>
                <h2>{totalUnitsSold}</h2>
                <span>Total quantity sold</span>
              </div>
            </div>

            <div className="sales-stat-card">
              <div className="sales-stat-icon green">
                ✓
              </div>

              <div>
                <p>Products</p>
                <h2>{products.length}</h2>
                <span>Available products</span>
              </div>
            </div>
          </section>

          {/* CREATE SALE */}
          <section className="sales-card sales-form-card">
            <div className="sales-card-header">
              <div>
                <h2>Create Sale</h2>
                <p>
                  Record a new sale and update stock automatically.
                </p>
              </div>
            </div>

            <form
              className="sales-form"
              onSubmit={handleCreateSale}
            >
              <div className="sales-form-grid">
                <div className="sales-form-group">
                  <label>PRODUCT</label>

                  <select
                    value={productId}
                    onChange={handleProductChange}
                  >
                    <option value="">
                      Select product
                    </option>

                    {productOptions.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                        disabled={Number(product.stock) <= 0}
                      >
                        {product.name}
                        {product.sku
                          ? ` (${product.sku})`
                          : ""}
                        {` — Stock: ${product.stock}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sales-form-group">
                  <label>QUANTITY SOLD</label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter quantity"
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(event.target.value)
                    }
                  />

                  {selectedProduct && (
                    <span className="sales-field-hint">
                      Available stock: {selectedProduct.stock}
                    </span>
                  )}
                </div>

                <div className="sales-form-group">
                  <label>SELLING PRICE</label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Enter selling price"
                    value={sellingPrice}
                    onChange={(event) =>
                      setSellingPrice(event.target.value)
                    }
                  />
                </div>

                <div className="sales-total-box">
                  <span>Total Amount</span>
                  <strong>
                    ₹{totalAmount.toFixed(2)}
                  </strong>
                </div>
              </div>

              <div className="sales-form-footer">
                <span>
                  Sale date will be recorded automatically.
                </span>

                <button
                  type="submit"
                  className="sales-submit-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? "Creating Sale..."
                    : "Create Sale"}
                </button>
              </div>
            </form>
          </section>

          {/* SALES TABLE */}
          <section className="sales-card">
            <div className="sales-card-header">
              <div>
                <h2>Sales History</h2>
                <p>
                  View recorded sales and transaction details.
                </p>
              </div>

              <span className="sales-count">
                {filteredSales.length} Sales
              </span>
            </div>

            <div className="sales-table-header">
              <span>PRODUCT</span>
              <span>SKU</span>
              <span>QUANTITY</span>
              <span>PRICE</span>
              <span>TOTAL</span>
              <span>DATE</span>
            </div>

            {loading ? (
              <div className="sales-empty">
                <h3>Loading sales...</h3>
              </div>
            ) : filteredSales.length === 0 ? (
              <div className="sales-empty">
                <div className="sales-empty-icon">
                  ₹
                </div>

                {sales.length === 0 ? (
                  <>
                    <h3>No sales recorded yet</h3>
                    <p>
                      Create your first sale using the form above.
                    </p>
                  </>
                ) : (
                  <>
                    <h3>No matching sales found</h3>
                    <p>
                      Try a different product name or SKU.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="sales-table-body">
                {filteredSales.map((sale) => (
                  <div
                    className="sales-table-row"
                    key={sale.id}
                    onClick={() => openSale(sale)}
                  >
                    <span>{sale.product_name}</span>
                    <span>{sale.sku}</span>
                    <span>{sale.quantity}</span>
                    <span>₹{sale.selling_price}</span>
                    <span>₹{sale.total_amount}</span>
                    <span>{formatDate(sale.sale_date)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SALE DETAILS */}
          {selectedSale && (
            <section className="sales-card sales-details-card">
              <div className="sales-card-header">
                <div>
                  <h2>Sale Details</h2>
                  <p>
                    Transaction #{selectedSale.id}
                  </p>
                </div>

                <button
                  type="button"
                  className="sales-close-btn"
                  onClick={closeSaleDetails}
                >
                  ×
                </button>
              </div>

              <div className="sales-details-grid">
                <div>
                  <span>Product</span>
                  <strong>
                    {selectedSale.product_name}
                  </strong>
                </div>

                <div>
                  <span>SKU</span>
                  <strong>
                    {selectedSale.sku}
                  </strong>
                </div>

                <div>
                  <span>Quantity Sold</span>
                  <strong>
                    {selectedSale.quantity}
                  </strong>
                </div>

                <div>
                  <span>Selling Price</span>
                  <strong>
                    ₹{selectedSale.selling_price}
                  </strong>
                </div>

                <div>
                  <span>Total Amount</span>
                  <strong>
                    ₹{selectedSale.total_amount}
                  </strong>
                </div>

                <div>
                  <span>Sale Date</span>
                  <strong>
                    {formatDate(selectedSale.sale_date)}
                  </strong>
                </div>
              </div>
            </section>
          )}

          {/* INFORMATION CARDS */}
          <section className="sales-info-grid">
            <div className="sales-info-card">
              <div className="sales-info-icon purple">
                ₹
              </div>

              <div>
                <h3>Sales Tracking</h3>
                <p>
                  Record every product sale and keep a clear
                  transaction history.
                </p>
              </div>
            </div>

            <div className="sales-info-card">
              <div className="sales-info-icon orange">
                📦
              </div>

              <div>
                <h3>Automatic Stock Update</h3>
                <p>
                  Product inventory is reduced automatically
                  after a successful sale.
                </p>
              </div>
            </div>

            <div className="sales-info-card">
              <div className="sales-info-icon blue">
                📊
              </div>

              <div>
                <h3>Sales Summary</h3>
                <p>
                  Monitor total revenue, transactions and units
                  sold from one place.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Sales;