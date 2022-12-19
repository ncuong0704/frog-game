const mainForm = document.querySelector(".form-add-life")
const cancelBtn = document.querySelector("#form-add-life__cancel")
const confirmBtn = document.querySelector("#form-add-life__confirm")
const popupVoucher = document.querySelector(".popop-voucher")
const btnPlayContinue = document.querySelector(".popop-voucher__btn--continue")
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
// countLife lớn hơn 2 thì popup form sẽ k hiện lên nữa
var countLife = 1;
// biến win để bk người chơi đã thắng r
var win = false;
// scrowwin là số điểm để chiến thắng
var scoreWin = 500;
// là mạng hiện tại của người chơi khi chiến thắng
var currentLife;
// số mạng dc hồi sinh khi điền form
var addLife = 3;
