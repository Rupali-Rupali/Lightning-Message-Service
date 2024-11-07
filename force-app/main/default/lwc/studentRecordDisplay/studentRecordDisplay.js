import { LightningElement, track, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import STUDENT_CREATED_CHANNEL from '@salesforce/messageChannel/StudentCreatedChannel__c';

export default class StudentRecordDisplay extends LightningElement {
    @track records = [];
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
                STUDENT_CREATED_CHANNEL,
                (message) => this.handleMessage(message)
            );
        }
    }

    handleMessage(message) {
        const newRecord = {
            id: Date.now(), // Using a unique ID based on the current timestamp
            name: message.Name__c,
            dob: message.DOB__c,
            sex: message.Sex__c,
            languages: message.Languages__c,
            country: message.Country__c,
            hobbies: message.Hobbies__c
        };
        this.records = [...this.records, newRecord];
    }

    get columns() {
        return [
            { label: 'Name', fieldName: 'name' },
            { label: 'DOB', fieldName: 'dob' },
            { label: 'Sex', fieldName: 'sex' },
            { label: 'Languages', fieldName: 'languages' },
            { label: 'Country', fieldName: 'country' },
            { label: 'Hobbies', fieldName: 'hobbies' }
        ];
    }
}
