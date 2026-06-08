import { addToCart, updateCartCount } from "./utils/common.js";

const detailImage = document.querySelector(".detail-image");
const thumbnailList = document.querySelector(".thumbnail-list");
const categoryText = document.querySelector(".detail-category");
const titleText = document.querySelector(".detail-title");
const ratingStars = document.querySelector(".rating-stars");
const ratingScore = document.querySelector(".rating-score");
const reviewCount = document.querySelector(".review-count");
const descriptionText = document.querySelector(".detail-description");
const priceText = document.querySelector(".detail-price");
const discountRate = document.querySelector(".discount-rate");
const brandText = document.querySelector(".detail-brand");
const stockText = document.querySelector(".detail-stock");
const shippingText = document.querySelector(".detail-shipping");
const returnText = document.querySelector(".detail-return");
const qtyInput = document.querySelector(".qty-input");
const qtyButtons = document.querySelectorAll(".qty-btn");
const cartButton = document.querySelector(".detail-cart-button");
const specGrid = document.querySelector(".spec-grid");
const reviewSummary = document.querySelector(".review-summary");
const reviewList = document.querySelector(".review-list");
const breadcrumbCurrent = document.querySelector(".breadcrumb-current");

let currentProduct = null;

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

function makeStars(rating) {
  const rounded = Math.round(rating);
  return "★★★★★".slice(0, rounded) + "☆☆☆☆☆".slice(0, 5 - rounded);
}

function setActiveImage(src, alt) {
  detailImage.src = src;
  detailImage.alt = alt;

  thumbnailList.querySelectorAll(".thumbnail-button").forEach(button => {
    button.classList.toggle("is-active", button.dataset.src === src);
  });
}

function renderGallery(product) {
  const images = product.images?.length ? product.images : [product.thumbnail];

  thumbnailList.innerHTML = images
    .map(
      (src, index) => `
        <button type="button" class="thumbnail-button ${index === 0 ? "is-active" : ""}" data-src="${src}" aria-label="상품 이미지 ${index + 1}">
          <img src="${src}" alt="">
        </button>
      `,
    )
    .join("");

  setActiveImage(images[0], product.title);
}

function renderSpecs(product) {
  const dimensions = product.dimensions
    ? `${product.dimensions.width} x ${product.dimensions.height} x ${product.dimensions.depth}`
    : "-";

  const specs = [
    ["SKU", product.sku],
    ["무게", `${product.weight} kg`],
    ["크기", dimensions],
    ["최소 주문", `${product.minimumOrderQuantity}개`],
  ];

  specGrid.innerHTML = specs
    .map(
      ([name, value]) => `
        <dl class="spec-item">
          <dt>${name}</dt>
          <dd>${value}</dd>
        </dl>
      `,
    )
    .join("");
}

function renderReviews(product) {
  const reviews = product.reviews || [];
  reviewSummary.textContent = `${reviews.length}개 리뷰`;
  reviewList.innerHTML = reviews
    .map(
      review => `
        <article class="review-card">
          <header>
            <strong>${review.reviewerName}</strong>
            <span>${makeStars(review.rating)} ${review.rating}.0</span>
          </header>
          <p>${review.comment}</p>
        </article>
      `,
    )
    .join("");
}

function renderProduct(product) {
  currentProduct = product;
  document.title = `ShopMall - ${product.title}`;
  breadcrumbCurrent.textContent = product.title;
  categoryText.textContent = product.category;
  titleText.textContent = product.title;
  ratingStars.textContent = makeStars(product.rating);
  ratingScore.textContent = product.rating.toFixed(2);
  reviewCount.textContent = `리뷰 ${product.reviews?.length || 0}개`;
  descriptionText.textContent = product.description;
  priceText.textContent = formatPrice(product.price);
  discountRate.textContent = `${product.discountPercentage}% OFF`;
  brandText.textContent = product.brand || "-";
  stockText.textContent = `${product.stock}개 (${product.availabilityStatus})`;
  shippingText.textContent = product.shippingInformation;
  returnText.textContent = product.returnPolicy;

  qtyInput.max = product.stock;
  renderGallery(product);
  renderSpecs(product);
  renderReviews(product);
}

function renderNotFound() {
  const container = document.querySelector(".detail-main .container");
  container.innerHTML = `
    <section class="empty-state">
      <h1>상품을 찾을 수 없습니다</h1>
      <p>요청한 상품 정보가 없거나 주소가 올바르지 않습니다.</p>
      <a href="./index.html" class="btn btn-primary">상품 목록으로 이동</a>
    </section>
  `;
}

async function fetchProduct() {
  try {
    const params = new URLSearchParams(window.location.search);
    const productId = Number(params.get("id")) || 1;
    const res = await fetch("./data/products.json");
    const data = await res.json();
    const product = data.products.find(item => item.id === productId);

    if (!product) {
      renderNotFound();
      return;
    }

    renderProduct(product);
  } catch (error) {
    console.error("상품 상세 정보를 불러오지 못했습니다.", error);
    renderNotFound();
  } finally {
    updateCartCount();
  }
}

thumbnailList.addEventListener("click", event => {
  const button = event.target.closest(".thumbnail-button");
  if (!button || !currentProduct) return;
  setActiveImage(button.dataset.src, currentProduct.title);
});

qtyButtons.forEach(button => {
  button.addEventListener("click", () => {
    const currentQty = Number(qtyInput.value) || 1;
    const maxQty = Number(qtyInput.max) || 99;
    const nextQty = button.dataset.action === "plus" ? currentQty + 1 : currentQty - 1;
    qtyInput.value = Math.min(Math.max(nextQty, 1), maxQty);
  });
});

qtyInput.addEventListener("change", () => {
  const maxQty = Number(qtyInput.max) || 99;
  const value = Number(qtyInput.value) || 1;
  qtyInput.value = Math.min(Math.max(value, 1), maxQty);
});

cartButton.addEventListener("click", () => {
  if (!currentProduct) return;

  for (let i = 0; i < (Number(qtyInput.value) || 1); i++) {
    addToCart(currentProduct);
  }
});

fetchProduct();
