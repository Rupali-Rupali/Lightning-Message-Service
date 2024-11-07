import { LightningElement, track, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import { updateRecord, deleteRecord } from 'lightning/uiRecordApi';
import STUDENT_CHANNEL from '@salesforce/messageChannel/StudentChannel__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const COLUMNS = [
    { label: 'Test Student Id', fieldName: 'Id', type: 'text', editable: false },
    { label: 'Name', fieldName: 'Name__c', type: 'text', editable: true },
    { label: 'DOB', fieldName: 'DOB__c', type: 'date', editable: true },
    { label: 'Sex', fieldName: 'Sex__c', type: 'picklist', editable: true, typeAttributes: { placeholder: 'Choose Sex', options: [ { label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' } ], value: { fieldName: 'Sex__c' } } },
    { label: 'Languages', fieldName: 'Languages__c', type: 'picklist', editable: true, typeAttributes: { placeholder: 'Choose Languages', options: [ { label: 'English', value: 'English' }, { label: 'Hindi', value: 'Hindi' }, { label: 'French', value: 'French' }, { label: 'Spanish', value: 'Spanish' } ], value: { fieldName: 'Languages__c' } } },
    { label: 'Country', fieldName: 'Country__c', type: 'picklist', editable: true, typeAttributes: { placeholder: 'Choose Country', options: [ { label: 'India', value: 'India' }, { label: 'USA', value: 'USA' }, { label: 'UK', value: 'UK' }, { label: 'Canada', value: 'Canada' } ], value: { fieldName: 'Country__c' } } },
    { label: 'Hobbies', fieldName: 'Hobbies__c', type: 'text', editable: true },
    {
        type: 'button-icon',
        fixedWidth: 50,
        typeAttributes: {
            iconName: 'utility:delete',
            name: 'delete',
            title: 'Delete',
            variant: 'border-filled',
            alternativeText: 'Delete'
        }
    }
];

export default class StudentDatatable extends LightningElement {
    @track records = [];
    @track columns = COLUMNS;
    @track draftValues = [];
    subscription = null;

    @wire(MessageContext) messageContext;

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                STUDENT_CHANNEL,
                (message) => this.handleMessage(message)
            );
        }
    }

    handleMessage(message) {
        const newRecord = {
            Id: message.Id,
            Name__c: message.Name__c,
            DOB__c: message.DOB__c,
            Sex__c: message.Sex__c,
            Languages__c: message.Languages__c,
            Country__c: message.Country__c,
            Hobbies__c: message.Hobbies__c
        };
        this.records = [newRecord, ...this.records];
    }

    handleSave(event) {
        const recordInputs = event.detail.draftValues.map(draft => {
            const fields = { ...draft };
            return { fields };
        });

        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(result => {
            this.showToast('Success', 'Records updated successfully!', 'success');
            this.draftValues = [];
            this.updateRecordsAfterSave(event.detail.draftValues);
        }).catch(error => {
            this.showToast('Error', `An error occurred while updating records: ${error.body.message}`, 'error');
            console.error('Error updating records:', error);
        });
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'delete') {
            this.deleteRow(row);
        }
    }

    deleteRow(row) {
        deleteRecord(row.Id)
            .then(() => {
                this.records = this.records.filter(record => record.Id !== row.Id);
                this.showToast('Success', 'Record deleted successfully!', 'success');
            })
            .catch(error => {
                this.showToast('Error', `An error occurred while deleting record: ${error.body.message}`, 'error');
                console.error('Error deleting record:', error);
            });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(evt);
    }

    fetchRecords() {
        this.records = [];
    }

    updateRecordsAfterSave(draftValues) {
        draftValues.forEach(draft => {
            const index = this.records.findIndex(record => record.Id === draft.Id);
            if (index !== -1) {
                this.records[index] = { ...this.records[index], ...draft };
            }
        });
        this.records = [...this.records]; // Trigger reactivity
    }
}
