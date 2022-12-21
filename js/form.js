const mainForm = document.querySelector(".form-add-life")
const cancelBtn = document.querySelector("#form-add-life__cancel")
const confirmBtn = document.querySelector("#form-add-life__confirm")
const popupVoucher = document.querySelector(".popop-voucher")
const btnPlayContinue = document.querySelector(".popop-voucher__btn--continue")
const btnCopyCode = document.querySelector(".popop-voucher__copy")
function openForm(){
    mainForm.classList.add("active")
}
function closeForm(){
    mainForm.classList.remove("active")
}


function openPopupVoucher(){
    popupVoucher.classList.add("active")
}
function closePopupVoucher(){
    popupVoucher.classList.remove("active")
}

btnCopyCode.addEventListener("click", function(){
    console.log(btnCopyCode.parentElement.querySelector("input"));
    var copyText = btnCopyCode.parentElement.querySelector("input");

  // Select the text field
  copyText.select();
  copyText.setSelectionRange(0, 99999); // For mobile devices

   // Copy the text inside the text field
  navigator.clipboard.writeText(copyText.value);
  
})

// countLife lớn hơn 2 thì popup form sẽ k hiện lên nữa
var countLife = 1;
// biến win để bk người chơi đã thắng r
var win = false;
// scrowwin là số điểm để chiến thắng
var scoreWin = 3000;
// là mạng hiện tại của người chơi khi chiến thắng
var currentLife;
// số mạng dc hồi sinh khi điền form
var addLife = 3;
