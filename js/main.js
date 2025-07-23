class MainApp {
    constructor() {
        this.modalsContainer = document.getElementById('modals-container');
    }
    
    showModal(title, content, buttons = []) {
        const modalId = 'modal-' + Date.now();
        
        const modalHTML = `
            <div class="modal" id="${modalId}">
                <div class="modal-content">
                    <span class="close-modal" onclick="mainApp.closeModal('${modalId}')">&times;</span>
                    <h3 class="modal-title">${title}</h3>
                    <div class="modal-body">${content}</div>
                    <div class="modal-actions">
                        ${buttons.map(btn => `
                            <button class="modal-btn ${btn.primary ? 'modal-btn-primary' : 'modal-btn-secondary'}" 
                                    onclick="${btn.onClick}">
                                ${btn.text}
                            </button>
                        `).join('')}
                        ${buttons.length === 0 ? `
                            <button class="modal-btn modal-btn-primary" 
                                    onclick="mainApp.closeModal('${modalId}')">
                                OK
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        this.modalsContainer.innerHTML += modalHTML;
        document.getElementById(modalId).style.display = 'flex';
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    }
    
    showError(message) {
        const modalId = 'modal-' + Date.now();
        this.showModal('Error', message, [
            { 
                text: 'OK', 
                primary: true, 
                onClick: `mainApp.closeModal('${modalId}')` 
            }
        ]);
    }
    
    showSuccess(message) {
        const modalId = 'modal-' + Date.now();
        this.showModal('Success', message, [
            { 
                text: 'OK', 
                primary: true, 
                onClick: `mainApp.closeModal('${modalId}')` 
            }
        ]);
    }
    
    showConfirmation(message, confirmCallback) {
        const modalId = 'modal-' + Date.now();
        this.showModal('Confirmation', message, [
            { 
                text: 'Cancel', 
                primary: false, 
                onClick: `mainApp.closeModal('${modalId}')` 
            },
            { 
                text: 'Confirm', 
                primary: true, 
                onClick: `${confirmCallback};mainApp.closeModal('${modalId}')` 
            }
        ]);
    }

    showLoading(message = 'Loading...') {
        const modalId = 'modal-' + Date.now();
        this.showModal('', `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `, []);
        return modalId;
    }

    hideLoading(modalId) {
        this.closeModal(modalId);
    }

    showForm(title, formHTML, submitCallback, cancelCallback = null) {
        const modalId = 'modal-' + Date.now();
        const buttons = [
            {
                text: 'Submit',
                primary: true,
                onClick: `${submitCallback};mainApp.closeModal('${modalId}')`
            }
        ];

        if (cancelCallback) {
            buttons.push({
                text: 'Cancel',
                primary: false,
                onClick: `${cancelCallback};mainApp.closeModal('${modalId}')`
            });
        } else {
            buttons.push({
                text: 'Cancel',
                primary: false,
                onClick: `mainApp.closeModal('${modalId}')`
            });
        }

        this.showModal(title, formHTML, buttons);
    }

    showTable(title, headers, data, actions = null) {
        let tableHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                            ${actions ? '<th>Actions</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr>
                                ${row.map(cell => `<td>${cell}</td>`).join('')}
                                ${actions ? `
                                    <td class="actions-cell">
                                        ${actions.map(action => `
                                            <button onclick="${action.onClick}" 
                                                    class="${action.primary ? 'primary-action' : 'secondary-action'}">
                                                ${action.text}
                                            </button>
                                        `).join('')}
                                    </td>
                                ` : ''}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        this.showModal(title, tableHTML, [
            {
                text: 'Close',
                primary: true,
                onClick: `mainApp.closeModal('modal-${Date.now()}')`
            }
        ]);
    }

    showAlert(title, message, type = 'info') {
        const icon = {
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌',
            success: '✅'
        }[type] || 'ℹ️';

        const modalId = 'modal-' + Date.now();
        this.showModal(title, `
            <div class="alert alert-${type}">
                <div class="alert-icon">${icon}</div>
                <div class="alert-message">${message}</div>
            </div>
        `, [
            {
                text: 'OK',
                primary: true,
                onClick: `mainApp.closeModal('${modalId}')`
            }
        ]);
    }
}

const mainApp = new MainApp();