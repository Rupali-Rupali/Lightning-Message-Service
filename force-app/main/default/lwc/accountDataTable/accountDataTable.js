import { LightningElement, track, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import ACCOUNT_CREATED_CHANNEL from '@salesforce/messageChannel/AccountCreatedChannel__c';
import { deleteRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name', type: 'text' },
    { label: 'Industry', fieldName: 'Industry', type: 'text' },
    { label: 'Phone', fieldName: 'Phone', type: 'phone' },
    {
        type: 'action',
        typeAttributes: {
            rowActions: [
                { label: 'Edit', name: 'edit' },
                { label: 'Delete', name: 'delete' }
            ]
        }
    }
];

export default class AccountDataTable extends LightningElement {
    @track records = [];
    @track columns = COLUMNS;
    subscription = null;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                ACCOUNT_CREATED_CHANNEL,
                (message) => this.handleMessage(message)
            );
        }
    }

    handleMessage(message) {
        const newRecord = {
            Id: message.Id, // Ensure Id is fetched correctly from message
            Name: message.Name,
            Industry: message.Industry,
            Phone: message.Phone
        };
        this.records = [newRecord, ...this.records];
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'edit':
                this.editRecord(row);
                break;
            case 'delete':
                this.deleteRecord(row);
                break;
            default:
        }
    }

    async editRecord(row) {
        const updatedName = prompt("Enter new name:", row.Name);
        const updatedIndustry = prompt("Enter new industry:", row.Industry);
        const updatedPhone = prompt("Enter new phone:", row.Phone);

        if (updatedName || updatedIndustry || updatedPhone) {
            const fields = {
                Id: row.Id,
                Name: updatedName ? updatedName : row.Name,
                Industry: updatedIndustry ? updatedIndustry : row.Industry,
                Phone: updatedPhone ? updatedPhone : row.Phone
            };

            const recordInput = { fields };

            try {
                await updateRecord(recordInput);
                this.showToast('Success', 'Record updated successfully', 'success');
                this.records = this.records.map(record =>
                    record.Id === row.Id ? { ...record, ...fields } : record
                );
            } catch (error) {
                this.showToast('Error', 'Error updating record', 'error');
                console.error('Error updating record:', error);
            }
        }
    }

    async deleteRecord(row) {
        try {
            await deleteRecord(row.Id);
            this.records = this.records.filter(record => record.Id !== row.Id);
            this.showToast('Success', 'Record deleted successfully', 'success');
        } catch (error) {
            this.showToast('Error', 'Error deleting record', 'error');
            console.error('Error deleting record:', error);
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
