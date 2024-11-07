import { LightningElement, track, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import { updateRecord, deleteRecord } from 'lightning/uiRecordApi'; // Importing updateRecord
import STUDENT_CHANNEL from '@salesforce/messageChannel/StudentChannel__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const COLUMNS = [
    { label: 'Test Student Id', fieldName: 'Id', type: 'text' },
    { label: 'Name', fieldName: 'Name__c', type: 'text' },
    { label: 'DOB', fieldName: 'DOB__c', type: 'date' },
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

export default class RowtestStudentDatatable extends LightningElement {
    @track records = [];
    @track columns = COLUMNS;
    @track isModalOpen = false;
    @track editRecord = {};
    @track sexOptions = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' }
    ];
    @track languageOptions = [
        { label: 'English', value: 'English' },
        { label: 'Hindi', value: 'Hindi' }        
        // Add more language options as needed
    ];
    @track countryOptions = [
        { label: 'India', value: 'India' },
        { label: 'Spain', value: 'Spain' },
        { label: 'USA', value: 'USA' },
        { label: 'France', value: 'France' },
        { label: 'Australia', value: 'Australia' },
        { label: 'Italy', value: 'Italy' },
        { label: 'Germany', value: 'Germany' },
        { label: 'Vietnam', value: 'Vietnam' },
        { label: 'Japan', value: 'Japan' }
        // Add more country options as needed
    ];
    @track hobbiesOptions = [
        { label: 'Reading', value: 'Reading' },
        { label: 'Writing', value: 'Writing' },
        { label: 'Photography', value: 'Photography' },
        { label: 'Playing a Musical Instrument', value: 'Playing a Musical Instrument' },
        { label: 'Coding', value: 'Coding' },
        { label: 'Art and Craft', value: 'Art and Craft' },
        { label: 'Sports', value: 'Sports' },
        { label: 'Cooking or Baking', value: 'Cooking or Baking' },
        { label: 'Gardening', value: 'Gardening' },
        { label: 'Volunteering', value: 'Volunteering' }
        // Add more hobbies options as needed
    ];

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

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        switch (actionName) {
            case 'edit':
                this.openEditModal(row);
                break;
            case 'delete':
                this.deleteRecord(row);
                break;
            default:
                break;
        }
    }

    openEditModal(row) {
        this.editRecord = { ...row };
        this.isModalOpen = true;
    }

    handleInputChange(event) {
        const field = event.target.name;
        this.editRecord[field] = event.target.value;
    }

    saveChanges() {
        const fields = {};
        fields.Id = this.editRecord.Id;
        fields.Name__c = this.editRecord.Name__c;
        fields.DOB__c = this.editRecord.DOB__c;
        fields.Sex__c = this.editRecord.Sex__c;
        fields.Languages__c = this.editRecord.Languages__c;
        fields.Country__c = this.editRecord.Country__c;
        fields.Hobbies__c = this.editRecord.Hobbies__c;

        const recordInput = { fields };

        updateRecord(recordInput)
            .then(() => {
                this.records = this.records.map(record =>
                    record.Id === this.editRecord.Id ? { ...this.editRecord } : record
                );
                this.isModalOpen = false;
                this.showToast('Success', 'Record updated successfully', 'success');
            })
            .catch(error => {
                this.showToast('Error', `Error updating record: ${error.body.message}`, 'error');
                console.error('Error updating record:', error);
            });
    }

    closeModal() {
        this.isModalOpen = false;
    }

    deleteRecord(row) {
        this.records = this.records.filter(record => record.Id !== row.Id);
        this.showToast('Success', 'Record deleted successfully', 'success');
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}
