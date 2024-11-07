import { LightningElement, track, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import { deleteRecord, updateRecord } from 'lightning/uiRecordApi';
import STUDENT_CHANNEL from '@salesforce/messageChannel/StudentChannel__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const COLUMNS = [
    { label: 'Name', fieldName: 'Name__c', type: 'text' },
    { label: 'Date of Birth', fieldName: 'DOB__c', type: 'date' },
    { label: 'Sex', fieldName: 'Sex__c', type: 'text' },
    { label: 'Languages', fieldName: 'Languages__c', type: 'text' },
    { label: 'Country', fieldName: 'Country__c', type: 'text' },
    { label: 'Hobbies', fieldName: 'Hobbies__c', type: 'text' },
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

export default class InlineStudentDisplay extends LightningElement {
    @track records = [];
    @track columns = COLUMNS;
    @track isEditing = false;
    @track editRecord = {};
    @track sexOptions = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' }
    ];
    @track languagesOptions = [
        { label: 'English', value: 'English' },
        { label: 'Hindi', value: 'Hindi' }
       
        // Add more languages as needed
    ];
    @track countryOptions = [
        { label: 'India', value: 'India' },
        { label: 'USA', value: 'USA' },
        { label: 'UK', value: 'UK' },
        { label: 'Canada', value: 'Canada' }
        // Add more countries as needed
    ];

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

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'edit':
                this.startEditRecord(row);
                break;
            case 'delete':
                this.deleteRecord(row);
                break;
            default:
        }
    }

    startEditRecord(row) {
        this.editRecord = { ...row };
        this.isEditing = true;
    }

    handleEditNameChange(event) {
        this.editRecord.Name__c = event.target.value;
    }

    handleEditDOBChange(event) {
        this.editRecord.DOB__c = event.target.value;
    }

    handleEditSexChange(event) {
        this.editRecord.Sex__c = event.target.value;
    }

    handleEditLanguagesChange(event) {
        this.editRecord.Languages__c = event.target.value;
    }

    handleEditCountryChange(event) {
        this.editRecord.Country__c = event.target.value;
    }

    handleEditHobbiesChange(event) {
        this.editRecord.Hobbies__c = event.target.value;
    }

    async saveChanges() {
        const fields = {
            Id: this.editRecord.Id,
            Name__c: this.editRecord.Name__c,
            DOB__c: this.editRecord.DOB__c,
            Sex__c: this.editRecord.Sex__c,
            Languages__c: this.editRecord.Languages__c,
            Country__c: this.editRecord.Country__c,
            Hobbies__c: this.editRecord.Hobbies__c
        };

        const recordInput = { fields };

        try {
            await updateRecord(recordInput);
            this.showToast('Success', 'Record updated successfully', 'success');
            this.records = this.records.map(record =>
                record.Id === this.editRecord.Id ? { ...record, ...fields } : record
            );
            this.isEditing = false;
        } catch (error) {
            this.showToast('Error', 'Error updating record', 'error');
            console.error('Error updating record:', error);
        }
    }

    cancelEdit() {
        this.isEditing = false;
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
