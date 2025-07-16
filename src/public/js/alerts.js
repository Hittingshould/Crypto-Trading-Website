export const hideAlert = () => {
  const el = document.querySelector(".alert");
  if (el) el.parentElement.removeChild(el);
};

//type is 'success', 'warning', 'danger', 'primary'
export const showAlert = (type, msg) => {
  hideAlert();
  const markup = `<div class="alert alert-${type} d-flex align-items-center" role="alert" style="position: fixed; top: 0; left: 50%; transform: translateX(-50%); z-index: 1055; margin-top: 10px;">
    <svg class="bi flex-shrink-0 me-2" width="24" height="24">
        <use xlink:href="#check-circle-fill" />
    </svg>
    <div>
        ${msg}
    </div>
</div>`;
document.body.insertAdjacentHTML("afterbegin", markup);
window.setTimeout(hideAlert, 2500);
};

export const showModal = (msg, index, selectType) => {
  const markup = `
    <div class="toast fade show align-items-center" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${msg}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `
  document.querySelector(`.trader-update-${selectType}-${index}`).insertAdjacentHTML("afterend", markup);
}

export const showEmailModal = (msg) => {
  const markup = `
    <div class="toast fade show align-items-center" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${msg}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `
  document.querySelector('#sendEmailButton').insertAdjacentHTML("afterend", markup);
}

export const accountFrozenModal = (msg) => {
  const markup = `
    <div class="toast fade show align-items-center" role="alert" aria-live="assertive" aria-atomic="true" style="position: fixed; top: 0; left: 50%; transform: translateX(-50%); z-index: 1055; margin-top: 10px;">
      <div class="d-flex">
        <div class="toast-body">
          ${msg}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("afterbegin", markup);
}


export const showWithdrawalEmailModal = (msg) => {
  const markup = `
    <div class="toast fade show align-items-center" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${msg}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `
  document.querySelector('#withdrawButton').insertAdjacentHTML("afterend", markup);
}

