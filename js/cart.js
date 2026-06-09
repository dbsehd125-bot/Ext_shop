import { readCart, writeCart, updateCartCount } from "./utils/common.js";

const cartList = document.querySelector(".cart-list");
const cartCountText = document.querySelector(".cart-count-text");
const selectAll = document.querySelector(".select-all");
const selectAllText = selectAll.querySelector("span");
const selectDeleteBtn = document.querySelector(".cart-list-header button");
const productAmount = document.querySelector(".order-row strong");
const totalAmount = document.querySelector(".order-total strong");

updateCartCount();

let cart = readCart();
let cartHTML = [];

//상품 개수 반영
function updateCartCountFx() {
  cartCountText.textContent = `총 ${cart.length}개의 상품`;
}
updateCartCountFx();

//상품금액, 결제금액 업데이트
function updateTotalAmount() {
  const sum = cart
    .reduce((acc, current) => acc + current.qty * current.price, 0)
    .toFixed(2);
  productAmount.textContent = `$${sum}`;
  totalAmount.textContent = `$${sum}`;
}
updateTotalAmount();

//이벤트(수량변경,삭제버튼)
cartList.addEventListener("click", e => {
  const cartItem = e.target.closest(".cart-item");
  if (!cartItem) return;
  const id = Number(cartItem.dataset.id);
  const targetItem = cart.find(item => item.id === id);

  if (e.target.closest(".minusBtn")) {
    if (targetItem.qty > 1) {
      targetItem.qty--;
      //로컬스토리지 저장
      saveCart();
      //화면 코드 생성
      renderCart();
    }
    return;
  }
  if (e.target.closest(".plusBtn")) {
    targetItem.qty++;
    //로컬스토리지 저장
    saveCart();
    //화면 코드 생성
    renderCart();
    return;
  }

  if (e.target.closest(".remove-item")) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
    return;
  }
});
//이벤트(체크시)
cartList.addEventListener("change", e => {
  if (e.target.matches(".cart-item input")) {
    updateSelectState();
  }
});

function updateSelectState() {
  const checkboxes = getCheckBoxes();

  const checkedCount = checkboxes.filter(checkbox => checkbox.checked).length;
  console.log(checkedCount);
  selectAllText.textContent = `전체선택 (${checkedCount}/${checkboxes.length})`;
  //모두 체크시, 전체선택부분 체크 true
  selectAll.querySelector("input").checked =
    checkedCount > 0 && checkedCount === checkboxes.length;
}

function renderCart() {
  //기존 항목 제거
  cartList.querySelectorAll(".cart-item").forEach(el => {
    el.remove();
  });
  cartHTML = [];
  console.log(cart);
  if (cart.length === 0) {
    cartHTML.push(
      `<article>
  장바구니가 비어있습니다.
</article>`,
    );
  } else {
    cartHTML = cart.map(
      item =>
        `<article class="cart-item" data-id="${item.id}">
        <label class="item-check">
          <input type="checkbox"/>               
        </label>    
  
        <div class="cart-thumb">
          <img
            src="${item.thumb}"
            alt="${item.title}"
          />
        </div>
        <div class="cart-item-info">
          <h2>${item.title}</h2>
          <p>브랜드명 | ${item.brand}</p>
          <strong>$${item.price}</strong>
        </div>
        <div class="quantity-box" aria-label="수량">
          <button class="minusBtn" type="button" aria-label="수량 줄이기" >-</button>
          <span>${item.qty}</span>
          <button class="plusBtn" type="button" aria-label="수량 늘리기">+</button>
        </div>
        <button type="button" class="remove-item" aria-label="${item.title} 삭제"></button>
      </article>
    `,
    );
  }
  // cartList.innerHTML += cartHTML.join("");
  cartList.insertAdjacentHTML("beforeend", cartHTML.join(""));
  updateSelectState();
}
renderCart();

function saveCart() {
  writeCart(cart);
  updateCartCount();
  updateTotalAmount();
  updateCartCountFx();
}

//선택 삭제
selectDeleteBtn.addEventListener("click", () => {
  const checkboxes = getCheckBoxes();
  const checkedIds = checkboxes
    .filter(checkbox => checkbox.checked)
    .map(checkbox => Number(checkbox.closest(".cart-item").dataset.id));
  console.log(checkedIds);
  cart = cart.filter(item => !checkedIds.includes(item.id));
  saveCart();
  renderCart();
});
function getCheckBoxes() {
  return [...cartList.querySelectorAll(".cart-item input")];
}

selectAll.addEventListener("change", e => {
  const checkboxes = getCheckBoxes();
  if (e.target.checked) {
    checkboxes.forEach(checkbox => (checkbox.checked = true));
  } else {
    checkboxes.forEach(checkbox => (checkbox.checked = false));
  }
  updateSelectState();
});
