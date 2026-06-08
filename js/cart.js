import { readCart, updateCartCount } from "./utils/common.js";

updateCartCount();
const cart = readCart();
console.log(cart);
const cartList = document.querySelector(".cart-list");
const cartListHeader = cartList.querySelector(".cart-list-header");
const cartHTML = cart.map(
  item => `
  <article class="cart-item">
    <span class="item-check"><span class="check-box" aria-hidden="true"></span></span>
    <div class="cart-thumb">
      <img src="${item.thumb}" alt="${item.title}" />
    </div>
    <div class="cart-item-info">
      <h2>${item.title}</h2>
      <p>${item.brand || ""}</p>
      <strong>${item.qty}개</strong>
    </div>
    <div class="quantity-box" aria-label="수량">
      <button type="button" aria-label="수량 줄이기">-</button>
      <span>${item.qty}</span>
      <button type="button" aria-label="수량 늘리기">+</button>
    </div>
    <button type="button" class="remove-item" aria-label="${item.title} 삭제"></button>
  </article>
`,
);
cartListHeader.insertAdjacentHTML("afterend", cartHTML.join(""));
updateCartCount();
